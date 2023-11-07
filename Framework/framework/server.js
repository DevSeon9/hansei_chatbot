const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2'); // MySQL 모듈 추가
const app = express();

app.use(bodyParser.json());

// MySQL 연결 정보
const db = mysql.createConnection({
    host: 'localhost', // MySQL 호스트
    user: 'root', // MySQL 사용자 이름
    password: 'yourpassword', // MySQL 비밀번호
    database: 'yourdatabase' // 데이터베이스 이름
});

// GPT-3 API 키 설정
const OPENAI_API_KEY = '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';

// 프론트엔드에서 POST 요청을 받아 처리
app.post('/api/gpt', async (req, res) => {
    const { question } = req.body;

    try {
        const answer = await askGPT(question);

        // 백엔드에서 MySQL 데이터베이스에 데이터 삽입
        db.query('INSERT INTO questions (question, answer) VALUES (?, ?)', [question, answer], (err, result) => {
            if (err) {
                console.error('MySQL 오류:', err);
            } else {
                console.log('데이터 삽입 성공');
            }
        });

        res.json({ answer });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
