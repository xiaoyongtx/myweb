'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDelay: number;
}

interface MagicParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function MagicBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [particles, setParticles] = useState<MagicParticle[]>([]);

  // 初始化星星
  useEffect(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < 50; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleDelay: Math.random() * 3
      });
    }
    setStars(newStars);
  }, []);

  // 粒子动画
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticles = prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1
          }))
          .filter(particle => particle.life > 0);

        // 添加新粒子
        if (Math.random() < 0.3) {
          newParticles.push({
            id: Date.now() + Math.random(),
            x: Math.random() * 100,
            y: 100,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 2 - 1,
            life: 60,
            maxLife: 60
          });
        }

        return newParticles;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      
      {/* 星空 */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.twinkleDelay}s`
          }}
        />
      ))}
      
      {/* 魔法粒子 */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.life / particle.maxLife,
            transform: `scale(${particle.life / particle.maxLife})`
          }}
        />
      ))}
      
      {/* 魔法符文 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div className="text-9xl text-white animate-spin" style={{ animationDuration: '20s' }}>
          ✦
        </div>
      </div>
      
      {/* 光晕效果 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
}