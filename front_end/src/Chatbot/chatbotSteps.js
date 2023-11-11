import AskedComponent from '../component/AskedComponent';
import {gptApiCall, dbApiCall} from '../api';

let chatbotSteps = [ // 대화진행 표
{
  id: 'start',
  message: '안녕하세요! 저는 한세대학교 챗봇서비스 한비입니다. 무엇이든 물어보세요!',
  trigger: 'component',
},
{
  id: 'component',
  component: (
    <AskedComponent/>
  ),
  trigger: 'userInput',
},
{
  id: 'userInput',
  user: true,
  trigger: (values) => {
    global.userInput.splice(0,1,values.value);
    console.log(`trigger userInput: ${global.userInput}`);
    console.log(`trigger serverResponse: ${global.serverResponse}`);
    (async () => {global.serverResponse = await gptApiCall(global.userInput);})();
    return 'waitting';
  },
},
{
  id: 'waitting',
  message: 'please waitting...',
  trigger: 'gptAnswer',
},
{
  id: 'gptAnswer',
  message: () => {
    console.log(`end userInput: ${global.userInput}`);
    console.log(`end serverResponse: ${global.serverResponse}`);
    return `${global.serverResponse}`;
  },
  trigger: 'userInput',
},
{
  id: 'end',
  message: 'end',
  end: true,
},
];

export default chatbotSteps;