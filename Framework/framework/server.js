const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

// GPT-3 API 키 설정
const OPENAI_API_KEY = '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';

// 프론트엔드에서 POST 요청을 받아 처리
app.post('/ask-gpt', async (req, res) => {
  const { question } = req.body;

  try {
    const answer = await askGPT(question); // 클라이언트 코드를 통해 GPT-3 API 호출

    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
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

