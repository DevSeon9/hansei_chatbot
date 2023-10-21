const axios = require('axios');

const OPENAI_API_KEY = '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'; // 여기에 올바른 API 키를 넣으세요

async function askGPT(question) {
  try {
    const requestBody = {
      prompt: question,
      max_tokens: 50, // 답변의 최대 토큰 수
      temperature: 0.7, // 다양성을 조절하는 옵션 (0.2부터 1.0까지 설정 가능)
    };

    const headers = {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', requestBody, { headers });

    const answer = response.data.choices[0].text;
    return answer;
  } catch (error) {
    console.error('An error occurred while interacting with GPT-3:', error);
    throw error; // 다시 에러를 던져서 호출하는 쪽에서 처리할 수 있도록 함
  }
}

module.exports = askGPT;


