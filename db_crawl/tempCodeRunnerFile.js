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

  const createExternalScholarshipTableQuery = `
  CREATE TABLE IF NOT EXISTS external_scholarship (
    id INT AUTO_INCREMENT PRIMARY KEY,
    corporation_name VARCHAR(20) NOT NULL,
    inquiry_call VARCHAR(30) NOT NULL,
    address_homepage VARCHAR(100) NOT NULL,
    selection_target VARCHAR(100) NOT NULL,
    payment_amount VARCHAR(15) NOT NULL,
    application_date VARCHAR(50) NOT NULL,
    note VARCHAR(40) NOT NULL
  )
`;

  await db.execute(createExternalScholarshipTableQuery);
}

async function scrapeExternalScholarship() {
  try {
    const URL = "https://portal.hansei.ac.kr/outsideScholarshipView.face";
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);
    const scholarshipData = [];

    $("tbody > tr").each((index, element) => {
      const tds = $(element).find("td");
      if (tds.length > 0) {
        const corporationName = $(tds[0]).text().trim();
        const inquiryCall = $(tds[1]).text().trim();
        const addressHomepage = $(tds[2]).text().trim();
        const selectionTarget = $(tds[3]).text().trim();
        const paymentAmount = $(tds[4]).text().trim();
        const applicationDate = $(tds[5]).text().trim();
        const note = $(tds[6]).text().trim();

        scholarshipData.push({
          corporationName,
          inquiryCall,
          addressHomepage,
          selectionTarget,
          paymentAmount,
          applicationDate,
          note
        });
      }
    });

    return scholarshipData;
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error;
  }
}

//외부장학금 데이터 삽입 코드
const insertExternalScholarshipQuery = `
  INSERT INTO internal_scholarship 
  (corporation_name, inquiry_call, address_homepage, selection_target, payment_amount, application_date, note) 
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

async function insertExternalScholarship(data) {
  console.log("Starting insertExternalScholarship");

  for (const item of data) {
    try {
      await db.execute(insertExternalScholarshipQuery, [
        item.corporationName,
        item.inquiryCall,
        item.addressHomepage,
        item.selectionTarget,
        item.paymentAmount,
        item.applicationDate,
        item.note
      ]);
    } catch (err) {
      console.error("데이터 삽입 중 에러 발생:", err);
    }
  }

  console.log("Finished insertExternalScholarship");
}

async function runCrawlAndInsertExternalScholarship() {
  try {
    // 외부 장학금 데이터 크롤링 및 삽입
    const externalScholarshipData = await scrapeExternalScholarship();
    await insertExternalScholarship(externalScholarshipData);
  } catch (error) {
    console.error("크롤링 및 데이터 삽입 중 에러 발생:", error);
  }
}

// 이전 데이터 삭제 함수
async function deletePreviousExternalScholarshipData() {
  try {
    await db.execute("DELETE FROM external_scholarship");
    // AUTO_INCREMENT 값을 1로 재설정
    await db.execute("ALTER TABLE external_scholarship AUTO_INCREMENT = 1");
    console.log("Previous year data deleted and ID reset successfully!");
  } catch (err) {
    console.error("Error deleting previous year data and resetting ID:", err);
  }
}

app.get("/update-hanseichatbot", async (req, res) => {
  console.log("Received request for /update-hanseichatbot");

  try {
    await deletePreviousExternalScholarshipData();
    await runCrawlAndInsertExternalScholarship();
    res.send("ExternalScholarship updated successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

cron.schedule("0 2 * * *", async () => {
  try {
    console.log(
      "Starting ExternalScholarship task for ExternalScholarship update"
    );
    await runCrawlAndInsertExternalScholarship();
    console.log(
      "Finished ExternalScholarship task for ExternalScholarship update"
    );
  } catch (error) {
    console.error("An error occurred during scheduled task:", error);
  }
});

// 서버 시작
const PORT = process.env.PORT || 3001;
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
