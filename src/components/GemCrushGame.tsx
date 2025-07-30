'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GemBoard } from './GemBoard';
import { GameUI } from './GameUI';
import { useGemCrushGame } from '@/hooks/useGemCrushGame';

export function GemCrushGame() {
  const {
    board,
    score,
    moves,
    level,
    stars,
    target,
    gameState,
    selectedGem,
    animatingGems,
    combo,
    handleGemClick,
    resetGame,
    nextLevel,
    toggleSound,
    isSoundEnabled
  } = useGemCrushGame();

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* 游戏UI */}
      <GameUI 
        score={score}
        moves={moves}
        level={level}
        stars={stars}
        target={target}
        gameState={gameState}
        combo={combo}
        onReset={resetGame}
        onNextLevel={nextLevel}
        onToggleSound={toggleSound}
        isSoundEnabled={isSoundEnabled}
      />
      
      {/* 游戏棋盘 */}
      <GemBoard 
        board={board}
        selectedGem={selectedGem}
        animatingGems={animatingGems}
        onGemClick={handleGemClick}
      />
      
      {/* 游戏说明 */}
      <div className="text-center text-white/80 max-w-md">
        <p className="text-sm">
          交换相邻宝石，匹配3个或以上同色宝石来消除它们！
        </p>
        <p className="text-xs mt-2">
          匹配4个生成特殊宝石，匹配5个生成魔法宝石！
        </p>
      </div>
    </div>
  );
}