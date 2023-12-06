import React, { useState } from 'react';
import {dbApiCall} from '../api';
import AskItem from '../data/AskItem.json';

function FrequentlyAsked() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSubItem, setSelectedSubItem] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSelectedSubItem(null);
  };

  const handleSubItemClick = (subItem) => {
    setSelectedSubItem(subItem);
  };

  const handleGoBack = () => {
    setSelectedItem(null);
    setSelectedSubItem(null);
  };

  const items = ['학사일정', '교내 연락처', '등록금 납부', '수강신청', '장학 안내', '졸업 안내'];

  const subItems = {
    '학사일정': AskItem.item.item_1.content.content_1,
    '교내 연락처': AskItem.item.item_2.content.content_1,
    '등록금 납부': AskItem.item.item_3.content.content_1,
    '수강신청': AskItem.item.item_4.content.content_1,
    '졸업 안내': Object.values(AskItem.item.item_6.contentList),
    '장학 안내': Object.values(AskItem.item.item_5.contentList),
  };

  const detailItems = {
    '학과별 요건': [
      "신학과", "기독교교육상담학과", "미디어영상광고학과", "경영학과", "경찰행정학과", "국제관광학과", "영어학과", "중국어학과", "컴퓨터공학과",
      "ICT융합학과", "산업보안학과", "간호학과", "사회복지학과", "음악학과", "공연예술학과", "시각정보디자인학과", "실내건축디자인학과", "섬유패션디자인학과",
      "IT융합학과", "IT융합지능로봇공학과", "보건복지사회적기업학과", "보건융합사회적기업학과", "보건복지사회적경제학과", "청소년전공", "글로벌외국어통상전공",
      "광고콘텐츠디자인전공", "스포츠건강관리전공", "무대예술디자인전공"
    ],
      '행정': ["이사장실","법인 사무국","총장실","부총장실","비서실" ,"기획처", "교무혁신처","교원인사팀", "입학팀","인사총무팀","시설관리팀","재무팀","산학협력단","예비군대대",
    ],
      '학생서비스':[ "교육혁신원", "교수학습지원센터", "혁신사업팀","혁신성장본부", "학생지원처","학술정보원(협력팀)", "학술정보원(정보보호팀)", "대학일자리본부", "국제교류교육원",
      "평생교육원", "글로벌교육센터", "교양학부", "파트장A", "파트장B", "파트장C", "한세미디어센터","학생실습실","학생복지","학생회관","산업보안연구소",
    ],
      '대학원':[ "일반대학원","특수대학원(심리상담, 예술, 휴먼서비스)","대학원교학팀",
    ],
      '학부' : [ "인문사회과학부","디자인학부","간호복지학부","예술학부","신학부","IT학부",
    ],
      '기타' : [ "부속기관","부대시설","경비실","직원","노동 조합사무실" ,      
    ],
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
  };

  const buttonStyle = {
    background: 'lightblue',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    margin: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'background 0.3s, transform 0.1s',

  };

  return (
    <div>
      <br></br>
      <h1>자주하는질문</h1>
      {selectedItem ? (
        <div style={buttonContainerStyle}>
          <button onClick={handleGoBack} style={buttonStyle}>
             Back
          </button>
          {selectedItem && <p> 항목: {selectedItem}</p>}
          {selectedItem &&
            subItems[selectedItem] &&
            subItems[selectedItem].map((subItem, index) => (
              <button
                key={index}
                onClick={() => handleSubItemClick(subItem)}
                style={buttonStyle}
              >
                {subItem}
              </button>
            ))}
        </div>
      ) : (
        <div style={buttonContainerStyle}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              style={{
                ...buttonStyle,
                background: selectedItem === item ? 'lightgreen' : 'lightgreen',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {selectedSubItem && (
        <div style={buttonContainerStyle}>       
          {selectedSubItem && <p>소항목: {selectedSubItem}</p>}
          {selectedSubItem &&
            detailItems[selectedSubItem] &&
            detailItems[selectedSubItem].map((item, index) => (
              <button key={index} style={buttonStyle}>
                {item}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default FrequentlyAsked;