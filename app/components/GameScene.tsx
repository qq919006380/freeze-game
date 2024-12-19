'use client'
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Robot from './Robot';
import Player from './Player';
import {
    playersAtom,
    gameStateAtom,
    addPlayerAtom,
    removePlayerAtom,
    updatePlayerPositionAtom,
    eliminatePlayerAtom
} from '@/store/atoms';
import { useAtom, useSetAtom } from 'jotai';

export default function GameScene() {
    const getStoredPlayerName = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('playerName') || '';
        }
        return '';
    };
    const [playerName, setPlayerName] = useState(getStoredPlayerName());
    const [isJoined, setIsJoined] = useState(false);
    const [isWatching, setIsWatching] = useState(true);

    const socketRef = useRef<Socket>(null);
    
    const [players] = useAtom(playersAtom);
    const [gameState, setGameState] = useAtom(gameStateAtom);
    const addPlayer = useSetAtom(addPlayerAtom);
    const removePlayer = useSetAtom(removePlayerAtom);
    const updatePlayerPosition = useSetAtom(updatePlayerPositionAtom);
    const eliminatePlayer = useSetAtom(eliminatePlayerAtom);

    const handleWatch = (watching: boolean) => {
        setIsWatching(watching);
        if (watching && gameState === 'playing') {
            const currentPlayer = players.find(p => p.id === socketRef.current?.id);
            if (currentPlayer?.isAlive) {
                socketRef.current?.emit('checkMovement', { id: currentPlayer.id });
            }
        }
    };

    const checkWinCondition = (player: Player) => {
        if (!player.isAlive) return;
        
        const robotElement = document.querySelector('[data-testid="robot-hitbox"]');
        if (!robotElement) return;
        
        const robotRect = robotElement.getBoundingClientRect();
        const playerElement = document.querySelector(`[data-player-id="${player.id}"]`);
        if (!playerElement) return;
        
        const playerRect = playerElement.getBoundingClientRect();
        
        // 检查碰撞
        if (
            playerRect.left < robotRect.right &&
            playerRect.right > robotRect.left &&
            playerRect.top < robotRect.bottom &&
            playerRect.bottom > robotRect.top &&
            !isWatching // 机器人背对时才能获胜
        ) {
            setGameState('ended');
            socketRef.current?.emit('gameWon', { winnerId: player.id });
        }
    };


    useEffect(() => {
        fetch('/api/socket');
        socketRef.current = io();

        socketRef.current.on('connect', () => {
            // 连接后等用户输入名字
        });

        socketRef.current.on('playerJoined', (player) => {
            const playerWithPosition = {
                ...player,
                position: player.position ?? (player.startSide === 'left' ? 0 : 100),
                startSide: player.startSide ?? (players.length % 2 === 0 ? 'left' : 'right')
            };
            
            addPlayer(playerWithPosition);

            // 当玩家量达到要求时，开始游戏
            if (players.length >= 2) {
                setGameState('playing');
            }
        });
        
        socketRef.current.on('playerMoved', (data) => {
            updatePlayerPosition({id: data.id, position: data.position});
        });

        socketRef.current.on('playerEliminated', (data) => {
            eliminatePlayer(data.id);
        });

        socketRef.current.on('playerLeft', (data) => {
            removePlayer(data.id);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);
    

    const handleJoinGame = () => {
        if (playerName.trim() && socketRef.current) {
            localStorage.setItem('playerName', playerName.trim());
            socketRef.current.emit('joinGame', playerName);
            setIsJoined(true);
        }
    };

    if (!isJoined) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Card>
                    <CardContent className="p-6">
                        <Input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name"
                            className="mb-4"
                        />
                        <Button onClick={handleJoinGame}>
                            Join Game
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            
            {/* 游戏界面 */}
            <div className="relative w-full h-full">
                {/* 玩家列表卡片 */}
                <Card className="absolute top-4 left-4 w-64 bg-black/40 backdrop-blur-sm border-gray-800">
                    <CardContent className="p-4">
                        <h2 className="text-xl font-bold mb-4 text-white">Players</h2>
                        <div className="space-y-2">
                            {players.map(player => (
                                <div key={player.id} className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: player.color }}
                                    />
                                    <span className="text-white">{player.name}</span>
                                    <Badge variant={player.isAlive ? "default" : "secondary"}>
                                        {player.isAlive ? 'Alive' : 'Eliminated'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 游戏状态 */}
                <div className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm">
                    <span className="text-white font-bold">Status: {gameState}</span>
                </div>

                {/* 游戏元素 */}
                <Robot onWatch={handleWatch} />
                {players.map(player => (
                    <Player 
                        key={player.id} 
                        {...player} 
                        onMove={(position) => {
                            if (player.id === socketRef.current?.id) {
                                socketRef.current?.emit('playerMove', { position });
                                updatePlayerPosition({ id: player.id, position });
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
} 