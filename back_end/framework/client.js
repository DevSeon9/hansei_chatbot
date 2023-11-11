const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const OPENAI_API_KEY = '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';

// 클라이언트 테스트 서버 라우트 설정
app.post('/test-ask-gpt', async (req, res) => {
  const { question } = req.body;

  try {
    const answer = await askGPT(question); // 클라이언트 코드를 통해 GPT-3 API 호출

    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

const testPort = 3001;
app.listen(testPort, () => {
  console.log(`Client test server is running on port ${testPort}`);
});

// askGPT 함수 정의
async function askGPT(question) {
  try {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
      prompt: question,
      max_tokens: 50,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    const answer = response.data.choices[0].text;
    return answer;
  } catch (error) {
    throw new Error('An error occurred while interacting with GPT-3.');
  }
}



// MySQL 연결
// db.connect((err) => {
//   if (err) {
//     console.error('MySQL 연결 실패: ' + err.stack);
//     return;
//   }
//   console.log('MySQL 연결 성공');
// });

// Express 애플리케이션에서 db 변수를 사용하여 MySQL에 쿼리를 실행할 수 있습니다.

