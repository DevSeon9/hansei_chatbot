import React from "react";
import FrequentlyAsked from './AskedComponent';
import {images} from '../image/importsImg';

function BotBubble(props) {
  return (
    <div
      className='ChatBubble-Bubble'
      style={{justifyContent: 'flex-start'}}
    >
      <img
        src={images.botAvatar}
        className='ChatBubble-Avator'
      />
      <div className='ChatBubble-Content ChatBubble-Bot'>
        {props.content} <br/>
        {props.showComponent && <FrequentlyAsked/>}
      </div>
    </div>
  );
}

function UserBubble(props) {
  return (
    <div
      className='ChatBubble-Bubble'
      style={{justifyContent: 'flex-end'}}
    >
      <div className='ChatBubble-Content ChatBubble-User'>
        {props.content}
      </div>
    </div>
  );
}

function UserInput(props) {
  return (
    <form
      className='ChatBubble-UserInput'
      onSubmit={props.handleSendMessage}
    >
    <input
      type='text'
      placeholder='질문을 입력하세요'
      className='ChatBubble-Inputset'
      value={props.userInput}
      onChange={props.handleUserInput}
    />
    <button
      type='submit'
      className='ChatBubble-InputButton'
    >
      <img
        src={images.sendButton}
        alt='전송버튼'
        className='ChatBubble-SendImg'
      />
    </button>
  </form>
  );
}

export const ChatBubble = {
  BotBubble,
  UserBubble,
  UserInput,
};
