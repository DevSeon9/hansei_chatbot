//현준님 코드
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;

// CORS 옵션 설정
const corsOptions = {
  origin: "http://localhost:3000", // 프론트엔드 서버의 주소
  optionsSuccessStatus: 200 // 일부 레거시 브라우저에 대한 지원
};

app.use(cors(corsOptions)); // CORS 미들웨어 사용 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 샘플 데이터
let weatherData = [
  {
    temperature: 25.5,
    humidity: 60,
    precipitation: 0.0,
    fineDust: 15,
    harmfulGas: 5
  },
  {
    temperature: 26.0,
    humidity: 55,
    precipitation: 0.2,
    fineDust: 18,
    harmfulGas: 6
  }
];

// POST 엔드포인트: 아두이노에서 날씨 데이터 받기
app.post("/api/weather", (req, res) => {
  const data = req.body;
  weatherData.push(data);
  res.status(200).send("Data received");
});

// GET 엔드포인트: 저장된 날씨 데이터 반환
app.get("/api/weather", (req, res) => {
  res.status(200).json(weatherData);
});

// 기본 경로
app.get("/", (req, res) => {
  res.send("Welcome to the Weather Server!");
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});