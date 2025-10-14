"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";

// Helper function to convert an AudioBuffer to a WAV Blob
function bufferToWave(abuffer: AudioBuffer): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // Write WAVE header
  // "RIFF"
  view.setUint32(0, 0x46464952, false);
  // file length - 8
  view.setUint32(4, length - 8, true);
  // "WAVE"
  view.setUint32(8, 0x45564157, false);
  // "fmt " chunk
  view.setUint32(12, 0x20746d66, false);
  // length = 16
  view.setUint32(16, 16, true);
  // PCM (uncompressed)
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, abuffer.sampleRate, true);
  // avg. bytes/sec
  view.setUint32(28, abuffer.sampleRate * 2 * numOfChan, true);
  // block-align
  view.setUint16(32, numOfChan * 2, true);
  // 16-bit
  view.setUint16(34, 16, true);
  // "data" - chunk
  view.setUint32(36, 0x61746164, false);
  // chunk length
  view.setUint32(40, length - 44, true);
  pos = 44;

  // Write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  return new Blob([view], { type: "audio/wav" });
}


interface AudioSettings {
  voice: "youth" | "teen";
  pitch: number;
  volume: number;
}

export default function AudioProcessorClient() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);
  const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({
    voice: "youth",
    pitch: 5,
    volume: 5,
  });

  const waveformRef = useRef<HTMLDivElement>(null);
  const processedWaveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const processedWavesurferRef = useRef<WaveSurfer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }, []);

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#4F46E5",
        progressColor: "#818CF8",
        cursorColor: "#C7D2FE",
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 100,
        barGap: 2,
      });
    }

    if (
      processedWaveformRef.current &&
      !processedWavesurferRef.current
    ) {
      processedWavesurferRef.current = WaveSurfer.create({
        container: processedWaveformRef.current,
        waveColor: "#10B981",
        progressColor: "#34D399",
        cursorColor: "#A7F3D0",
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 100,
        barGap: 2,
      });
    }

    return () => {
      wavesurferRef.current?.destroy();
      wavesurferRef.current = null;
      processedWavesurferRef.current?.destroy();
      processedWavesurferRef.current = null;
    };
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && audioContextRef.current) {
        setAudioFile(file);
        setProcessedBuffer(null);
        processedWavesurferRef.current?.empty();


        const url = URL.createObjectURL(file);
        wavesurferRef.current?.load(url);

        const arrayBuffer = await file.arrayBuffer();
        audioContextRef.current.decodeAudioData(
          arrayBuffer,
          (buffer) => {
            setOriginalBuffer(buffer);
          },
          (error) => {
            console.error("Error decoding audio data:", error);
          }
        );
      }
    },
    []
  );

  const handleSettingChange = (
    setting: keyof AudioSettings,
    value: string | number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const processAudio = useCallback(async () => {
    if (!originalBuffer || !audioContextRef.current) return;

    setIsProcessing(true);

    try {
      const offlineCtx = new OfflineAudioContext(
        originalBuffer.numberOfChannels,
        originalBuffer.length,
        originalBuffer.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = originalBuffer;

      const gainNode = offlineCtx.createGain();
      gainNode.gain.value = settings.volume / 5.0; // Volume [1-10] -> Gain [0.2-2.0]

      let basePitch = settings.voice === "teen" ? 1.2 : 1.0; // Teen voice has higher pitch
      let finalPitch = basePitch * (0.75 + settings.pitch / 10 / 2); // Pitch [1-10] -> Rate [0.8-1.25]
      source.playbackRate.value = finalPitch;

      source.connect(gainNode);
      gainNode.connect(offlineCtx.destination);
      source.start();

      const renderedBuffer = await offlineCtx.startRendering();
      setProcessedBuffer(renderedBuffer);

      if (processedWavesurferRef.current) {
        const wavBlob = bufferToWave(renderedBuffer);
        processedWavesurferRef.current.loadBlob(wavBlob);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [originalBuffer, settings]);

  const playProcessedAudio = useCallback(() => {
    if (!processedBuffer || !audioContextRef.current) return;

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = processedBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
    source.onended = () => {
      setIsPlaying(false);
    };
    sourceNodeRef.current = source;
    setIsPlaying(true);
  }, [isPlaying, processedBuffer]);

  return (
    <div className="space-y-8">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
          id="audio-upload"
        />
        <label
          htmlFor="audio-upload"
          className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          选择音频文件
        </label>
        {audioFile && (
          <p className="mt-2 text-sm text-gray-600">
            已选择: {audioFile.name}
          </p>
        )}
      </div>

      {audioFile && (
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">原始音频波形</h2>
          <div ref={waveformRef} className="w-full"></div>
        </div>
      )}

      {audioFile && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">音频设置</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              音色
            </label>
            <select
              value={settings.voice}
              onChange={(e) => handleSettingChange("voice", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="youth">青年音</option>
              <option value="teen">少年音</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              音调: {settings.pitch}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.pitch}
              onChange={(e) =>
                handleSettingChange("pitch", parseInt(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>低</span>
              <span>高</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              音量: {settings.volume}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.volume}
              onChange={(e) =>
                handleSettingChange("volume", parseInt(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>小</span>
              <span>大</span>
            </div>
          </div>

          <button
            onClick={processAudio}
            disabled={isProcessing || !originalBuffer}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
          >
            {isProcessing ? "处理中..." : "应用效果"}
          </button>
        </div>
      )}

      {processedBuffer && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">处理后的音频</h2>
          <div ref={processedWaveformRef} className="w-full mb-4"></div>

          <div className="flex justify-center">
            <button
              onClick={playProcessedAudio}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                {isPlaying ? (
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              {isPlaying ? "暂停" : "播放"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}