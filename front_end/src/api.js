import axios from 'axios'; // axios api통신 라이브러리

export const gptApiCall = async (userInput) => { // gpt답변 백엔드 통신
  try {
    let response = await axios
    .post('http://localhost:5000/api/gpt', {
      userInput,
    });
    console.log("response server data gpt : " + response.data.message);
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

export const dbApiCall = async (userSelect) => { // db답변 백엔드 통신
  try {
    let response = await axios
    .post('http://localhost:5000/api/db', {
      userSelect: {
        "name": "AskItem",
        "projectCall": "hanvi", // 프로젝트명, 데이터검증
        "key": {
          "itemNum": userSelect[0], // item_n의 n값
          "contentNum": userSelect[1], // content_n의 n값
          "contentArrayIndex": userSelect[2] // content_n의 배열 인덱스값
        }
      }
    });
    console.log("response server data db : " + response.data.message);
    if (response.data.message === 'SUCCESS') {
      console.log('dbApiCall() api success');
      return response.data.serverResponse;
    } else {
      console.log('dbApiCall() api errror');
      return '통신 오류';
    }
  } catch (error) {
    console.error('서버 오류:', error);
    console.log('dbApiCall() server error');
    return '서버 오류';
  }
};

export const weatherApiCall = async () => { // 날씨정보 업로드 통신
  try {
    let response = await axios
    .get('http://localhost:5000/api/weather', {
    });
    console.log("response server data weather : " + response.data.message);
    if (response.data.message === 'SUCCESS') {
      console.log('gptApiCall() api success');
      return response.data.serverResponse;
    } else {
      console.log('weatherApiCall() api errror');
      return ['통신 오류','통신 오류','통신 오류','통신 오류','통신 오류'];
    }
  } catch (error) {
    console.error('서버 오류:', error);
    console.log('weatherApiCall() server error');
    return ['서버 오류','서버 오류','서버 오류','서버 오류','서버 오류'];
  }
}