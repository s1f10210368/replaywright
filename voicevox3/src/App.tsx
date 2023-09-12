import React, { ChangeEvent, useState } from 'react'
import superagent from 'superagent'
import './App.css'
import rokuon from './App'

// Style
const contentStyle: React.CSSProperties = {width: '80%', textAlign: 'center'}
const textareaStyle: React.CSSProperties = {width: '100%', height: 100}
const buttonStyle: React.CSSProperties = {...textareaStyle, fontSize: 30}
const audioStyle: React.CSSProperties = {...textareaStyle}

// Query型定義
type Mora = {
  text: string
  consonant: string
  consonant_length: number
  vowel: string
  vowel_length: number
  pitch: number
}

type Query = {
  accent_phrases: {
      moras: Mora[]
      accent: number
      pause_mora: Mora
  }
  speedScale: number
  pitchScale: number
  intonationScale: number
  volumeScale: number
  prePhonemeLength: number
  postPhonemeLength: number
  outputSamplingRate: number
  outputStereo: boolean
  kana: string
}



const App = () => {

  const [inputText, setInputText] = useState<string>('')
  const [queryJson, setQueryJson] = useState<Query>()
  const [audioData, setAudioData] = useState<Blob>()
  if (!inputText){
    setInputText('a');
  }
  const startrecord = async() => {
    let data = rokuon();
      setInputText(String(data));
  }

  // 文字列からQueryを作り出す
  const createQuery = async () => {
    const res = await superagent
      .post('http://localhost:50021/audio_query')
      .query({ speaker: 1, text: inputText })

    if (!res) return

    setQueryJson(res.body as Query)
  }

  // Queryから合成音声を作り出す
  const createVoice = async () => {
    const res = await superagent
      .post('http://localhost:50021/synthesis')
      .query({ speaker: 1 })
      .send(queryJson)
      .responseType('blob')

    if (!res) return

    setAudioData(res.body as Blob)
  }

  return (
    <div className='App-header'>
      {inputText ? (
        <div style={contentStyle}>
          <button style={buttonStyle} onClick={startrecord}>録音開始</button>
        </div>
      ) : null}

      {inputText ? (
        <div style={contentStyle}>
          <p>↓</p>
          <h2>文章からクエリデータを作成</h2>
          <button style={buttonStyle} onClick={createQuery}>クエリ作成</button>
        </div>
      ) : null}

      {queryJson ? (
        <div style={contentStyle}>
          <p>↓</p>
          <h2>クエリデータから音声を合成</h2>
          <button style={buttonStyle} onClick={createVoice}>音声合成</button>
        </div>
      ) : null}
      
      {audioData ? (
        <div style={contentStyle}>
          <p>↓</p>
          <h2>返却された音声ファイルを再生</h2>
          <audio
            style={audioStyle}
            controls
            src={audioData ? window.URL.createObjectURL(audioData) : undefined}>
          </audio>
        </div>
      ) : null}
    </div>
  )
}

export default App
