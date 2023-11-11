const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: '127.0.0.1',
  port: '5000',
  user: 'root',
  password: '2486123',
  database: 'hansei_chatbot'
});

// DB에서 자주하는 질문과 대응하는 답변을 가져오는 함수
function getFAQAnswer(selectedQuestion, callback) {
  db.query('SELECT answer FROM faq WHERE question = ?', [selectedQuestion], (err, results) => {
    if (err) {
      console.error('MySQL 오류:', err);
      callback('DB 오류');
    } else if (results.length > 0) {
      const answer = results[0].answer;
      callback(answer);
    } else {
      callback('대응하는 답변을 찾을 수 없습니다.');
    }
  });
}

// 클라이언트 요청 분기 처리
app.get('/api/DB', (req, res) => {
  const selectedQuestion = req.query.selectedQuestion;

  getFAQAnswer(selectedQuestion, (answer) => {
    res.json({ answer });
  });
});

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
        'Authorization': `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`
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
