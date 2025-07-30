import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameSounds } from './useGameSounds';

export type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
export type SpecialType = 'none' | 'horizontal' | 'vertical' | 'bomb' | 'magic';

export interface Gem {
  id: string;
  type: GemType;
  special: SpecialType;
  row: number;
  col: number;
  isAnimating?: boolean;
  isSelected?: boolean;
  isMatched?: boolean;
}

export type GameState = 'playing' | 'won' | 'lost' | 'paused';

const BOARD_SIZE = 8;
const GEM_TYPES: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export function useGemCrushGame() {
  const [board, setBoard] = useState<Gem[][]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);
  const [target, setTarget] = useState({ type: 'score', value: 1000, current: 0 });
  const [gameState, setGameState] = useState<GameState>('playing');
  const [selectedGem, setSelectedGem] = useState<{row: number, col: number} | null>(null);
  const [animatingGems, setAnimatingGems] = useState<Set<string>>(new Set());
  const [combo, setCombo] = useState(0);
  
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sounds = useGameSounds();

  // 初始化棋盘
  const initializeBoard = useCallback(() => {
    const newBoard: Gem[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        let gemType: GemType;
        do {
          gemType = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
        } while (
          (col >= 2 && newBoard[row][col-1]?.type === gemType && newBoard[row][col-2]?.type === gemType) ||
          (row >= 2 && newBoard[row-1]?.[col]?.type === gemType && newBoard[row-2]?.[col]?.type === gemType)
        );
        
        newBoard[row][col] = {
          id: `${row}-${col}`,
          type: gemType,
          special: 'none',
          row,
          col
        };
      }
    }
    return newBoard;
  }, []);

  // 检查匹配
  const findMatches = useCallback((board: Gem[][]) => {
    const matches: Gem[] = [];
    const visited = new Set<string>();

    // 检查水平匹配
    for (let row = 0; row < BOARD_SIZE; row++) {
      let count = 1;
      let currentType = board[row][0].type;
      for (let col = 1; col < BOARD_SIZE; col++) {
        if (board[row][col].type === currentType) {
          count++;
        } else {
          if (count >= 3) {
            for (let i = col - count; i < col; i++) {
              if (!visited.has(board[row][i].id)) {
                matches.push(board[row][i]);
                visited.add(board[row][i].id);
              }
            }
          }
          count = 1;
          currentType = board[row][col].type;
        }
      }
      if (count >= 3) {
        for (let i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
          if (!visited.has(board[row][i].id)) {
            matches.push(board[row][i]);
            visited.add(board[row][i].id);
          }
        }
      }
    }

    // 检查垂直匹配
    for (let col = 0; col < BOARD_SIZE; col++) {
      let count = 1;
      let currentType = board[0][col].type;
      for (let row = 1; row < BOARD_SIZE; row++) {
        if (board[row][col].type === currentType) {
          count++;
        } else {
          if (count >= 3) {
            for (let i = row - count; i < row; i++) {
              if (!visited.has(board[i][col].id)) {
                matches.push(board[i][col]);
                visited.add(board[i][col].id);
              }
            }
          }
          count = 1;
          currentType = board[row][col].type;
        }
      }
      if (count >= 3) {
        for (let i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
          if (!visited.has(board[i][col].id)) {
            matches.push(board[i][col]);
            visited.add(board[i][col].id);
          }
        }
      }
    }

    return matches;
  }, []);

  // 处理宝石点击
  const handleGemClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || animatingGems.size > 0) return;

    if (!selectedGem) {
      setSelectedGem({ row, col });
      sounds.playGemSelect();
    } else {
      const { row: selectedRow, col: selectedCol } = selectedGem;
      
      // 检查是否点击同一个宝石
      if (selectedRow === row && selectedCol === col) {
        setSelectedGem(null);
        return;
      }

      // 检查是否相邻
      const isAdjacent = 
        (Math.abs(selectedRow - row) === 1 && selectedCol === col) ||
        (Math.abs(selectedCol - col) === 1 && selectedRow === row);

      if (isAdjacent) {
        // 交换宝石
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(row => [...row]);
          const temp = newBoard[selectedRow][selectedCol];
          newBoard[selectedRow][selectedCol] = newBoard[row][col];
          newBoard[row][col] = temp;
          
          // 更新位置信息
          newBoard[selectedRow][selectedCol].row = selectedRow;
          newBoard[selectedRow][selectedCol].col = selectedCol;
          newBoard[row][col].row = row;
          newBoard[row][col].col = col;

          // 检查是否有匹配
          const matches = findMatches(newBoard);
          if (matches.length > 0) {
            setMoves(prev => prev - 1);
            processMatches(newBoard, matches);
          } else {
            // 如果没有匹配，交换回来
            sounds.playInvalidMove();
            const temp = newBoard[selectedRow][selectedCol];
            newBoard[selectedRow][selectedCol] = newBoard[row][col];
            newBoard[row][col] = temp;
            newBoard[selectedRow][selectedCol].row = selectedRow;
            newBoard[selectedRow][selectedCol].col = selectedCol;
            newBoard[row][col].row = row;
            newBoard[row][col].col = col;
          }

          return newBoard;
        });
        setSelectedGem(null);
      } else {
        setSelectedGem({ row, col });
      }
    }
  }, [selectedGem, gameState, animatingGems, findMatches]);

  // 处理匹配的宝石
  const processMatches = useCallback((board: Gem[][], matches: Gem[]) => {
    if (matches.length === 0) return;

    // 播放消除音效
    sounds.playGemCrush(matches.length);
    
    // 增加连击
    setCombo(prev => {
      const newCombo = prev + 1;
      if (newCombo > 1) {
        sounds.playCombo(newCombo);
      }
      return newCombo;
    });
    
    // 清除连击计时器
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    
    // 设置新的连击计时器
    comboTimeoutRef.current = setTimeout(() => {
      setCombo(0);
    }, 2000);

    // 计算分数
    const baseScore = matches.length * 10;
    const comboBonus = combo * 5;
    const totalScore = baseScore + comboBonus;
    
    setScore(prev => prev + totalScore);
    setTarget(prev => ({ ...prev, current: prev.current + totalScore }));

    // 标记匹配的宝石为动画状态
    const matchIds = new Set(matches.map(gem => gem.id));
    setAnimatingGems(matchIds);

    // 延迟后移除匹配的宝石并下落
    setTimeout(() => {
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(row => [...row]);
        
        // 移除匹配的宝石
        matches.forEach(gem => {
          newBoard[gem.row][gem.col] = null as any;
        });

        // 宝石下落
        for (let col = 0; col < BOARD_SIZE; col++) {
          let writeIndex = BOARD_SIZE - 1;
          for (let row = BOARD_SIZE - 1; row >= 0; row--) {
            if (newBoard[row][col] !== null) {
              if (writeIndex !== row) {
                newBoard[writeIndex][col] = newBoard[row][col];
                newBoard[writeIndex][col].row = writeIndex;
                newBoard[row][col] = null as any;
              }
              writeIndex--;
            }
          }

          // 填充新宝石
          for (let row = writeIndex; row >= 0; row--) {
            const gemType = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
            newBoard[row][col] = {
              id: `${row}-${col}-${Date.now()}`,
              type: gemType,
              special: 'none',
              row,
              col
            };
          }
        }

        setAnimatingGems(new Set());
        
        // 检查新的匹配
        setTimeout(() => {
          const newMatches = findMatches(newBoard);
          if (newMatches.length > 0) {
            processMatches(newBoard, newMatches);
          }
        }, 300);

        return newBoard;
      });
    }, 500);
  }, [combo, findMatches]);

  // 重置游戏
  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setScore(0);
    setMoves(30);
    setLevel(1);
    setStars(0);
    setTarget({ type: 'score', value: 1000, current: 0 });
    setGameState('playing');
    setSelectedGem(null);
    setAnimatingGems(new Set());
    setCombo(0);
  }, [initializeBoard]);

  // 下一关
  const nextLevel = useCallback(() => {
    setLevel(prev => prev + 1);
    setMoves(30);
    setTarget(prev => ({ ...prev, value: prev.value + 500, current: 0 }));
    setBoard(initializeBoard());
    setGameState('playing');
    setSelectedGem(null);
    setAnimatingGems(new Set());
    setCombo(0);
  }, [initializeBoard]);

  // 检查游戏状态
  useEffect(() => {
    if (gameState === 'playing') {
      if (target.current >= target.value) {
        // 计算星级
        const percentage = target.current / target.value;
        let newStars = 1;
        if (percentage >= 1.5) newStars = 3;
        else if (percentage >= 1.2) newStars = 2;
        
        setStars(newStars);
        setGameState('won');
        sounds.playLevelComplete();
      } else if (moves <= 0) {
        setGameState('lost');
        sounds.playGameOver();
      }
    }
  }, [target, moves, gameState]);

  // 初始化
  useEffect(() => {
    setBoard(initializeBoard());
  }, [initializeBoard]);

  return {
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
    toggleSound: sounds.toggleSound,
    isSoundEnabled: sounds.isSoundEnabled()
  };
}