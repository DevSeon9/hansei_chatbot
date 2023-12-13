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
                <CreditP/>
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

function CreditP() {
  return (
    <p>
      <br/>
      <b>
        Hansei University<br/>
        Software Development Capstone Design<br/><br/>
        Hansei-Univ Chatbot Development Project<br/>
        Team-3 Debugging
      </b>
      <br/><br/>
      서준성 : Leader / Front-End<br/>
      <a href='https://github.com/DevSeon9' target='_blank'>
        https://github.com/DevSeon9
      </a>
      <br/><br/>
      김송현 : Front-End<br/>
      <a href='https://github.com/deveio' target='_blank'>
        https://github.com/deveio
      </a>
      <br/><br/>
      김태영 : GPT Fine-Tuning / arduino<br/>
      <a href='https://github.com/NAS306' target='_blank'>
        https://github.com/NAS306
      </a>
      <br/><br/>
      이실환 : Back-End<br/>
      <a href='https://github.com/josehp24623655' target='_blank'>
        https://github.com/josehp24623655
      </a>
      <br/><br/>
      이현준 : Database<br/>
      <a href='https://github.com/hyunjun0414' target='_blank'>
        https://github.com/hyunjun0414
      </a>
      <br/><br/><br/>
      Project Page<br/>
      <a href='https://github.com/DevSeon9/hansei_chatbot' target='_blank'>
        https://github.com/DevSeon9/hansei_chatbot
      </a>
      <br/><br/><br/>
      2023/09/06-2023/12/20
    </p>
  );
};