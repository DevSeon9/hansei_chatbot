import React, {useState} from 'react';
import {images} from '../image/importsImg';

function Menu(props) {

  const [isCreditVisible, setCreditVisible] = useState(false);

  const toggleCredit = () => {
    setCreditVisible(!isCreditVisible);
  };

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
            {isCreditVisible && (
              <div className='Menu-Credit'>
                <p>
                  <br/><b>Hansei University<br/>
                  Software Development Capstone Design<br/><br/>
                  Hansei-Univ Chatbot Development Project<br/>
                  Team-3 Debugging</b><br/><br/>
                  서준성 : Leader / Front-End<br/>
                  https://github.com/DevSeon9<br/><br/>
                  김송현 : Front-End<br/>
                  https://github.com/deveio<br/><br/>
                  김태영 : GPT Fine-Tuning<br/>
                  https://github.com/NAS306<br/><br/>
                  이실환 : Back-End<br/>
                  https://github.com/josehp24623655<br/><br/>
                  이현준 : Database<br/>
                  https://github.com/hyunjun0414<br/><br/>
                  <a href='https://github.com/DevSeon9/hansei_chatbot' target='_blank'>
                    https://github.com/DevSeon9/hansei_chatbot
                  </a>
                  <br/><br/><br/><br/><br/>
                  2023/09/06-2023/12/20 
                </p>
              </div>
            )}
            <button
              onClick={toggleCredit}
              className='Menu-CreditButton'
              title="크레딧"
            >
              <p>Credits</p>
            </button>
            
          </div>
        </div>
      );
};

export default Menu;