import React from 'react';
import {images} from '../image/importsImg';

const Header = (props) => {
  return (
    <header className="Header">
      <Logo />
      <ReloadButton />
      <MenuButton
        setMenu= {props.setMenu}
        menu= {props.menu}
      />
    </header>
  );
}

const Logo = () => {
  return (
    <a
      href="https://www.hansei.ac.kr/"
      target="_blank"
      className="Header-Img"
      title="한세대학교 사이트로 이동"
    >
      <img 
        src= {images.hanseiLogo}
        className="Header-Img-n"
      />
      <img 
        src= {images.hanseiLogoHover}
        className="Header-Img-h"
      />
      <img 
        src= {images.hanseiLogoClick}
        className="Header-Img-c"
      />
    </a>
  );
}

const ReloadButton = () => {
  return (
    <button // 해더 이미지
      onClick={() => window.location.reload()}
      className='Header-Logo'
      style={{border: 0}}
      title= '새로고침'
    >
      <img 
        src={images.headerImg}
        className="Header-Logo" 
      />
    </button>
  );
}

const MenuButton = (props) => {
  return (
    <button // 메뉴버튼
      onClick={() => {props.setMenu(!props.menu)}}
      className="Header-Img"
      title="메뉴버튼"
      style={{ border: 0}}
    >
      <img 
        src= {images.menuButton}
        className="Header-Img-n"
      />
      <img 
        src= {images.menuButtonHover}
        className="Header-Img-h"
      />
      <img 
        src= {images.menuButtonClick}
        className="Header-Img-c"
      />
    </button>
  );
}

export default Header;