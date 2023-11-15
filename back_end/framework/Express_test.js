const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const OPENAI_API_KEY = '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'; // 수정 필요
const ENGINE_ID = 'text-davinci-002'; // 또는 원하는 엔진 ID로 변경

async function askGPT(userInput) {
  try {
    const response = await axios.post(
      `https://api.openai.com/v1/engines/${ENGINE_ID}/completions`,
      {
        prompt: userInput,
        max_tokens: 50,
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const answer = response.data.choices[0].text;
    return answer;
  } catch (error) {
    console.error('An error occurred while interacting with GPT-3:', error.response ? error.response.data : error.message);
    throw new Error('An error occurred while interacting with GPT-3.');
  }
}

app.post('/api/gpt', async (req, res) => {
  const { userInput } = req.body;

  try {
    const answer = await askGPT(userInput);
    res.json({ message: 'SUCCESS', serverResponse: answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'FAILURE', error: 'ChatGPT 오류' });
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
  console.log(`Server is running on port ${port}`);
});
