import React from 'react';
import hanseiLogo from './image/hanseiLogo.jpg'; //한세대 로고
import menuButton from './image/menuButton.png'; // 우측상단 더보기버튼
import './App.css';
import ChatBot from 'react-simple-chatbot'; // 챗봇 라이브러리
import {ThemeProvider} from 'styled-components'; // 스타일 삽입 라이브러리

function App() {
  const steps = [ // 대화진행 표
    {
      id: 'start',
      message: '안녕하세요! 저는 Hansei Chatbot입니다. 궁금한내용을 질문해주세요!',
      trigger: 'component',
    },
    {
      id: 'component',
      component: (
        <div className="Chatbot-header">
          <h2>자주하는 질문</h2>

        </div>
      ),
      trigger: 'answer',
    },
    {
      id: 'answer',
      user: true,
      trigger: 'gptCall',
    },
    {
      id: 'gptCall',
      message: 'gpt api call',
      end: true,
    },
  ];

  const theme = { // 채팅창 스타일
    background: '#04447c',
    // borderRadius: '0px',
    fontFamily: 'NanumGothic',
    botBubbleColor: '#FFFFFF',
    botFontColor: '#000000',
    userBubbleColor: '#FFFFFF',
    userFontColor: '#000000',
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={hanseiLogo} alt='hanseiLogo' className="Header-img"/>
        <div className='Header-logo'>Hansei Chatbot</div>
        <button onclick="" style={{width: '8vh', height: '8vh', border: 'none', position: 'relative'}}>
          <img src={menuButton} alt='menuButton' className="Header-img" style={{position: 'absolute', top: '0', left: '0'}}/>
        </button>
      </header>
      <ThemeProvider theme = {theme}>
        <ChatBot
          steps = {steps}
          hideHeader = {true}
          hideUserAvatar = {true}
          width = {'100%'}
          height = {'92vh'}
          placeholder = {"질문을 입력하세요."}
        />
      </ThemeProvider>
    </div>
  );
};

export default App;

