import React from 'react';

import hanseiLogo from './image/hanseiLogo.jpg'; //한세대 로고
import hanseiLogoHover from './image/hanseiLogoHover.jpg'; //한세대 로고
import hanseiLogoClick from './image/hanseiLogoClick.jpg'; //한세대 로고
import menuButton from './image/menuButton.png'; // 우측상단 더보기버튼
import menuButtonHover from './image/menuButtonHover.png'; // 우측상단 더보기버튼
import menuButtonClick from './image/menuButtonClick.png'; // 우측상단 더보기버튼
import headerImg from './image/headerImg.png'; // 중앙 로고
import botAvatar from './image/testBotAvatar.jpg'; // 중앙 로고

import './App.css';
import AskedComponent from './component/AskedComponent.js';

import ChatBot from 'react-simple-chatbot'; // 챗봇 라이브러리
import {ThemeProvider} from 'styled-components'; // 스타일 삽입 라이브러리
import axios from 'axios'; // axios api통신 라이브러리

function App() {

  let userInput = ['default UI']; // 사용자 질문
  let serverResponse = ['default SR']; // gpt 답변

  let gptApiCall = async (userInput) => { // gpt답변 백엔드 통신
    await axios
    .post('http://localhost:5000/api/gpt', {
      userInput: userInput,
    })
    .then(response => {
      if (response.data.message === 'SUCCESS') {
        serverResponse = response.data.serverResponse;
        return 'success';
      } else {
        console.log("서버통신오류");
        serverResponse = ['서버통신오류'];
      }
    })
    .catch(error => {
      console.error('서버접속오류', error);
      serverResponse = ['서버접속오류'];
    });
  };

  let DBApiCall = async (userInput) => { // DB답변 백엔드 통신
    await axios
    .post('http://localhost:5000/api/DB', {
      userInput: userInput,
    })
    .then(response => {
      if (response.data.message === 'SUCCESS') {
        serverResponse = response.data.serverResponse;
        return 'success';
      } else {
        console.log("서버통신오류");
        serverResponse = ['서버통신오류'];
      }
    })
    .catch(error => {
      console.error('서버접속오류', error);
      serverResponse = ['서버접속오류'];
    });
  };

  const theme = { // 채팅창 스타일
    background: '#04447c',
    fontFamily: 'NanumGothic',
    botBubbleColor: '#FFFFFF',
    botFontColor: '#000000',
    userBubbleColor: '#FFFFFF',
    userFontColor: '#000000',
  };

  const steps = [ // 대화진행 표
    {
      id: 'start',
      message: '안녕하세요! 저는 한세대학교 챗봇서비스 한비입니다. 무엇이든 물어보세요!',
      trigger: 'component',
    },
    {
      id: 'component',
      component: (
        <AskedComponent/>
      ),
      trigger: 'userInput',
    },
    {
      id: 'userInput',
      user: true,
      trigger: (values) => {
        userInput.splice(0,1,values.value);
        console.log(`trigger userInput: ${userInput}`);
        console.log(`trigger serverResponse: ${serverResponse}`);
        gptApiCall(userInput);
        return 'waitting';
      },
    },
    {
      id: 'waitting',
      message: 'please waitting...',
      trigger: 'gptAnswer',
    },
    {
      id: 'gptAnswer',
      message: () => {
        console.log(`end userInput: ${userInput}`);
        console.log(`end serverResponse: ${serverResponse}`);
        return `${serverResponse}`;
      },
      trigger: 'userInput',
    },
    {
      id: 'end',
      message: 'end',
      end: true,
    },
  ];

  return (
    <div className="App">
      <header className="App-header">
        <a 
          href="https://www.hansei.ac.kr/" 
          target= '_blank' 
          className='HeaderSide-img'
          title= '한세대학교 사이트로 이동'
        >
          <img 
            src= {hanseiLogo}
            alt='hanseiLogo' 
            className="HeaderSide-img-n"
          />
          <img 
            src= {hanseiLogoHover}
            alt='hanseiLogo' 
            className="HeaderSide-img-h"
          />
          <img 
            src= {hanseiLogoClick}
            alt='hanseiLogo' 
            className="HeaderSide-img-c"
          />
          </a>
        <button // 해더 이미지
          onClick={() => window.location.reload()}
          className='header-logo'
          style={{border: 0}}
          title= '새로고침'
        >
          <img 
            src={headerImg} 
            alt='headerImg' 
            className="Header-logo" 
          />
        </button>
        <button // 메뉴버튼
          onClick={() => alert('버튼을 눌렀습니다.')}
          className='HeaderSide-img'
          title= '메뉴버튼'
          style={{border: 0}}
        >
          <img 
            src= {menuButton}
            alt='hanseiLogo' 
            className="HeaderSide-img-n"
          />
          <img 
            src= {menuButtonHover}
            alt='hanseiLogo' 
            className="HeaderSide-img-h"
          />
          <img 
            src= {menuButtonClick}
            alt='hanseiLogo' 
            className="HeaderSide-img-c"
          />
        </button>
      </header>    
      <ThemeProvider theme = {theme}>
        <ChatBot
          steps = {steps}
          hideUserAvatar = {true}
          hideHeader = {true}
          enableSmoothScroll = {true}
          enableMobileAutoFocus ={true}
          botAvatar = {botAvatar}
          position = {'relative'}
          width = {'100%'}
          height = {'100vh + 0px'}
          placeholder = {"질문을 입력하세요."}
          style = {{borderRadius: '0px 0px 10px 10px', margin: 0,}}
        />
      </ThemeProvider>
    </div>
  );
};

export default App;

 