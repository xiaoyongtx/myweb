'use client';

import { GameState } from '@/hooks/useGemCrushGame';

interface GameUIProps {
  score: number;
  moves: number;
  level: number;
  stars: number;
  target: { type: string; value: number; current: number };
  gameState: GameState;
  combo: number;
  onReset: () => void;
  onNextLevel: () => void;
  onToggleSound?: () => boolean;
  isSoundEnabled?: boolean;
}

export function GameUI({ 
  score, 
  moves, 
  level, 
  stars, 
  target, 
  gameState, 
  combo,
  onReset, 
  onNextLevel,
  onToggleSound,
  isSoundEnabled = true
}: GameUIProps) {
  const progress = Math.min((target.current / target.value) * 100, 100);

  return (
    <div className="w-full max-w-md space-y-4">
      {/* 顶部信息栏 */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <div className="flex justify-between items-center mb-3">
          <div className="text-center">
            <div className="text-white/80 text-sm">关卡</div>
            <div className="text-white text-xl font-bold">{level}</div>
          </div>
          <div className="text-center">
            <div className="text-white/80 text-sm">分数</div>
            <div className="text-white text-xl font-bold">{score.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-white/80 text-sm">步数</div>
            <div className={`text-xl font-bold ${moves <= 5 ? 'text-red-400' : 'text-white'}`}>
              {moves}
            </div>
          </div>
        </div>
        
        {/* 目标进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/80">
            <span>目标: {target.value.toLocaleString()}</span>
            <span>{target.current.toLocaleString()}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* 星级显示 */}
        <div className="flex justify-center mt-3 space-x-1">
          {[1, 2, 3].map(star => (
            <span 
              key={star}
              className={`text-2xl ${star <= stars ? 'text-yellow-400' : 'text-white/30'}`}
            >
              ⭐
            </span>
          ))}
        </div>
        
        {/* 音效控制 */}
        {onToggleSound && (
          <div className="flex justify-center mt-3">
            <button
              onClick={onToggleSound}
              className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-200 border border-white/20"
              title={isSoundEnabled ? "关闭音效" : "开启音效"}
            >
              <span className="text-xl">
                {isSoundEnabled ? "🔊" : "🔇"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 连击显示 */}
      {combo > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-3 border border-purple-300/30 animate-pulse">
          <div className="text-center">
            <div className="text-white text-lg font-bold">
              🔥 {combo}x 连击! 🔥
            </div>
            <div className="text-white/80 text-sm">
              连击奖励: +{combo * 5} 分
            </div>
          </div>
        </div>
      )}

      {/* 游戏结束弹窗 */}
      {gameState !== 'playing' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-sm mx-4 text-center border border-white/30">
            {gameState === 'won' ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-purple-800 mb-2">关卡完成!</h2>
                <div className="flex justify-center space-x-1 mb-4">
                  {[1, 2, 3].map(star => (
                    <span 
                      key={star}
                      className={`text-3xl ${star <= stars ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  最终分数: {score.toLocaleString()}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={onNextLevel}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                  >
                    下一关 ➡️
                  </button>
                  <button
                    onClick={onReset}
                    className="w-full bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
                  >
                    重新开始
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">😢</div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">游戏结束</h2>
                <p className="text-gray-700 mb-6">
                  步数用完了！最终分数: {score.toLocaleString()}
                </p>
                <button
                  onClick={onReset}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
                >
                  再试一次 🔄
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}