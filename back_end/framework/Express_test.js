const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// 미세조정 모델의 이름
const fineTunedModelName = 'ft:gpt-3.5-turbo-0613:personal::8GIhhLfw';

// 기본 GPT-3 모델의 엔드포인트
const gptEndpoint = 'https://api.openai.com/v1/completions';

// OpenAI API 키
const apiKey = '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';

// GPT-3와 미세조정에 사용할 모델 선택
const modelToUse = process.env.USE_FINE_TUNED_MODEL === 'true' ? fineTunedModelName : 'text-davinci-003';

async function askGPT(userInput) {
  try {
    const response = await axios.post(
      gptEndpoint,
      {
        model: modelToUse,
        prompt: userInput,
        max_tokens: 200,
        temperature: 0.1,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const answer = response.data.choices[0].text;
    
    // 백엔드에서 서버 콘솔에 로그를 출력
    console.log('GPT 응답:', answer);
    console.log('질문:', userInput);
    return answer;
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

const port = 5000;
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
