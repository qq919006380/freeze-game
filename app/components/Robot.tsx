import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';

interface RobotProps {
  onWatch: (watching: boolean) => void;
}

export default function Robot({ onWatch }: RobotProps) {
  const [isWatching, setIsWatching] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    socketRef.current = io();
    
    socketRef.current.on('robotStateChanged', (watching: boolean) => {
      setIsWatching(watching);
      onWatch(watching);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [onWatch]);

  return (
    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
      <div 
        className={`relative w-40 h-40 transition-transform duration-500
          ${isWatching ? 'rotate-180' : 'rotate-0'}`}
        data-testid="robot-hitbox"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-xl">
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-red-500 rounded-full 
            shadow-[0_0_10px_#ef4444] animate-pulse" />
          <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-red-500 rounded-full 
            shadow-[0_0_10px_#ef4444] animate-pulse" />
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
            w-16 h-2 bg-gray-600 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
            w-12 h-1 bg-gray-600 rounded-full" />
        </div>
      </div>
      
      <div className={`mt-8 text-center font-bold text-xl transition-colors duration-300
        ${isWatching ? 'text-red-500' : 'text-green-500'}`}>
        {isWatching ? '正在观察...' : '背对玩家'}
      </div>
    </div>
  );
}