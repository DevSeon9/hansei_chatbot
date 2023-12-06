import React, {useState} from 'react';
//
import './App.css';
import Header from './component/HeaderComponent'; // 해더 컴포넌트
import Menu from './component/MenuComponent'; // 메뉴 컴포넌트
import Chatbot from './component/ChatbotComponent'; // 챗봇 컴포넌트
import WeatherBar from './component/weatherBarComponent'; // 날씨 컴포넌트

function App() {
  const [menu, setMenu] = useState(false); // 매뉴버튼 토글

  return (
    <div className="App">
      <Header setMenu= {setMenu} menu= {menu}/>
      {menu && <Menu setMenu= {setMenu} menu= {menu}/>}
      <WeatherBar />
      <Chatbot />
    </div>
  );
};

export default App;

