const askGPT = require('./client'); // 클라이언트 코드 가져오기

// 테스트 케이스 1
askGPT('서울에는 어떤 과학 박물관이 있나요?')
  .then(answer => {
    console.log('답변1:', answer);
  })
  .catch(error => {
    console.error('에러', error);
  });

// 테스트 케이스 2
askGPT('오늘 날씨를 알려줘요')
  .then(answer => {
    console.log('답변2:', answer);
  })
  .catch(error => {
    console.error('에러', error);
  });