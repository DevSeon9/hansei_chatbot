#include "WiFiS3.h"
#include "arduino_secrets.h" 
#include <Wire.h>
#include <ArduinoJson.h>
#include <DHT.h>

const int coSensorPin = A0; // CO sensor
const int rainSensor = A2; // 빗방울 센서핀 설정
#define DHTPIN 8  // Pin where the DHT22 is connected
#define DHTTYPE DHT22  // Type of DHT sensor

DHT dht(DHTPIN, DHTTYPE);

char ssid[] = SECRET_SSID; // WiFi SSID 변수
char pass[] = SECRET_PASS; // WiFi 비밀번호 변수
int keyIndex = 0; // WEP보안 key index
int status = WL_IDLE_STATUS;  // WiFi 연결상태확인 변수

WiFiClient client;
const char* serverAddress = SERVER_IP;  // Express 서버의 IP 주소
const int serverPort = 5000;  // Express 서버의 포트

void setup() {
  Serial.begin(9600); // 시리얼 통신 초기화
  dht.begin();
  while (!Serial) {
    ; // 시리얼 포트 연결 대기.
  }

  if (WiFi.status() == WL_NO_MODULE) { // WiFi 모듈확인
    Serial.println("Communication with WiFi module failed!");
    while (true);
  }

  String fv = WiFi.firmwareVersion(); // WiFi 펌웨어 버전 확인
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }

  while (status != WL_CONNECTED) { // WiFi 네트워크에 연결 시도
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, pass);
    delay(10000);
  }
  // server.begin();
  printWifiStatus();
}

void loop() {
  // 센서에서 데이터 수집
  int sensorValues[5];
  sensorValues[0] = dht.readTemperature(); // 온도
  sensorValues[1] = dht.readHumidity(); // 습도
  sensorValues[2] = analogRead(rainSensor); // 빗방울
  sensorValues[3] = analogRead(coSensorPin); // 공기질
  sensorValues[4] = digitalRead(SDA); // 미세먼지

  // JSON 객체 생성
  DynamicJsonDocument jsonDocument(200);
  JsonArray jsonArray = jsonDocument.to<JsonArray>();

  // JSON 배열에 센서 값 추가
  for (int i = 0; i < 5; i++) {
    jsonArray.add(sensorValues[i]);
  }

  // JSON 데이터를 문자열로 변환
  String jsonString;
  serializeJson(jsonArray, jsonString);

  // Express 서버로 POST 요청 보내기
  if (client.connect(serverAddress, serverPort)) {
    client.println("POST /api/weather HTTP/1.1");
    client.println("Host: " + String(serverAddress) + ":" + String(serverPort));
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.print("Content-Length: ");
    client.println(jsonString.length());
    client.println();
    client.println(jsonString);
    client.println();
    client.stop();
  } else {
    Serial.println("Connection to server failed");
  }

  delay(10000);
}

void printWifiStatus() { // 연결성공시 상태출력
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  // 보드 IP주소 출력
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
  // 수신감도 출력
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}