import React, {useEffect, useRef, useState} from "react";
import {ChatBubble} from './ChatBubbleComponent';
import {gptApiCall} from '../api';

function Chatbot() {

  const [chatHistory, setChatHistory] = useState( // 챗봇 로그기록
    [
      {
        content: '저는 한세대학교 챗봇 한비입니다. 무엇이든 물어보세요!',
        sender: 'bot',
        showComponent: true
      },
    ]
  );
  const scrollRef = useRef(); // 스크롤 번수
  const [userInput, setUserInput] = useState(''); // 유저입력변수
  let serverResponse = ''; // 백엔드 수신변수

  const handleUserInput = (e) => { // 유저입력 이벤트처리
    setUserInput(e.target.value);
  };

  const handleSendMessage = async (e) => { // 백엔드 통신 및 로그기록, 채팅생성
    e.preventDefault();
    if (userInput.trim() !== '') {
      setChatHistory((prevChatHistory) => 
        [...prevChatHistory,
          {
            content: userInput,
            sender: 'user',
            showComponent: false
          }
        ]
      );
      setUserInput('');
      serverResponse = await gptApiCall(userInput); // 백엔드 통신

      setChatHistory((prevChatHistory) => 
        [...prevChatHistory, 
          {
            content: serverResponse,
            sender: 'bot',
            showComponent: false
          }
        ]
      );
      console.log(chatHistory);
    }
  };

  useEffect(() => { // 스크롤 이밴트
    const scrollToBottom = (() => { // 스크롤 아래로 내리기
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    })();
  }, [chatHistory]);

  return (
    <div className='Chatbot'>
      <div
        ref={scrollRef}
        className="Chatbot-Field"
      >
        {chatHistory.map((message, index) => (
          message.sender === 'user' ? (
            <ChatBubble.UserBubble
              key={index}
              content={message.content}
            />
          ) : (
            <ChatBubble.BotBubble
              key={index}
              content={message.content}
              showComponent={message.showComponent}
            />
          )
        ))}
      </div>
    <ChatBubble.UserInput 
      handleSendMessage={handleSendMessage}
      userInput={userInput}
      handleUserInput={handleUserInput}
    />
  </div>
  );
}

export default Chatbot;