const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();

app.use(bodyParser.json());

// MySQL 연결 정보
const db = mysql.createConnection({
    host: 'localhost', // MySQL 호스트
    user: 'root', // MySQL 사용자 이름
    password: 'yourpassword', // MySQL 비밀번호
    database: 'yourdatabase' // 데이터베이스 이름
});

// API 엔드포인트: 사용자 질문 처리
app.post('/api/question', async (req, res) => {
    const { question } = req.body;

    try {
        // 질문을 데이터베이스에서 찾아 대답 얻기
        const answer = await getAnswerFromDB(question);

        // 대답을 반환
        if (answer) {
            res.json({ answer });
        } else {
            res.status(404).json({ error: 'Answer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while interacting with the database' });
    }
});

// 데이터베이스에서 대답을 가져오는 함수
async function getAnswerFromDB(question) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT answer FROM faq WHERE question = ?';
        db.query(query, [question], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0] ? results[0].answer : null);
            }
        });
    });
}

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
