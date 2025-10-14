"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";

// 声明 SpeechRecognition API 的类型，以兼容不同浏览器
const SpeechRecognition =
  typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;

// 模拟一个将文本转换为语音并返回音频Blob的函数
const textToSpeech = (text: string, lang: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return reject("浏览器不支持语音合成。");
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;

    // 直接播放语音
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      // 创建一个模拟的音频Blob用于生成波形
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const duration = 2;
      const sampleRate = audioContext.sampleRate;
      const frameCount = sampleRate * duration;
      const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      resolve(bufferToWave(buffer));
    };

    utterance.onerror = (event) => {
      reject(`语音合成错误: ${event.error}`);
    };
  });
};

// 将AudioBuffer转换为WAV Blob的辅助函数
function bufferToWave(abuffer: AudioBuffer): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  let pos = 0;

  const writeString = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(pos++, str.charCodeAt(i));
    }
  };

  const writeUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  const writeUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };

  writeString("RIFF");
  writeUint32(length - 8);
  writeString("WAVE");
  writeString("fmt ");
  writeUint32(16);
  writeUint16(1);
  writeUint16(numOfChan);
  writeUint32(abuffer.sampleRate);
  writeUint32(abuffer.sampleRate * 2 * numOfChan);
  writeUint16(numOfChan * 2);
  writeUint16(16);
  writeString("data");
  writeUint32(length - pos - 4);

  const channels = [];
  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  let offset = 0;
  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([view], { type: "audio/wav" });
}

type DialectType = "mandarin" | "shanghai";
type RecognitionStatus = "idle" | "recording" | "recognizing" | "error" | "stopped";

