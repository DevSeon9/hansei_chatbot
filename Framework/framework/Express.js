const express = require('express');
const openai = require('openai');
require('dotenv').config(); // .env 파일 로드

const app = express();
const port = 3000;

app.use(express.json());

app.post('/generate-text', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.Completion.create({
      engine: "text-davinci-002",
      prompt: prompt,
      max_tokens: 50,
    });

    const generatedText = response.choices[0].text;
    res.json({ text: generatedText });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

