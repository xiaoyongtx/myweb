'use client';

import { Gem } from '@/hooks/useGemCrushGame';
import { useState } from 'react';

interface GemComponentProps {
  gem: Gem;
  isSelected: boolean;
  isAnimating: boolean;
  onClick: () => void;
}

const GEM_COLORS = {
  red: 'from-red-400 to-red-600',
  blue: 'from-blue-400 to-blue-600', 
  green: 'from-green-400 to-green-600',
  yellow: 'from-yellow-400 to-yellow-600',
  purple: 'from-purple-400 to-purple-600',
  orange: 'from-orange-400 to-orange-600'
};

const GEM_SHADOWS = {
  red: 'shadow-red-500/50',
  blue: 'shadow-blue-500/50',
  green: 'shadow-green-500/50', 
  yellow: 'shadow-yellow-500/50',
  purple: 'shadow-purple-500/50',
  orange: 'shadow-orange-500/50'
};

const GEM_ICONS = {
  red: '💎',
  blue: '🔷',
  green: '💚',
  yellow: '⭐',
  purple: '🔮',
  orange: '🧡'
};

export function GemComponent({ gem, isSelected, isAnimating, onClick }: GemComponentProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const handleClick = () => {
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 600);
    onClick();
  };

  return (
    <button
      className={`
        w-full h-full relative rounded-lg transition-all duration-200 transform
        bg-gradient-to-br ${GEM_COLORS[gem.type]}
        ${GEM_SHADOWS[gem.type]} shadow-lg
        ${isSelected ? 'ring-4 ring-white/80 ring-offset-2 ring-offset-transparent scale-110 gem-pulse' : ''}
        ${isPressed ? 'scale-95' : 'hover:scale-105'}
        ${isAnimating ? 'gem-explode' : ''}
        ${showSparkle ? 'gem-pulse' : ''}
        active:scale-95
        border border-white/20
        gem-fall
      `}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* 宝石主体 */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/30 to-transparent"></div>
      
      {/* 宝石图标 */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl">
        {GEM_ICONS[gem.type]}
      </div>
      
      {/* 高光效果 */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full blur-sm"></div>
      
      {/* 特殊宝石标识 */}
      {gem.special !== 'none' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white/50 flex items-center justify-center">
          <span className="text-xs">✨</span>
        </div>
      )}
      
      {/* 选中光环 */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg bg-white/20 animate-pulse"></div>
      )}
      
      {/* 消除动画 */}
      {isAnimating && (
        <>
          <div className="absolute inset-0 rounded-lg bg-white/40 animate-ping"></div>
          {/* 爆炸粒子效果 */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full floating-particle"
              style={{
                left: `${25 + i * 15}%`,
                top: `${25 + i * 15}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </>
      )}
      
      {/* 点击闪烁效果 */}
      {showSparkle && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 text-yellow-300 magic-sparkle">✨</div>
        </div>
      )}
    </button>
  );
}