import React from 'react';
import {images} from '../image/importsImg';

const LogoComponent = () => {
  return (
    <a
      href="https://www.hansei.ac.kr/"
      target="_blank"
      className="HeaderSide-img"
      title="한세대학교 사이트로 이동"
    >
      <img 
        src= {images.hanseiLogo}
        className="HeaderSide-img-n"
      />
      <img 
        src= {images.hanseiLogoHover}
        className="HeaderSide-img-h"
      />
      <img 
        src= {images.hanseiLogoClick}
        className="HeaderSide-img-c"
      />
    </a>
  );
}

const ReloadButtonComponent = () => {
  return (
    <button // 해더 이미지
      onClick={() => window.location.reload()}
      className='header-logo'
      style={{border: 0}}
      title= '새로고침'
    >
      <img 
        src={images.headerImg}
        className="Header-logo" 
      />
    </button>
  );
}

const MenuButtonComponent = (props) => {
  return (
    <button // 메뉴버튼
      onClick={() => {props.setMenu(!props.menu)}}
      className="HeaderSide-img"
      title="메뉴버튼"
      style={{ border: 0, zIndex: 1001}}
    >
      <img 
        src= {images.menuButton}
        className="HeaderSide-img-n"
      />
      <img 
        src= {images.menuButtonHover}
        className="HeaderSide-img-h"
      />
      <img 
        src= {images.menuButtonClick}
        className="HeaderSide-img-c"
      />
    </button>
  );
}

export const HeaderComponent = {
  LogoComponent,
  ReloadButtonComponent,
  MenuButtonComponent
}