export default function DialectTranslatorClient() {
  const [isApiSupported, setIsApiSupported] = useState(true);
  const [status, setStatus] = useState<RecognitionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [translatedAudio, setTranslatedAudio] = useState<string | null>(null);
  const [sourceDialect, setSourceDialect] = useState<DialectType>("mandarin");
  const [targetDialect, setTargetDialect] = useState<DialectType>("shanghai");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedWaveformRef = useRef<HTMLDivElement>(null);
  const translatedWaveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const translatedWavesurferRef = useRef<WaveSurfer | null>(null);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsApiSupported(false);
      setError("您的浏览器不支持语音识别功能。");
    }

    if (recordedWaveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({ container: recordedWaveformRef.current, waveColor: "#4F46E5", progressColor: "#818CF8", height: 80 });
    }
    if (translatedWaveformRef.current && !translatedWavesurferRef.current) {
      translatedWavesurferRef.current = WaveSurfer.create({ container: translatedWaveformRef.current, waveColor: "#10B981", progressColor: "#34D399", height: 80 });
    }

    return () => {
      wavesurferRef.current?.destroy();
      translatedWavesurferRef.current?.destroy();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const resetState = () => {
    setRecognizedText("");
    setTranslatedText("");
    setRecordedAudio(null);
    setTranslatedAudio(null);
    setError(null);
    wavesurferRef.current?.empty();
    translatedWavesurferRef.current?.empty();
  };

  const toggleDialect = () => {
    setSourceDialect(sourceDialect === "mandarin" ? "shanghai" : "mandarin");
    setTargetDialect(targetDialect === "mandarin" ? "shanghai" : "mandarin");
    resetState();
  };

  const startRecording = useCallback(async () => {
    resetState();
    setStatus("recording");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = sourceDialect === "mandarin" ? "zh-CN" : "zh-CN";
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => setStatus("recognizing");
      recognitionRef.current.onend = () => setStatus("stopped");
      
      recognitionRef.current.onerror = (event: any) => {
        let errorMessage = "语音识别发生错误。";
        if (event.error === 'no-speech') errorMessage = "未检测到语音，请重试。";
        else if (event.error === 'not-allowed') errorMessage = "麦克风访问被拒绝，请检查权限。";
        setError(errorMessage);
        setStatus("error");
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        setRecognizedText(finalTranscript);
      };

      recognitionRef.current.start();
    } catch (err) {
      setError("无法访问麦克风，请检查您的设备和浏览器权限。");
      setStatus("error");
    }
  }, [sourceDialect]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStatus("stopped");

    mediaRecorderRef.current!.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setRecordedAudio(audioUrl);
      wavesurferRef.current?.load(audioUrl);
    };
  }, []);

  const translateAudio = useCallback(async () => {
    if (!recognizedText) return;
    setIsTranslating(true);

    const mockTranslate = (text: string, target: DialectType) => {
      if (target === "shanghai") return text.replace(/今天/g, "今朝").replace(/什么/g, "啥").replace(/你/g, "侬").replace(/我/g, "阿拉").replace(/很好/g, "老好");
      return text.replace(/今朝/g, "今天").replace(/啥/g, "什么").replace(/侬/g, "你").replace(/阿拉/g, "我").replace(/老好/g, "很好");
    };

    const translated = mockTranslate(recognizedText, targetDialect);
    setTranslatedText(translated);

    try {
      const lang = targetDialect === "mandarin" ? "zh-CN" : "zh-CN";
      const audioBlob = await textToSpeech(translated, lang);
      const audioUrl = URL.createObjectURL(audioBlob);
      setTranslatedAudio(audioUrl);
      translatedWavesurferRef.current?.load(audioUrl);
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setIsTranslating(false);
    }
  }, [recognizedText, targetDialect]);

  const playTranslatedAudio = () => {
    if (translatedAudio) {
      const audio = new Audio(translatedAudio);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  const getButtonText = () => {
    if (status === 'recording' || status === 'recognizing') return "停止录音";
    return "开始录音";
  };

  const getStatusText = () => {
    switch (status) {
      case 'recognizing': return "正在聆听...";
      case 'recording': return "准备中...";
      case 'stopped': return "录音结束，等待处理...";
      case 'error': return `错误: ${error}`;
      default: return "点击按钮开始录音";
    }
  };

  return (
    <div className="space-y-8">
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">方言选择</h2>
        <div className="flex items-center justify-center">
          <div className="text-center px-4">
            <div className="font-medium mb-2">源语言</div>
            <div className="text-lg font-bold text-indigo-600">{sourceDialect === "mandarin" ? "普通话" : "上海话"}</div>
          </div>
          <button onClick={toggleDialect} className="mx-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <div className="text-center px-4">
            <div className="font-medium mb-2">目标语言</div>
            <div className="text-lg font-bold text-green-600">{targetDialect === "mandarin" ? "普通话" : "上海话"}</div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">录音</h2>
        <div className="flex justify-center mb-4">
          <button
            onClick={status === 'recording' || status === 'recognizing' ? stopRecording : startRecording}
            disabled={!isApiSupported}
            className={`px-6 py-3 rounded-full flex items-center text-white transition ${
              (status === 'recording' || status === 'recognizing') ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
            } disabled:bg-gray-400`}
          >
            {getButtonText()}
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 min-h-[20px]">
          {error ? <span className="text-red-500">{error}</span> : getStatusText()}
        </p>
        
        {recordedAudio && (
          <div className="mt-4">
            <div ref={recordedWaveformRef} className="w-full"></div>
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">识别文本:</h3>
              <p className="text-gray-800">{recognizedText || "未识别到文本"}</p>
            </div>
          </div>
        )}
      </div>

      {recognizedText && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">翻译</h2>
          <button onClick={translateAudio} disabled={isTranslating} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:bg-green-400 mb-4">
            {isTranslating ? "翻译中..." : "翻译语音"}
          </button>
          {translatedAudio && (
            <div>
              <div ref={translatedWaveformRef} className="w-full mb-4"></div>
              <div className="flex justify-center">
                <button onClick={playTranslatedAudio} disabled={isPlaying} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:bg-green-400">
                  {isPlaying ? "正在播放..." : "播放翻译"}
                </button>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">翻译文本:</h3>
                <p className="text-gray-800">{translatedText}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}