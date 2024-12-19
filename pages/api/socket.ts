import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
  io?: Server;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

// 使用全局变量来保持状态
let globalIo: Server | null = null;
const players = new Map();
let isRobotWatching = true;
let robotInterval: NodeJS.Timeout | null = null;

const getRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomWatchDuration = () => {
  return Math.floor(Math.random() * 4000) + 3000;
};

const getRandomRestDuration = () => {
  return Math.floor(Math.random() * 2000) + 1000;
};

const updateRobotState = () => {
  if (!globalIo) return;
  
  isRobotWatching = !isRobotWatching;
  globalIo.emit('robotStateChanged', isRobotWatching);
  
  const nextDuration = isRobotWatching ? 
    getRandomWatchDuration() : 
    getRandomRestDuration();
    
  robotInterval = setTimeout(updateRobotState, nextDuration);
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log("Socket server already running");
    res.end();
    return;
  }

  console.log("Setting up socket server");
  const io = new Server(res.socket.server);
  res.socket.server.io = io;
  globalIo = io;

  // 只在第一次初始化时启动机器人行为
  if (!robotInterval) {
    console.log("Starting robot behavior");
    robotInterval = setTimeout(updateRobotState, getRandomWatchDuration());
  }

  io.on('connection', (socket) => {
    console.log("New client connected");
    socket.emit('robotStateChanged', isRobotWatching);
    
    socket.on('joinGame', (name) => {
      socket.join('gameRoom');
      
      const playerCount = players.size;
      const newPlayer = {
        id: socket.id,
        name: name,
        position: playerCount % 2 === 0 ? 0 : 100,
        isAlive: true,
        color: getRandomColor(),
        startSide: (playerCount % 2 === 0 ? 'left' : 'right') as 'left' | 'right'
      };
      
      players.set(socket.id, newPlayer);

      // 向新玩家发送所有现有玩家的信息，包括位置
      players.forEach((player) => {
        socket.emit('playerJoined', player);
      });

      // 向其他玩家广播新玩家的信息
      socket.broadcast.to('gameRoom').emit('playerJoined', newPlayer);
    });

    socket.on('playerMove', (data) => {
      if (players.has(socket.id)) {
        const currentPlayer = players.get(socket.id)!;
        const updatedPlayer = {
          ...currentPlayer,
          position: data.position
        };
        players.set(socket.id, updatedPlayer);
        io!.to('gameRoom').emit('playerMoved', {
          id: socket.id,
          position: data.position
        });
      }
    });

    socket.on('playerEliminated', (data) => {
      if (players.has(data.id)) {
        const player = players.get(data.id)!;
        player.isAlive = false;
        players.set(data.id, player);
        io!.to('gameRoom').emit('playerEliminated', { id: data.id });
      }
    });

    socket.on('disconnect', () => {
      if (players.has(socket.id)) {
        players.delete(socket.id);
        io!.emit('playerLeft', { id: socket.id });
      }
    });

    socket.on('gameWon', (data) => {
      const winner = players.get(data.winnerId);
      if (winner) {
        io!.to('gameRoom').emit('gameEnded', {
          winnerId: data.winnerId,
          winnerName: winner.name
        });
      }
    });
  });

  res.end();
};

export default SocketHandler;

export const cleanupRobotInterval = () => {
  if (robotInterval) {
    clearTimeout(robotInterval);
    robotInterval = null;
  }
}; 