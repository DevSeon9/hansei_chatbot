import React from 'react';
import {images} from '../image/importsImg';

function Menu(props) {
    return (
        <div className='Menu'>
          <div className='Menu-Header'>
            <h1 className='Menu-Title'>도움말</h1>
            <button
              onClick={() => {props.setMenu(!props.menu)}}
              className='Menu-Button'
              title="닫기"
            >
              닫기 <p className='red'>X</p>
            </button>
          </div>
          <div className='Menu-Body'>
            <img 
              src= {images.helpPage}
              className="Menu-HelpPage"
            />
          </div>
        </div>
      );
};

export default Menu;