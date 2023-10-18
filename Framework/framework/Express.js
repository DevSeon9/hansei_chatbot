const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

// OpenAI API 키 설정
const OPENAI_API_KEY = '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';

app.use(bodyParser.json());

// 클라이언트에서 POST 요청을 받는 엔드포인트
app.post('/ask-gpt', async (req, res) => {
  const { question } = req.body;

  // GPT-3에 질문 보내기
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
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// 서버 시작
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 클라이언트 코드 (예를 들어, 웹 브라우저에서 실행)
const fetch = require('node-fetch'); // Node.js에서 fetch 사용

const question = 'What is the capital of France?'; // 질문 내용

fetch('http://localhost:3000/ask-gpt', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ question }), // 질문을 서버에 보냄
})
  .then(response => response.json())
  .then(data => {
    console.log('GPT-3 응답:', data.answer); // GPT-3의 응답을 출력
  })
  .catch(error => {
    console.error('An error occurred:', error);
  });


