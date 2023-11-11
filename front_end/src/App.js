import React, {useState} from 'react';
import ChatBot from 'react-simple-chatbot'; // 챗봇 라이브러리
import {ThemeProvider} from 'styled-components'; // 스타일 삽입 라이브러리
//
import './App.css';
import {HeaderComponent} from './component/HeaderComponent'; // 해더 컴포넌트
import MenuComponent from './component/MenuComponent'; // 메뉴 컴포넌트
import chatbotSteps from './Chatbot/chatbotSteps'
//
import {images} from './image/importsImg'; // 이미지 파일 임폴트

function App() {
  global.userInput = ['default UI']; // 사용자 질문
  global.serverResponse = ['default SR']; // gpt 답변
  const [menu, setMenu] = useState(false); // 매뉴버튼 토글

  const theme = { // 채팅창 스타일
    background: '#04447c',
    fontFamily: 'NanumGothic',
    botBubbleColor: '#FFFFFF',
    botFontColor: '#000000',
    userBubbleColor: '#FFFFFF',
    userFontColor: '#000000',
  };

  return (
    <div className="App">
      <header className="App-header">
        <HeaderComponent.LogoComponent />
        <HeaderComponent.ReloadButtonComponent />
        <HeaderComponent.MenuButtonComponent
          setMenu = {setMenu}
          menu = {menu}
        />
      </header>
      {menu && <MenuComponent />}
      <ThemeProvider theme = {theme}>
        <ChatBot
          steps = {chatbotSteps}
          hideUserAvatar = {true}
          hideHeader = {true}
          enableSmoothScroll = {true}
          enableMobileAutoFocus ={true}
          botAvatar = {images.botAvatar}
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

