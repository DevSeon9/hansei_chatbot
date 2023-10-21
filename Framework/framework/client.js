const fetch = require('node-fetch');

const question = 'What is the capital of France?';

fetch('http://localhost:3000/ask-gpt', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ question }),
})
  .then(response => response.json())
  .then(data => {
    console.log('GPT-3 응답:', data.answer);
  })
  .catch(error => {
    console.error('An error occurred:', error);
  });