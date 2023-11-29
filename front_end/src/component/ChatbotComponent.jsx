import React, {useState} from "react";
import {ChatBubble} from './ChatBubbleComponent';
import {gptApiCall} from '../api';

function Chatbot() {

  const [chatHistory, setChatHistory] = useState(
    [
      {
        content: '저는 한세대학교 챗봇 한비입니다. 무엇이든 물어보세요!',
        sender: 'bot',
        showComponent: true
      },
    ]
  );

  const [userInput, setUserInput] = useState('');
  let serverResponse = '';

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async (e) => {
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
      serverResponse = await gptApiCall(userInput);

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

  return (
    <div className='Chatbot'>
      {chatHistory.map((message, index) => (
        message.sender === 'user' ? (
          <ChatBubble.UserBubble
            content={message.content}
          />
        ) : (
          <ChatBubble.BotBubble
            content={message.content}
            showComponent={message.showComponent}
          />
        )
      ))}
      <ChatBubble.UserInput 
      handleSendMessage={handleSendMessage}
      userInput={userInput}
      handleUserInput={handleUserInput}
       />
    </div>
  );
}

export default Chatbot;