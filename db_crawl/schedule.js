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

  //학사정보 테이블 생성
  //PRIMARY KEY (month, date, description) 기본키 설정
  const createScheduleTableQuery = `
    CREATE TABLE IF NOT EXISTS hansei_schedule (
      month VARCHAR(255) NOT NULL,
      date VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      PRIMARY KEY (month, date, description) 
    )
  `;

  await db.execute(createScheduleTableQuery);
}

// 학사정보 크롤링 함수
async function scrapeUniversitySchedule() {
  console.log("Starting scrapeUniversitySchedule");

  try {
    const URL = "https://www.hansei.ac.kr/kor/302/subview.do";
    const response = await axios.get(URL);
    //원하는 내용만 파싱
    const $ = cheerio.load(response.data);

    const scheduleData = [];
    let currentMonth = "";
    // 월 찾기
    $("ul li").each((index, element) => {
      const month = $(element)
        .find("dt")
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .trim();
      if (month) currentMonth = month;
      // 일정 찾기
      $(element)
        .find("dl dd")
        .each((idx, eventElement) => {
          const dateRange = $(eventElement)
            .text()
            .match(/\d{2}-\d{2} ~ \d{2}-\d{2}/);
          const description = $(eventElement).find(".title a").text().trim();

          if (dateRange && description) {
            scheduleData.push({
              month: currentMonth,
              date: dateRange[0],
              description: description
            });
          }
        });
    });

    console.log("Finished scrapeUniversitySchedule");
    return scheduleData;
  } catch (error) {
    console.error("An error occurred while scraping:", error);
    throw error;
  }
}

// 데이터베이스에 학사정보 추가(이미 존재하는 경우 삽입하지 않음)
const scheduleQuery = `
INSERT INTO hansei_schedule (month, date, description) VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE month = VALUES(month), date = VALUES(date), description = VALUES(description)
`;

async function insertScheduleData(data) {
  console.log("Starting insertScheduleData");

  for (const item of data) {
    try {
      await db.execute(scheduleQuery, [
        item.month,
        item.date,
        item.description
      ]);
    } catch (err) {
      console.error("데이터 삽입 중 에러 발생:", err);
    }
  }

  console.log("Finished insertScheduleData");
}

// 이전 연도 데이터 삭제 함수
async function deletePreviousYearData() {
  try {
    await db.execute("DELETE FROM hansei_schedule");
    console.log("Previous year data deleted successfully!");
  } catch (err) {
    console.error("Error deleting previous year data:", err);
  }
}

app.get("/update-hanseichatbot", async (req, res) => {
  console.log("Received request for /update-hanseichatbot");

  try {
    //크롤링 시작 전 이전 연도 데이터 삭제
    await deletePreviousYearData();
    // 학사 정보 업데이트
    const scheduleData = await scrapeUniversitySchedule();
    if (scheduleData.length > 0) {
      await insertScheduleData(scheduleData);
      console.log("Schedule updated successfully!");
    } else {
      console.warn("No university schedule data found.");
    }

    res.send("Schedule info updated successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

// 매일 2시에 크롤링을 실행하도록 설정
cron.schedule("0 2 * * *", async () => {
  try {
    // 학사 정보 업데이트
    const scheduleData = await scrapeUniversitySchedule();
    if (scheduleData.length > 0) {
      await insertScheduleData(scheduleData);
      console.log("Schedule updated successfully!");
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
