'use client'
import { useState, useEffect, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { playersAtom, addPlayerAtom } from '@/store/gameStore';

interface PlayerProps {
  id: string;
  name: string;
  position: number;
  isAlive: boolean;
  color: string;
  onMove: (position: number) => void;
  startSide: 'left' | 'right';
}

export default function Player({ id, name, position, isAlive, color, onMove, startSide }: PlayerProps) {
  const [isMoving, setIsMoving] = useState(false);
  const [players] = useAtom(playersAtom);
  const addPlayer = useSetAtom(addPlayerAtom);
  
  const handleMovement = useCallback(() => {
    if (isMoving && isAlive) {
      const moveStep = 1;
      const newPosition = startSide === 'left' 
        ? Math.min(position + moveStep, 100)
        : Math.max(position - moveStep, 0);
      
      onMove(newPosition);
    }
  }, [isMoving, isAlive, position, onMove, startSide]);

  useEffect(() => {
    const interval = setInterval(handleMovement, 50);
    return () => clearInterval(interval);
  }, [handleMovement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsMoving(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsMoving(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div 
      data-player-id={id}
      className={`absolute bottom-20 w-16 h-16 transition-all duration-200
        ${isAlive ? '' : 'opacity-50 scale-90'}
        ${isMoving ? 'animate-shake' : ''}
      `}
      style={{ 
        left: `${position}%`,
        transform: `translateX(-50%)`,
      }}
    >
      {/* 玩家角色 */}
      <div className="relative w-full h-full">
        {/* 玩家主体 */}
        <div 
          className="absolute inset-0 rounded-full shadow-lg transition-transform"
          style={{ backgroundColor: color }}
        >
          {/* 玩家眼睛 */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full" />
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white rounded-full" />
        </div>
        
        {/* 玩家名字 */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 
          text-sm font-bold text-white whitespace-nowrap">
          {name}
        </div>
      </div>
    </div>
  );
} 