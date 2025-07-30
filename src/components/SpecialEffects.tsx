'use client';

import { useEffect, useState } from 'react';

interface SpecialEffectsProps {
  effects: Array<{
    id: string;
    type: 'explosion' | 'lightning' | 'magic';
    x: number;
    y: number;
    timestamp: number;
  }>;
}

export function SpecialEffects({ effects }: SpecialEffectsProps) {
  const [activeEffects, setActiveEffects] = useState<typeof effects>([]);

  useEffect(() => {
    setActiveEffects(effects);
    
    // 清理过期效果
    const timeout = setTimeout(() => {
      setActiveEffects([]);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [effects]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {activeEffects.map(effect => (
        <div
          key={effect.id}
          className="absolute"
          style={{
            left: `${effect.x}%`,
            top: `${effect.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {effect.type === 'explosion' && (
            <div className="relative">
              {/* 爆炸核心 */}
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping opacity-75"></div>
              
              {/* 爆炸粒子 */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
                  style={{
                    left: `${Math.cos(i * Math.PI / 4) * 30 + 30}px`,
                    top: `${Math.sin(i * Math.PI / 4) * 30 + 30}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
          )}
          
          {effect.type === 'lightning' && (
            <div className="relative">
              {/* 闪电效果 */}
              <div className="w-1 h-32 bg-gradient-to-b from-blue-300 to-purple-500 animate-pulse transform rotate-12"></div>
              <div className="absolute top-0 w-1 h-32 bg-gradient-to-b from-white to-blue-300 animate-pulse transform -rotate-12"></div>
              
              {/* 电光 */}
              <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white rounded-full animate-ping transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          )}
          
          {effect.type === 'magic' && (
            <div className="relative">
              {/* 魔法光环 */}
              <div className="w-20 h-20 border-4 border-purple-400 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-2 border-pink-300 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
              
              {/* 魔法星星 */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-yellow-300 text-xl animate-pulse"
                  style={{
                    left: `${Math.cos(i * Math.PI / 3) * 25 + 35}px`,
                    top: `${Math.sin(i * Math.PI / 3) * 25 + 35}px`,
                    animationDelay: `${i * 0.2}s`
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}