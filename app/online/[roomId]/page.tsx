"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { subscribeToGameRoom, joinGameRoom, leaveGameRoom, setPlayerReady, makeMove } from '@/lib/online-game';
import { GameRoom, Player, Piece, BoardPosition } from '@/lib/types';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Egg, Users, Copy, CheckCircle, XCircle, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { isValidMove } from '@/lib/game-utils';
import { playSound } from '@/lib/sounds';
import DroppableCell from '@/components/game/DroppableCell';
import PlayerArea from '@/components/game/PlayerArea';

export default function OnlineGameRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState<Player | 'spectator'>('spectator');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [validDropCells, setValidDropCells] = useState<{row: number, col: number}[]>([]);
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);
  
  const { setGameState } = useGameStore();
  
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  // Load player info from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('playerId');
      const storedName = localStorage.getItem('playerName');
      
      if (storedId) setPlayerId(storedId);
      if (storedName) setPlayerName(storedName);
    }
  }, []);
  
  // Join the room and subscribe to updates
  useEffect(() => {
    if (!roomId || !playerId || !playerName) return;
    
    const joinRoom = async () => {
      try {
        await joinGameRoom(roomId, playerName, playerId);
      } catch (error) {
        console.error('Error joining room:', error);
        setError('Failed to join room');
      }
    };
    
    joinRoom();
    
    // Subscribe to room updates
    const unsubscribe = subscribeToGameRoom(roomId, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
        setIsLoading(false);
        
        // Update game state in store
        setGameState(updatedRoom.gameState);
        
        // Determine player role
        if (updatedRoom.player1?.id === playerId) {
          setPlayerRole('player1');
          setIsReady(updatedRoom.player1.isReady);
        } else if (updatedRoom.player2?.id === playerId) {
          setPlayerRole('player2');
          setIsReady(updatedRoom.player2.isReady);
        } else {
          setPlayerRole('spectator');
        }
      } else {
        setError('Room not found or was deleted');
        setIsLoading(false);
      }
    });
    
    // Leave room when component unmounts
    return () => {
      unsubscribe();
      leaveGameRoom(roomId, playerId);
    };
  }, [roomId, playerId, playerName, setGameState]);
  
  // Handle player ready status
  const handleReadyToggle = async () => {
    if (!room || playerRole === 'spectator') return;
    
    try {
      await setPlayerReady(roomId, playerId, !isReady);
    } catch (error) {
      console.error('Error setting ready status:', error);
    }
  };
  
  // Handle drag start
  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Find valid drop targets for this piece
    const piece = (active.data.current as any)?.piece;
    if (piece && room) {
      const validCells = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (isValidMove(room.gameState.board, row, col, piece)) {
            validCells.push({row, col});
          }
        }
      }
      setValidDropCells(validCells);
      playSound('select');
    }
  };
  
  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clear drag state first
    setActiveId(null);
    setValidDropCells([]);
    
    // Then handle the drop logic
    if (over && over.data.current && room) {
      const piece = (active.data.current as any)?.piece as Piece;
      const { row, col } = (over.data.current as any);
      
      if (piece && row !== undefined && col !== undefined) {
        try {
          await makeMove(roomId, playerId, piece, row, col);
        } catch (error) {
          console.error('Error making move:', error);
        }
      }
    }
  };
  
  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
    setValidDropCells([]);
    playSound('invalid');
  };
  
  // Copy room code to clipboard
  const copyRoomCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(roomId);
      setRoomCodeCopied(true);
      setTimeout(() => setRoomCodeCopied(false), 2000);
    }
  };
  
  // Return to main menu
  const handleReturnToMenu = async () => {
    if (room) {
      await leaveGameRoom(roomId, playerId);
    }
    router.push('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-white text-xl">Loading game room...</div>
      </div>
    );
  }
  
  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-white text-xl mb-4">{error || 'Room not found'}</div>
        <Button onClick={handleReturnToMenu}>Return to Main Menu</Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          backgroundImage: 'url(/images/nature-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.8)'
        }}
      />
      
      {/* Header with room info */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-4">
        <Button 
          variant="outline" 
          className="mb-4 md:mb-0 bg-white/20 text-white"
          onClick={handleReturnToMenu}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>
        
        <div className="flex flex-col items-center">
          <h1 className="game-title text-3xl font-extrabold mb-1">
            {room.name}
          </h1>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono">
              Room: {roomId}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 bg-white/20 text-white"
              onClick={copyRoomCode}
            >
              {roomCodeCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
            <Users className="inline-block mr-2 h-4 w-4" />
            {room.player1 ? 1 : 0}/2 Players
          </div>
          {room.spectators > 0 && (
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              <Egg className="inline-block mr-2 h-4 w-4" />
              {room.spectators} Spectators
            </div>
          )}
        </div>
      </div>
      
      {/* Game status */}
      <div className="w-full max-w-4xl mb-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">
              {room.status === 'waiting' ? (
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5 animate-pulse" />
                  Waiting for players to get ready
                </div>
              ) : room.status === 'playing' ? (
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${room.currentTurn === 'player1' ? 'bg-amber-400' : 'bg-blue-400'} animate-pulse`}></div>
                  {room.currentTurn === 'player1' ? room.player1?.name : room.player2?.name}'s Turn
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Game Finished - {room.winner === 'player1' ? room.player1?.name : room.player2?.name} Won!
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${room.player1?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="font-medium">{room.player1?.name || 'Waiting for Player 1'}</div>
                {room.player1 && (
                  <div className={`px-2 py-1 rounded-full text-xs ${room.player1.isReady ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {room.player1.isReady ? 'Ready' : 'Not Ready'}
                  </div>
                )}
              </div>
              
              <div className="text-sm">VS</div>
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${room.player2?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="font-medium">{room.player2?.name || 'Waiting for Player 2'}</div>
                {room.player2 && (
                  <div className={`px-2 py-1 rounded-full text-xs ${room.player2.isReady ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {room.player2.isReady ? 'Ready' : 'Not Ready'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Ready button for players */}
            {playerRole !== 'spectator' && room.status === 'waiting' && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant={isReady ? 'outline' : 'default'}
                  className={isReady ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : ''}
                  onClick={handleReadyToggle}
                >
                  {isReady ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Ready
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" /> Not Ready
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Game board */}
      {room.status !== 'waiting' && (
        <div className="w-full max-w-4xl">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex flex-col items-center gap-6">
              {/* Player 2 Area */}
              <div className="w-full max-w-md bg-green-100/20 rounded-lg p-2">
                <PlayerArea
                  player="player2"
                  availablePieces={room.gameState.availablePieces.player2}
                  isCurrentPlayer={room.currentTurn === 'player2' && playerRole === 'player2'}
                />
              </div>
              
              {/* Game Board */}
              <div className="game-container w-full max-w-xl mx-auto">
                <div className={`
                  turn-indicator
                  ${room.currentTurn === 'player1' ? 'player1-turn' : 'player2-turn'}
                `}>
                  {room.currentTurn === 'player1' ? room.player1?.name : room.player2?.name}'s Turn
                </div>
                
                <motion.div 
                  className="board-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    duration: 0.8 
                  }}
                >
                  <div className="game-board">
                    <div className="grid grid-cols-3 gap-4 w-full aspect-square">
                      {Array.from({ length: 3 }, (_, rowIndex) => (
                        Array.from({ length: 3 }, (_, colIndex) => {
                          const position = `${rowIndex}-${colIndex}` as const;
                          const cell = room.gameState.board[position];
                          const isValidTarget = validDropCells.some(
                            vc => vc.row === rowIndex && vc.col === colIndex
                          );
                          
                          return (
                            <DroppableCell 
                              key={`${rowIndex}-${colIndex}`} 
                              cell={cell}
                              isValidDropTarget={isValidTarget}
                            />
                          );
                        })
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Player 1 Area */}
              <div className="w-full max-w-md bg-yellow-100/20 rounded-lg p-2">
                <PlayerArea
                  player="player1"
                  availablePieces={room.gameState.availablePieces.player1}
                  isCurrentPlayer={room.currentTurn === 'player1' && playerRole === 'player1'}
                />
              </div>
            </div>
          </DndContext>
        </div>
      )}
      
      {/* Game waiting message */}
      {room.status === 'waiting' && (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20 text-white text-center">
          <Egg className="w-16 h-16 mx-auto mb-4 text-amber-400 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">Waiting for players</h2>
          <p className="mb-4">Both players need to be ready to start the game.</p>
          
          {playerRole === 'spectator' && !room.player2 && (
            <Button onClick={() => joinGameRoom(roomId, playerName, playerId)}>
              Join as Player 2
            </Button>
          )}
        </div>
      )}
      
      {/* Game finished message */}
      {room.status === 'finished' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 text-white text-center max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-bold mb-2">
              {room.gameState.gameStatus === 'draw' ? 'Game Draw!' : `${room.winner === 'player1' ? room.player1?.name : room.player2?.name} Wins!`}
            </h2>
            <p className="mb-6 text-lg">
              {room.gameState.gameStatus === 'draw' 
                ? 'All pieces have been used. The game ends in a draw!' 
                : `${room.winner === 'player1' ? room.player1?.name : room.player2?.name} has won the game!`}
            </p>
            
            <div className="flex flex-col gap-3">
              <Button onClick={handleReturnToMenu} className="w-full">
                Return to Main Menu
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}