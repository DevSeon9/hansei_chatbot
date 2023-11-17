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

  const createCourseInfoTableQuery = `
    CREATE TABLE IF NOT EXISTS course_info (
      id INT AUTO_INCREMENT PRIMARY KEY,
      description TEXT NOT NULL
    )
  `;

  await db.execute(createCourseInfoTableQuery);
}

async function scrapeCourseInfo() {
  try {
    const URL =
      "https://graduate.hansei.ac.kr/graduated/641/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGZ3JhZHVhdGVkJTJGODUlMkYyMjcxMSUyRmFydGNsVmlldy5kbyUzRnBhZ2UlM0QxJTI2c3JjaENvbHVtbiUzRHNqJTI2c3JjaFdyZCUzRCVFQyU4OCU5OCVFQSVCMCU5NSVFQyU4QiVBMCVFQyVCMiVBRCUyNmJic0NsU2VxJTNEJTI2YmJzT3BlbldyZFNlcSUzRCUyNnJnc0JnbmRlU3RyJTNEJTI2cmdzRW5kZGVTdHIlM0QlMjZpc1ZpZXdNaW5lJTNEZmFsc2UlMjZwYXNzd29yZCUzRCUyNg%3D%3D";
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);

    const courseInfos = [];

    const excludedTexts = [
      "메뉴별소개글",
      "(즐겨찾는 메뉴는 최근 등록한 5개 메뉴가 노출됩니다)",
      "대 학 원 교 학 팀"
    ];

    $("p").each((index, element) => {
      const description = $(element).text().trim();
      if (description && !excludedTexts.includes(description)) {
        courseInfos.push({
          description: description
        });
      }
    });

    return courseInfos;
  } catch (error) {
    console.error("크롤링 중 에러 발생:", error);
    throw error;
  }
}

const insertCourseInfoQuery = `
    INSERT INTO course_info (description)
    VALUES (?)
    ON DUPLICATE KEY UPDATE
    description = VALUES(description)
`;

async function insertCourseInfo(data) {
  console.log("Starting insertCourseInfo");

  for (const item of data) {
    try {
      await db.execute(insertCourseInfoQuery, [item.description]);
    } catch (err) {
      console.error("데이터 삽입 중 에러 발생:", err);
    }
  }

  console.log("Finished insertCourseInfo");
}

async function runCrawlAndInsertCourseInfo() {
  try {
    const data = await scrapeCourseInfo();
    await insertCourseInfo(data);
  } catch (error) {
    console.error("크롤링 및 데이터 삽입 중 에러 발생:", error);
  }
}

// 이전 데이터 삭제 함수
async function deletePreviousCourseData() {
  try {
    await db.execute("DELETE FROM course_info");
    // AUTO_INCREMENT 값을 1로 재설정
    await db.execute("ALTER TABLE course_info AUTO_INCREMENT = 1");
    console.log("Previous year data deleted and ID reset successfully!");
  } catch (err) {
    console.error("Error deleting previous year data and resetting ID:", err);
  }
}

app.get("/update-hanseichatbot", async (req, res) => {
  console.log("Received request for /update-hanseichatbot");

  try {
    await deletePreviousCourseData();
    await runCrawlAndInsertCourseInfo();
    res.send("Course schedule info updated successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

cron.schedule("0 2 * * *", async () => {
  try {
    console.log("Starting scheduled task for course schedule update");
    await runCrawlAndInsertCourseInfo();
    console.log("Finished scheduled task for course schedule update");
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
