import axios from "axios";
// MediaRecorderと音声データの収集を管理するための変数
let mediaRecorder;
let audioChunks = [];
let fierdtext = "";

// 音声を再生するためのHTML audio要素
const audioElement = document.getElementById("audioElement");

// OpenAIのAPIキーとエンドポイント
const apiKey = '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';
const apiEndpoint = 'https://api.openai.com/v1/chat/completions';

// ユーザーインタラクション用のボタン要素
/*const startButton = document.getElementById("start");*/
/*
const stopButton = document.getElementById("stop");
const gptButton = document.getElementById("GPT");
*/


// 開始ボタンがクリックされたときのイベントリスナー
export default async function rokuon(a) {
  if (a){
      return ;
  }
  try {
    // ユーザーのマイクから音声ストリームを取得
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    // 音声データが利用可能になったときに実行されるコールバック
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    // 録音を開始
    /*startButton.disabled = true;*/
    /*stopButton.disabled = false;*/
   let message =  makefile();
   return message;

  } catch (error) {
    console.error("マイクへのアクセスを取得できませんでした: ", error);
  }
};

async function makefile (){
  for (let i = 0; i < 10; i++){
    await mediaRecorder.start(); 
    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(5000);
    mediaRecorder.stop();
    const file = new Blob(audioChunks, { type: 'audio/wav' });
    /*const audioUrl = URL.createObjectURL(file);*/
    /*audioElement.src = audioUrl;*/
    // eslint-disable-next-line no-loop-func
    callTranscriptions(file, async (text) => { 
      console.log(text);
      if (!text) return;
      /*document.getElementById("result").innerHTML += text;*/
      if (text.indexOf("ドラえもん") !== -1) {
        questions(text);
        let message = await resgpt(text);
        fierdtext = message;
      }
    });
    audioChunks = [];
    if (fierdtext) {
      return fierdtext;
    }
  }
  console.log('終了');
}

function questions (text){
  if (text.indexOf("天気") !== -1) {
    text = "今日の天気を教えて";
  }
  if (text.indexOf("について") !== -1){
    let beforeKeyword = text.substring(0, text.indexOf("について"));
    text = `${beforeKeyword}について教えて`;
  }
  if (text.indexOf("どこ")){
    let beforeKeyword = text.substring(0, text.indexOf("どこ"));
    text = `${beforeKeyword}はどこにありますか？`;
  }
  if (text.indexOf("")){

  }
  if (text.indexOf("")){

  }
  return text;
}

const callTranscriptions = (file, callback) => {  
  const XHR = new XMLHttpRequest();
  XHR.addEventListener("load", (event) => {
    callback(JSON.parse(event.target.responseText).text);
  });
  XHR.addEventListener("error", (event) => {
    alert("error");
  });
  XHR.open("POST", "https://api.openai.com/v1/audio/transcriptions");
  XHR.setRequestHeader("Authorization", `Bearer ${apiKey}`);

  var formData = new FormData();
  formData.append("model", "whisper-1");
  formData.append("language", "ja");
  formData.append("file", file);
  XHR.send(formData); 
};

// OpenAI APIを呼び出してGPT-3.5 Turboを利用してテキストを生成するボタンがクリックされたときのイベントリスナー
async function resgpt(text) {

  const inputData = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Hey there! I am your friend, ready to chat and help you out.' },
      { role: 'user', content: text },
    ]
  };


  // OpenAI APIにデータを送信して応答を取得
  try {
    const response = await axios.post(apiEndpoint, inputData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    const message = response.data.choices[0]?.message;
    if (message) {
      console.log('Response:', message.content);
      return message.content;
    } else {
      console.error('Error: Response message not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}



