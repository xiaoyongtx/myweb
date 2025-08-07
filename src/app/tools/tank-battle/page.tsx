'use client';

import { useEffect, useRef, useState } from 'react';

export default function TankBattle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<any>(null);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'paused' | 'gameOver'>('playing');

  useEffect(() => {
    if (canvasRef.current) {
      // 动态导入游戏逻辑
      import('./TankGame').then(({ TankGame }) => {
        gameRef.current = new TankGame(canvasRef.current!, setScore, setGameStatus);
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, []);

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.restart();
      setScore(0);
      setGameStatus('playing');
    }
  };

  const handlePause = () => {
    if (gameRef.current) {
      if (gameStatus === 'playing') {
        gameRef.current.pause();
        setGameStatus('paused');
      } else if (gameStatus === 'paused') {
        gameRef.current.resume();
        setGameStatus('playing');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 游戏标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">坦克大战</h1>
          <p className="text-gray-300">经典坦克大战游戏，消灭敌方坦克获得高分！</p>
        </div>

        {/* 游戏信息栏 */}
        <div className="flex justify-between items-center mb-6 bg-gray-800 rounded-lg p-4">
          <div className="text-white">
            <span className="text-2xl font-bold">得分: {score}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePause}
              disabled={gameStatus === 'gameOver'}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {gameStatus === 'paused' ? '继续' : '暂停'}
            </button>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              重新开始
            </button>
          </div>
        </div>

        {/* 游戏画布 */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border-2 border-gray-600 rounded-lg bg-gray-800"
            />
            {gameStatus === 'paused' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-3xl font-bold">游戏暂停</div>
              </div>
            )}
            {gameStatus === 'gameOver' && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <div className="text-4xl font-bold mb-4">游戏结束</div>
                  <div className="text-2xl mb-6">最终得分: {score}</div>
                  <button
                    onClick={handleRestart}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-lg transition-colors"
                  >
                    再玩一次
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 游戏说明 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">游戏说明</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">操作方式</h3>
              <ul className="space-y-1">
                <li>• <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">W</kbd> - 向上移动</li>
                <li>• <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">S</kbd> - 向下移动</li>
                <li>• <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">A</kbd> - 向左移动</li>
                <li>• <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">D</kbd> - 向右移动</li>
                <li>• <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">空格</kbd> - 射击</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">游戏规则</h3>
              <ul className="space-y-1">
                <li>• 绿色坦克是你的坦克</li>
                <li>• 红色坦克是敌方坦克</li>
                <li>• 击毁一个敌方坦克得100分</li>
                <li>• 避免被敌方子弹击中</li>
                <li>• 避免与敌方坦克碰撞</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}