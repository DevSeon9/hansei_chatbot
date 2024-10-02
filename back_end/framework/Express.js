const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql');
const dotenv = require('dotenv');
require('dotenv').config();
const app = express();

// CORS 옵션 설정 (현준님 코드에서 가져옴)
const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL 연결 설정 (첫 번째 코드에서 가져옴)
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
let weatherData = [25.5, 60, 0.0, 15, 5];

// POST 엔드포인트: 아두이노에서 날씨 데이터 받기
app.post("/api/weather", (req, res) => {
  const data = req.body;
  // 이전 데이터를 새로운데이터로 대체
  weatherData[0] = data;
  res.status(200).send("Data received");
});

// 아두이노에서 날씨 정보를 받아 배열에 저장 (현준님 코드의 POST 엔드포인트)
app.post("/api/weather", (req, res) => {
  const data = req.body;
  weatherData.push(data);
  res.status(200).send("Data received");
});

// 기존 날씨 데이터 조회 기능 (첫 번째 코드의 GET 엔드포인트)
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

// Body-parser middleware
app.use(bodyParser.json());

// Dummy data loading for demonstration purposes
const askItems = require('./AskItem.json');
function convertMonthToNumber(monthString) {
  const monthMapping = {
    '1월': '01',
    '2월': '02',
    '3월': '03',
    '4월': '04',
    '5월': '05',
    '6월': '06',
    '7월': '07',
    '8월': '08',
    '9월': '09',
    '10월': '10',
    '11월': '11',
    '12월': '12',

  };

  return monthMapping[monthString] || monthString;
}
app.post('/api/db', (req, res) => {
  const userSelect = req.body.userSelect.key; // key 객체에서 값을 추출
  console.log('Received request data:', userSelect);

  // JSON 데이터에서 정보 추출 전 유효성 검사
  const itemKey = `item_${userSelect.itemNum}`;
  const contentKey = `content_${userSelect.contentNum}`;
  if (!askItems.item[itemKey] || !askItems.item[itemKey].content[contentKey]) {
    console.log('Invalid item or content key:', itemKey, contentKey);
    return res.status(400).json({ message: 'Invalid item or content key', serverResponse: null });
  }

  const contentArray = askItems.item[itemKey].content[contentKey];
  if (userSelect.contentArrayIndex >= contentArray.length) {
    console.log('Content array index out of bounds:', userSelect.contentArrayIndex);
    return res.status(400).json({ message: 'Content array index out of bounds', serverResponse: null });
  }

  const selectedContent = contentArray[userSelect.contentArrayIndex];
  console.log('Selected content:', selectedContent);

  // 추출된 내용을 기반으로 적절한 데이터베이스 쿼리를 생성
  let query;
  let queryParams;

  switch (userSelect.itemNum) {
    case 1: // "학사일정"에 대한 쿼리
      query = 'SELECT month, date, description FROM hansei_schedule WHERE month = ?';
      queryParams = [convertMonthToNumber(selectedContent)];
      break;

    case 2: // "교내 연락처"에 대한 쿼리
      // 부서 이름으로부터 department_id 가져오기
      const departmentQuery = 'SELECT department_id FROM departments WHERE department_name = ?';
      db.query(departmentQuery, [selectedContent], function(deptError, deptResults) {
        if (deptError) {
          console.error('Error fetching department:', deptError);
          return res.status(500).json({ message: 'Server error', serverResponse: null });
        }
        if (deptResults.length > 0) {
          const departmentId = deptResults[0].department_id;
          query = 'SELECT department_id, detail_name, phone_number FROM detailnum WHERE department_id = ?';
          queryParams = [departmentId];
          executeQuery(query, queryParams, res);
        } else {
          return res.status(404).json({ message: 'Department not found', serverResponse: null });
        }
      });
      return; // 비동기 처리로 인해 여기서 함수 실행을 멈춥니다.

    case 3: // "등록금 납부"에 대한 쿼리
      query = 'SELECT type_info, description FROM payment WHERE type_info LIKE ?';
      queryParams = [`%${selectedContent}%`];
      break;
    case 4: // "등록금 납부"에 대한 쿼리
      query = 'SELECT category, description FROM course_info WHERE category LIKE ?';
      queryParams = [`%${selectedContent}%`];
      break;

    case 5: // "장학 안내"에 대한 쿼리
      if (userSelect.contentNum === 1) {
        // 외부장학금 정보에 대한 쿼리
        query = 'SELECT city, corporation_name, inquiry_call, address_homepage, selection_target, payment_amount, application_date, note FROM external_scholarship WHERE city LIKE ?';
        queryParams = [`%${selectedContent}%`];
      } else {
        // 내부장학금 정보에 대한 쿼리
        query = 'SELECT type_info, payment_standard, note FROM internal_scholarship WHERE type_info LIKE ?';
        queryParams = [`%${selectedContent}%`];
      }
      break;
    case 6: // "졸업 안내"에 대한 쿼리
      if (userSelect.contentNum === 1) {
        // 학과별 졸업에 대한 쿼리
        query = 'SELECT 학과명, 졸업조건, 내용 FROM graduation_requirement WHERE 학과명 LIKE ?';
        queryParams = [`%${selectedContent}%`];
      } else {
        // 공통 조건 (학점)에 대한 쿼리
        query = 'SELECT 학과명, 졸업이수학점, 교양필수학점, 교양선택학점, 교양총합학점, 전공기초학점, 전공필수학점, 전공선택학점, 전공총합학점 FROM graduation_credits_2023'; // const를 제거
        queryParams = []; // 빈 배열을 할당하거나 이 부분을 완전히 생략
      }
      break;

    default:
      return res.status(400).json({ message: 'Invalid item selection', serverResponse: null });
  }

  // 쿼리 실행 함수
  function executeQuery(query, queryParams, response) {
    db.query(query, queryParams, function (error, results) {
      if (error) {
        console.error('Error while fetching data from DB:', error);
        response.status(500).json({ message: 'Server error', serverResponse: null });
        return;
      }
    
      console.log('Executed query:', query);
      console.log('Query params:', queryParams);
      console.log('Query results:', results);
    
      // 결과를 클라이언트에게 반환합니다.
      if (results.length > 0) {
        response.json({ message: 'SUCCESS', serverResponse: results });
      } else {
        console.log('No data found for the selected content:', selectedContent);
        response.status(404).json({ message: 'No data found for the selected content', serverResponse: null });
      }
    });
  }

  // case 2를 제외한 모든 쿼리에 대해 쿼리를 실행합니다.
  if (userSelect.itemNum !== 2) {
    executeQuery(query, queryParams, res);
  }
});


// 기본 경로 (현준님 코드에서 가져옴)
app.get("/", (req, res) => {
  res.send("Welcome to the Weather Server!");
});

