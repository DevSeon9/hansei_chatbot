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

  const createInternalScholarshipTableQuery = `
  CREATE TABLE IF NOT EXISTS internal_scholarship (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_info VARCHAR(200) NOT NULL,
    payment_standard TEXT NOT NULL,
    note TEXT NOT NULL
  )
`;
  const createScholarshipCriteriaTableQuery = `
  CREATE TABLE IF NOT EXISTS scholarship_criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_info VARCHAR(200) NOT NULL,
    payment_standard TEXT NOT NULL,
    amount TEXT NOT NULL
  )
`;

  await db.execute(createInternalScholarshipTableQuery);
  await db.execute(createScholarshipCriteriaTableQuery);
}

async function scrapeInternalScholarship() {
  try {
    const URL = "https://www.hansei.ac.kr/kor/312/subview.do";
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);
    const targetSection = $("#menu312_obj1857");

    const scholarshipData = [];
    targetSection.find("table tbody tr").each((index, element) => {
      const row = $(element).find("td");
      // 번호 열을 제외하고 장학종류, 지급 및 선발기준, 비고 열만 추출
      const scholarshipType = $(row[1]).text().trim();
      const criteriaAndPayment = $(row[2]).text().trim();
      const remarks = $(row[3]).text().trim();

      scholarshipData.push({
        scholarshipType,
        criteriaAndPayment,
        remarks
      });
    });

    return scholarshipData;
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error;
  }
}
async function scrapeScholarshipCriteria() {
  try {
    const URL = "https://www.hansei.ac.kr/kor/312/subview.do";
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);
    const targetSection = $("#menu312_obj1858");

    const criteriaData = [];
    targetSection.find("table tbody tr").each((index, element) => {
      const row = $(element).find("td");
      // 번호 열을 제외하고 장학종류, 지급 및 선발기준, 지급기준 열만 추출
      const scholarshipType = $(row[1]).text().trim();
      const criteriaAndPayment = $(row[2]).text().trim();
      const paymentAmount = $(row[3]).text().trim();

      criteriaData.push({
        scholarshipType,
        criteriaAndPayment,
        paymentAmount
      });
    });

    return criteriaData;
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error;
  }
}
//교내장학금 데이터 삽입 코드
const insertInternalScholarshipQuery = `
  INSERT INTO internal_scholarship (장학종류, \`지급및선발기준\`, 비고)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE
  장학종류 = VALUES(장학종류), \`지급및선발기준\` = VALUES(\`지급및선발기준\`), 비고 = VALUES(비고)
`;
//교내장학금 지급기준 데이터 삽입 코드
const insertScholarshipCriteriaQuery = `
  INSERT INTO scholarship_criteria (장학종류, \`지급및선발기준\`, 지급금액)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE
  장학종류 = VALUES(장학종류), \`지급및선발기준\` = VALUES(\`지급및선발기준\`), 지급금액 = VALUES(지급금액)
`;

async function insertInternalScholarship(data) {
  console.log("Starting insertInternalScholarship");

  for (const item of data) {
    try {
      await db.execute(insertInternalScholarshipQuery, [
        item.scholarshipType,
        item.criteriaAndPayment,
        item.remarks
      ]);
    } catch (err) {
      console.error("데이터 삽입 중 에러 발생:", err);
    }
  }

  console.log("Finished insertInternalScholarship");

}

async function insertScholarshipCriteria(data) {
  console.log("Starting insertScholarshipCriteria");

  for (const item of data) {
    try {
      await db.execute(insertScholarshipCriteriaQuery, [
        item.scholarshipType,
        item.criteriaAndPayment,
        item.paymentAmount
      ]);
    } catch (err) {
      console.error("데이터 삽입 중 에러 발생:", err);
    }
  }

  console.log("Finished insertScholarshipCriteria");
}

async function runCrawlAndInsertInternalScholarship() {
  try {
    // 교내 장학금 데이터 크롤링 및 삽입
    const internalScholarshipData = await scrapeInternalScholarship();
    await insertInternalScholarship(internalScholarshipData);

    // 장학금 지급기준 데이터 크롤링 및 삽입
    const scholarshipCriteriaData = await scrapeScholarshipCriteria();
    await insertScholarshipCriteria(scholarshipCriteriaData);
  } catch (error) {
    console.error("크롤링 및 데이터 삽입 중 에러 발생:", error);
  }
}

// 이전 데이터 삭제 함수
async function deletePreviousInternalScholarshipData() {
  try {
    await db.execute("DELETE FROM internal_scholarship");
    // AUTO_INCREMENT 값을 1로 재설정
    await db.execute("ALTER TABLE internal_scholarship AUTO_INCREMENT = 1");
    console.log("Previous year data deleted and ID reset successfully!");
  } catch (err) {
    console.error("Error deleting previous year data and resetting ID:", err);
  }
}

app.get("/update-hanseichatbot", async (req, res) => {
  console.log("Received request for /update-hanseichatbot");

  try {
    await deletePreviousInternalScholarshipData();
    await runCrawlAndInsertInternalScholarship();
    res.send("InternalScholarship updated successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

cron.schedule("0 2 * * *", async () => {
  try {
    console.log(
      "Starting InternalScholarship task for InternalScholarship update"
    );
    await runCrawlAndInsertInternalScholarship();
    console.log(
      "Finished InternalScholarship task for InternalScholarship update"
    );
  } catch (error) {
    console.error("An error occurred during scheduled task:", error);
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
