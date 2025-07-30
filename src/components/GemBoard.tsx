'use client';

import { Gem } from '@/hooks/useGemCrushGame';
import { GemComponent } from './GemComponent';

interface GemBoardProps {
  board: Gem[][];
  selectedGem: {row: number, col: number} | null;
  animatingGems: Set<string>;
  onGemClick: (row: number, col: number) => void;
}

export function GemBoard({ board, selectedGem, animatingGems, onGemClick }: GemBoardProps) {
  if (!board.length) return null;

  return (
    <div className="relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800/20 to-blue-800/20 rounded-2xl backdrop-blur-sm border border-white/10"></div>
      
      {/* 棋盘 */}
      <div className="relative p-4">
        <div className="grid grid-cols-8 gap-1 bg-black/20 p-2 rounded-xl">
          {board.map((row, rowIndex) =>
            row.map((gem, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square relative"
              >
                <GemComponent
                  gem={gem}
                  isSelected={selectedGem?.row === rowIndex && selectedGem?.col === colIndex}
                  isAnimating={animatingGems.has(gem.id)}
                  onClick={() => onGemClick(rowIndex, colIndex)}
                />
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* 魔法粒子效果 */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}