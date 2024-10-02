const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const mysql = require("mysql2/promise");
const app = express();

require("dotenv").config();

// MySQL 데이터베이스 연결 설정
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbConfig = {
  host: dbHost,
  user: dbUser,
  password: dbPass,
  database: "hansei_chatbot"
};

// 데이터베이스 연결 및 테이블 초기화
let db;

async function initializeDatabase() {
  db = await mysql.createConnection(dbConfig);
  console.log("MySQL 연결완료");

  //교내 부서 정보테이블 생성
  const createDepartmentsTableQuery = `
CREATE TABLE IF NOT EXISTS departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL UNIQUE
)
`;

  //교내 부서연락처 정보테이블 생성
  const createDetailNumTableQuery = `
  CREATE TABLE IF NOT EXISTS detailnum(
    detailnum_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT,
    detail_name VARCHAR(20) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
)
`;

  await db.execute(createDepartmentsTableQuery);
  await db.execute(createDetailNumTableQuery);
}
// 교내연락처정보 크롤링
async function scrapeContactInfo() {
  console.log("Starting scrapeContactInfo");

  try {
    const URL = "https://mp.hansei.ac.kr:447/telephone";
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);

    const contactData = [];

    $("dl").each((index, element) => {
      const departmentName = $(element).find("dt").text().trim();

      $(element)
        .find("dd tbody tr")
        .each((idx, trElement) => {
          const detailName = $(trElement).find("th").first().text().trim();
          const phoneNumber = $(trElement).find("td a").text().trim();
          contactData.push({
            department: departmentName,
            detail: detailName,
            phone: phoneNumber
          });
        });
    });

    console.log("Finished scrapeContactInfo");
    return contactData;
  } catch (error) {
    console.error("An error occurred while scraping:", error);
    throw error;
  }
}
// 부서 이름을 삽입하는 쿼리 (이미 존재하는 경우 삽입하지 않음)
const departmentQuery = `
INSERT INTO departments (department_name) VALUES (?)
ON DUPLICATE KEY UPDATE department_name = VALUES(department_name)
`;

// 세부 연락처 정보를 삽입하는 쿼리
const detailNumQuery = `
INSERT INTO detailnum (department_id, detail_name, phone_number) VALUES (?, ?, ?)
`;

// 데이터베이스에 교내연락처 정보 추가
async function insertContactData(data) {
  console.log("Starting insertContactInfo");

  for (const item of data) {
    try {
      // 부서 데이터를 삽입하고 department_id를 가져옵니다.
      const [departmentResult] = await db.execute(departmentQuery, [
        item.department
      ]);
      let departmentId;
      if (departmentResult.insertId) {
        departmentId = departmentResult.insertId;
      } else {
        // 부서가 이미 존재한다면, 해당 부서의 ID를 가져옵니다.
        const [existingDepartment] = await db.query(
          "SELECT department_id FROM departments WHERE department_name = ?",
          [item.department]
        );
        departmentId = existingDepartment[0].department_id;
      }

      // 세부 연락처 정보를 확인하고 데이터베이스에 없다면 삽입하거나 업데이트 합니다.
      const [existingDetail] = await db.query(
        "SELECT * FROM detailnum WHERE department_id = ? AND detail_name = ?",
        [departmentId, item.detail]
      );

      if (existingDetail.length === 0) {
        await db.execute(detailNumQuery, [
          departmentId,
          item.detail,
          item.phone
        ]);
      } else if (existingDetail[0].phone_number !== item.phone) {
        await db.execute(
          "UPDATE detailnum SET phone_number = ? WHERE detailnum_id = ?",
          [item.phone, existingDetail[0].detailnum_id]
        );
      }
    } catch (err) {
      console.error("데이터 삽입 중 에러 발생:", err);
    }
  }

  console.log("Finished insertContactInfo");
}

app.get("/update-hanseichatbot", async (req, res) => {
  console.log("Received request for /update-hanseichatbot");

  try {
    // 교내 연락처 정보 업데이트
    const contactData = await scrapeContactInfo();
    if (contactData.length > 0) {
      await insertContactData(contactData);
      console.log("Contact info updated successfully!");
    } else {
      console.warn("No contact data found.");
    }
    res.send("Contact info updated successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

// 매일 2시에 크롤링을 실행하도록 설정
cron.schedule("0 2 * * *", async () => {
  try {
    // 교내 연락처 정보 업데이트
    const contactData = await scrapeContactInfo();
    if (contactData.length > 0) {
      await insertContactData(contactData);
      console.log("Contact info updated successfully!");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

// 서버 시작
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`Server is running on port ${PORT}`);
});
// 서버 종료 시 이벤트 핸들러
process.on("SIGINT", async () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  // MySQL 데이터베이스 연결 종료
  if (db) {
    await db.close();
    console.log("MySQL database connection closed.");
  }

  // 서버 종료
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
