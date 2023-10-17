const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

const KAKAO_API_URL = 'https://kapi.kakao.com/v1/plusfriend/messages/send';

app.use(bodyParser.json());

app.post('/kakao-webhook', async (req, res) => {
  const { user_key, type, content } = req.body;

  // 카카오톡 메시지 처리 로직을 작성

  const responseMessage = '카카오톡 챗봇 응답 메시지';

  // 카카오톡 챗봇 응답
  const response = await axios.post(KAKAO_API_URL, {
    user_key,
    content: responseMessage,
  });

  res.status(200).send('OK');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

