const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // cors 미들웨어 추가
const axios = require('axios');
const app = express();

app.use(bodyParser.json());
app.use(cors()); 

// ChatGPT 연동을 위한 함수
async function askGPT(question) {
  try {
    const response = await axios.post('https://api.openai.com/v1/fine-tuning/jobs', {
      prompt: question,
      max_tokens: 50,
      model: 'ft:gpt-3.5-turbo-0613:personal::8GIhhLfw',
      temperature: 0.1
    }, {
      headers: {
        'Authorization': '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'
      }
    });

    const answer = response.data.choices[0].text;
    return answer;
  } catch (error) {
    throw new Error('An error occurred while interacting with GPT-3.');
  }
}

app.post('/api/gpt', async (req, res) => {
  const { question } = req.body;

  try {
    const answer = await askGPT(question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'ChatGPT 오류' });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
