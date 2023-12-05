const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql');
const dotenv = require('dotenv');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

// MySQL 연결 설정
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// MySQL 연결 시도
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류:', err.message);
  } else {
    console.log('MySQL 연결 성공');
    // 서버 실행 코드는 연결 성공한 경우에만 실행
    const port = 5000;
    app.listen(port, () => {
      console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    });
  }
});

// 날씨 정보를 저장할 배열
let weatherData = [];

// 10초마다 아두이노로부터 날씨 정보를 받아 배열에 저장
setInterval(() => {
  // 아두이노에서 날씨 정보를 가져오는 로직을 여기에 추가

  // 임의로 날씨 데이터 생성 (테스트용)
  const newWeatherInfo = {
    temperature: Math.random() * 30 + 10,
    humidity: Math.random() * 50 + 30,
    // 여기에 필요한 다른 날씨 정보 추가
  };

  // 배열에 추가
  weatherData.push(newWeatherInfo);
}, 10000); // 10초마다 실행

// /api/weather 엔드포인트에 GET 요청이 오면 저장된 날씨 데이터를 응답
app.get('/api/weather', (req, res) => {
  res.json({ message: 'SUCCESS', weatherData });
});

// 미세조정 모델의 이름
const fineTunedModelName = 'ft:gpt-3.5-turbo-0613:personal::8H1tNC8D';

// 기본 GPT-3 모델의 엔드포인트
const gptEndpoint = 'https://api.openai.com/v1/chat/completions';

// OpenAI API 키
const apiKey = process.env.OPENAI_API_KEY;

// GPT-3와 미세조정에 사용할 모델 선택
const modelToUse = process.env.USE_FINE_TUNED_MODEL === 'true' ? fineTunedModelName : 'ft:gpt-3.5-turbo-0613:personal::8H1tNC8D';

async function askGPT(userInput) {
  try {
    const response = await axios.post(
      gptEndpoint,
      {
        model: modelToUse,
        messages: [
          { role: 'system', content: '당신은 한세대 챗봇입니다 친절하게 답변해주세요' },
          { role: 'user', content: userInput },
        ],
        max_tokens: 300,
        temperature: 0.1,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Raw GPT-3 API Response:', response.data);

    const choices = response.data.choices;
    
    if (choices && choices.length > 0 && choices[0].message && choices[0].message.content) {
      const answer = choices[0].message.content;

      // 백엔드에서 서버 콘솔에 로그를 출력
      console.log('GPT 응답:', answer);
      console.log('질문:', userInput);
      return answer;
    } else {
      throw new Error('GPT-3 API에서 올바른 응답을 받지 못했습니다.');
    }
  } catch (error) {
    console.error('GPT-3와 상호 작용 중 오류 발생:', error.response ? error.response.data : error.message);
    throw new Error('GPT-3와 상호 작용 중 오류가 발생했습니다.');
  }
}

app.post('/api/gpt', async (req, res) => {
  const { userInput } = req.body;

  try {
    const answer = await askGPT(userInput);
    res.json({ message: 'SUCCESS', serverResponse: answer });
    console.log('응답:', answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '실패', serverResponse: null });
  }
});

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
