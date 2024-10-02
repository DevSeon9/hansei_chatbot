import React, {useState, useEffect} from 'react';
import {weatherApiCall} from '../api';
import {images} from '../image/importsImg';

function WeatherBar() {
  
  let [sensorValue, setSensorValue] = useState(["Defualt", "Defualt", "Defualt", "Defualt","Defualt"]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await weatherApiCall(); // 백엔드에서 데이터 가져오기
      console.log(data);
      setSensorValue(data); // 가져온 데이터로 상태 업데이트
    };
    fetchData(); // 컴포넌트가 마운트되었을 때 초기 데이터 가져오기
    const intervalId = setInterval(fetchData, 10000); // 10초마다 fetchData 실행
    return () => clearInterval(intervalId); // 컴포넌트가 언마운트되면 clearInterval로 인터벌 제거
  }, []);

  // 누적된 최신 데이터를 표시
  const latestSensorData = sensorValue[sensorValue.length - 1] || {};

  return (
    <div className='WeatherBar'>
      <WeatherList img={images.temperature} sensorValue={sensorValue[0]+"°C"} />
      <WeatherList img={images.humidity} sensorValue={sensorValue[1]+"%"} />
      <WeatherList img={images.precipitation} sensorValue={sensorValue[2]+"mm"} />
      <WeatherList img={images.fineDust} sensorValue={sensorValue[3]+"㎍/㎥"} />
      <WeatherList img={images.harmfulGas} sensorValue={sensorValue[4]+"ppm"} />
    </div>
  );
}

export default WeatherBar;

function WeatherList(props) {
  return (
    <div className='WeatherBar-List'>
      <img src={props.img} className='Weather-Img'/>
      <p>{props.sensorValue}</p>
    </div>
  );
}
