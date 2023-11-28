import axios from 'axios'; // axios api통신 라이브러리

export const gptApiCall = async (userInput) => { // gpt답변 백엔드 통신
  try {
    let response = await axios
    .post('http://localhost:5000/api/gpt', {
      userInput,
    });
    console.log("response server data : " + response.data.serverResponse);
    if (response.data.message === 'SUCCESS') {
      console.log('gptApiCall() api success');
      return response.data.serverResponse;
    } else {
      console.log('gptApiCall() api errror');
      return '통신 오류';
    }
  } catch (error) {
    console.error('서버 오류:', error);
    console.log('gptApiCall() server error');
    return '서버 오류';
  }
};

// export const dbApiCall = async (userInput) => { // db답변 백엔드 통신
//   try {
//     let response = await axios
//     .post('http://localhost:5000/api/gpt', {
//       userInput,
//     });
//     console.log("response server data : " + response.data.serverResponse);
//     if (response.data.message === 'SUCCESS') {
//       console.log('dbApiCall() api success');
//       return response.data.serverResponse;
//     } else {
//       console.log('dbApiCall() api errror');
//       return '통신 오류';
//     }
//   } catch (error) {
//     console.error('서버 오류:', error);
//     console.log('dbApiCall() server error');
//     return '서버 오류';
//   }
// };

