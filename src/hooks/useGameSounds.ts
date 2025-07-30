import { useCallback, useRef } from 'react';

export function useGameSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);

  // 初始化音频上下文
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported');
      }
    }
  }, []);

  // 生成音效
  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
    if (!soundEnabledRef.current) return;
    
    initAudioContext();
    if (!audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }, [initAudioContext]);

  // 宝石消除音效
  const playGemCrush = useCallback((gemCount: number = 3) => {
    const baseFreq = 400 + gemCount * 50;
    playSound(baseFreq, 0.2, 'triangle', 0.15);
    
    // 添加和声
    setTimeout(() => {
      playSound(baseFreq * 1.5, 0.15, 'sine', 0.1);
    }, 50);
  }, [playSound]);

  // 连击音效
  const playCombo = useCallback((comboCount: number) => {
    const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
    const freq = frequencies[Math.min(comboCount - 1, frequencies.length - 1)];
    
    playSound(freq, 0.3, 'triangle', 0.2);
    
    // 添加回声效果
    setTimeout(() => {
      playSound(freq * 0.5, 0.2, 'sine', 0.1);
    }, 100);
  }, [playSound]);

  // 特殊宝石生成音效
  const playSpecialGem = useCallback(() => {
    // 魔法音效序列
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playSound(freq, 0.15, 'triangle', 0.12);
      }, index * 80);
    });
  }, [playSound]);

  // 关卡完成音效
  const playLevelComplete = useCallback(() => {
    // 胜利音效
    const melody = [523, 659, 784, 1047, 1319];
    melody.forEach((freq, index) => {
      setTimeout(() => {
        playSound(freq, 0.4, 'triangle', 0.15);
      }, index * 150);
    });
  }, [playSound]);

  // 游戏失败音效
  const playGameOver = useCallback(() => {
    // 下降音效
    const notes = [440, 370, 311, 262];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playSound(freq, 0.5, 'sawtooth', 0.1);
      }, index * 200);
    });
  }, [playSound]);

  // 宝石选择音效
  const playGemSelect = useCallback(() => {
    playSound(800, 0.1, 'sine', 0.08);
  }, [playSound]);

  // 无效移动音效
  const playInvalidMove = useCallback(() => {
    playSound(200, 0.3, 'sawtooth', 0.1);
  }, [playSound]);

  // 切换音效开关
  const toggleSound = useCallback(() => {
    soundEnabledRef.current = !soundEnabledRef.current;
    return soundEnabledRef.current;
  }, []);

  return {
    playGemCrush,
    playCombo,
    playSpecialGem,
    playLevelComplete,
    playGameOver,
    playGemSelect,
    playInvalidMove,
    toggleSound,
    isSoundEnabled: () => soundEnabledRef.current
  };
}