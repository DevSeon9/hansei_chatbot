import React from 'react';

import hanseiLogo from './image/hanseiLogo.jpg'; //한세대 로고
import menuButton from './image/menuButton.png'; // 우측상단 더보기버튼
import headerImg from './image/headerImgDemo.png'; // 중앙 로고

import './App.css';
import AskedComponent from './AskedComponent.js';

import ChatBot from 'react-simple-chatbot'; // 챗봇 라이브러리
import {ThemeProvider} from 'styled-components'; // 스타일 삽입 라이브러리
import axios from 'axios'; // axios api통신 라이브러리

function App() {

  let userInput = ['default UI']; // 사용자 질문
  let serverResponse = ['default SR']; // gpt 답변

  let gptApiCall = (userInput) => { // gpt답변 백엔드 통신
    axios
    .post('http://localhost:5000/api/gpt', {
      userInput: userInput,
    })
    .then(response => {
      if (response.data.message === 'SUCCESS') {
        serverResponse = response.data.serverResponse;
        return 'success';
      } else {
        console.log("오류발생 else");
      }
    })
    .catch(error => {
      console.error('데이터 전송중 오류 catch', error);
      alert('오류발생 catch');
    });
  };

  let DBApiCall = (userInput) => { // DB답변 백엔드 통신
    axios
    .post('http://localhost:5000/api/DB', {
      userInput: userInput,
    })
    .then(response => {
      if (response.data.message === 'SUCCESS') {
        serverResponse = response.data.serverResponse;
        return 'success';
      } else {
        console.log("오류발생 else");
      }
    })
    .catch(error => {
      console.error('데이터 전송중 오류 catch', error);
      alert('오류발생 catch');
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
      message: '안녕하세요! 저는 Hansei Chatbot입니다. 궁금한내용을 질문해주세요!',
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
        <img 
          src={hanseiLogo} 
          alt='hanseiLogo' 
          className="HeaderSide-img"
        />
        <img 
          src={headerImg} 
          alt='headerImg' 
          className="Header-logo" 
          style={{height: '8vh',}}
        />
        <button // 메뉴버튼
          onClick="" 
          style={{
            width: '8vh', 
            height: '8vh', 
            border: 'none', 
            position: 'relative',
          }}
        >
          <img 
            src={menuButton} 
            alt='menuButton' 
            className="HeaderSide-img" 
            style={{position: 'absolute', top: '0', left: '0'}}
          />
        </button>
      </header>    
      <ThemeProvider theme = {theme}>
        <ChatBot
          steps = {steps}
          hideUserAvatar = {true}
          hideHeader = {true}
          position = {'relative'}
          width = {'100%'}
          height = {'92vh'}
          placeholder = {"질문을 입력하세요."}
        />
      </ThemeProvider>
    </div>
  );
};

export default App;

 