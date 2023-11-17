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

  //교내 등록금납부 정보테이블 생성
  const createTuitionPaymentTableQuery = `
  CREATE TABLE IF NOT EXISTS payment(
    detailnum_id INT AUTO_INCREMENT PRIMARY KEY,
    type_info VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
)
`;

  await db.execute(createTuitionPaymentTableQuery);
}
async function scrapePaymentInfo() {
  try {
    const URL =
      "https://www.hansei.ac.kr/kor/1698/subview.do?enc=Zm5jdDF8QEB8JTJGcG9ydGFsQmJzJTJGa29yJTJGMTQlMkYxMTY5MDg2OTczMzA1NSUyRmFydGNsVmlldy5kbyUzRnBhZ2UlM0QxJTI2c3JjaENvbHVtbiUzRGJsdG5TdWJqJTI2c3JjaFdyZCUzRCVFQiU5MyVCMSVFQiVBMSU5RCVFQSVCOCU4OCUyNg%3D%3D";
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);

    const paymentInfos = [];
    let currentType = "";
    let lastDescription = ""; // 마지막으로 추가된 설명을 추적합니다.

    $("body")
      .find("span")
      .each((index, element) => {
        const text = $(element).text().trim();
        // 숫자로 시작하고 점(.)으로 끝나는 패턴을 찾음
        if (/^\d+\./.test(text)) {
          currentType = text;
          paymentInfos.push({ type_info: text, descriptions: [] });
          lastDescription = ""; // 새로운 type_info가 시작될 때 lastDescription을 초기화합니다.
        } else if (
          currentType &&
          (/^[가-힣]\./.test(text) || /^-/.test(text)) &&
          text !== lastDescription // 같은 설명이 아니면 추가합니다.
        ) {
          paymentInfos[paymentInfos.length - 1].descriptions.push(text);
          lastDescription = text; // 마지막으로 추가된 설명을 업데이트합니다.
        }
      });

    return paymentInfos;
  } catch (error) {
    console.error("크롤링 중 에러 발생:", error);
    throw error;
  }
}

const insertTuitionPaymentInfoQuery = `
  INSERT INTO payment(type_info, description) VALUES (?, ?)
`;

async function insertPaymentInfo(paymentInfos) {
  console.log("Starting insertTuitionPaymentInfo");

  for (const paymentInfo of paymentInfos) {
    for (const description of paymentInfo.descriptions) {
      try {
        await db.execute(insertTuitionPaymentInfoQuery, [
          paymentInfo.type_info,
          description
        ]);
      } catch (err) {
        console.error("데이터 삽입 중 에러 발생:", err);
      }
    }
  }

  console.log("Finished insertTuitionPaymentInfo");
}

async function runCrawlAndInsertPaymentInfo() {
  try {
    const data = await scrapePaymentInfo();
    await insertPaymentInfo(data);
  } catch (error) {
    console.error("크롤링 및 데이터 삽입 중 에러 발생:", error);
  }
}

// 이전 데이터 삭제 함수
async function deletePreviousPaymentInfoData() {
  try {
    await db.execute("DELETE FROM payment");
    // AUTO_INCREMENT 값을 1로 재설정
    await db.execute("ALTER TABLE payment AUTO_INCREMENT = 1");
    console.log("Previous year data deleted and ID reset successfully!");
  } catch (err) {
    console.error("Error deleting previous year data and resetting ID:", err);
  }
}

app.get("/update-hanseichatbot", async (req, res) => {
  console.log("Received request for /update-hanseichatbot");

  try {
    await deletePreviousPaymentInfoData();
    await runCrawlAndInsertPaymentInfo();
    res.send("tuition_payment updated successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

cron.schedule("0 2 * * *", async () => {
  try {
    console.log("Starting scheduled task for tuition_payment update");
    await runCrawlAndInsertPaymentInfo();
    console.log("Finished scheduled task for tuition_payment update");
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
