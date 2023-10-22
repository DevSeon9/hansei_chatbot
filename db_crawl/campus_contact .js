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
    detail_name VARCHAR(5) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
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
    const URL = "https://mp.hansei.ac.kr:447/telephone"; // 웹 페이지 URL을 입력하세요.
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);

    const contactData = [];

    $("dl").each((index, element) => {
      const departmentName = $(element).find("dt").text().trim();

      $(element)
        .find("dd tbody tr")
        .each((idx, trElement) => {
          const detailName = $(trElement).find("td").first().text().trim();
          const phoneNumber = $(trElement).find("th").text().trim();

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

// 데이터베이스에 교내연락처 정보 추가
async function insertContactData(data) {
  console.log("Starting insertContactData");

  const departmentQuery =
    "INSERT INTO departments (department_name) VALUES (?) ON DUPLICATE KEY UPDATE department_id=LAST_INSERT_ID(department_id)";
  const personQuery =
    "INSERT INTO person (department_id, detail_name, phone_number) VALUES (LAST_INSERT_ID(), ?, ?)";

  const insertPromises = data.map((item) => {
    return new Promise(async (resolve, reject) => {
      // departments 테이블에 데이터 추가
      db.execute(departmentQuery, [item.department], function (err) {
        if (err) {
          console.error(
            "An error occurred while inserting department data:",
            err
          );
          return reject(err);
        }

        // detailnum 테이블에 데이터 추가
        db.execute(personQuery, [item.detail, item.phone], function (err) {
          if (err) {
            console.error(
              "An error occurred while inserting person data:",
              err
            );
            return reject(err);
          }
          resolve();
        });
      });
    });
  });

  await Promise.all(insertPromises);
  console.log("Finished insertContactData");
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
    res.send("Schedule and Contact info updated successfully!");
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
const PORT = process.env.PORT || 3000;
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
