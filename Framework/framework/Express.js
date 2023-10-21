const express = require('express');
const axios = require('axios');
const app = express();

// OPENAI_API_KEY 를 환경 변수에서 가져오기
require('dotenv').config();

app.use(express.json());

app.post('/ask-gpt', async (req, res) => {
  const { question } = req.body;

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
    res.status(500).json({ error: error.message });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${process.env.OPENAI_API_KEY}`);
});
