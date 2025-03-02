"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  getGameRoom, 
  subscribeToGameRoom, 
  joinGameRoom as joinRoom, 
  leaveGameRoom as leaveRoom, 
  setPlayerReady, 
  makeMove, 
  startGame,
  completeCoinFlip,
  deleteGameRoom
} from '@/lib/online-game';
import { GameRoom, Player, Piece, BoardPosition } from '@/lib/types';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, Egg, Users, Copy, Clock, Trophy } from 'lucide-react';
import OnlinePlayerArea from '@/components/game/OnlinePlayerArea';
import OnlineCoinFlip from '@/components/ui/OnlineCoinFlip';
import OnlineBoard from '@/components/game/OnlineBoard';
import { isValidMove } from '@/lib/game-utils';
import { playSound } from '@/lib/sounds';

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
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validCells, setValidCells] = useState<{row: number, col: number}[]>([]);
  
  const { setGameState } = useGameStore();
  
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
    
    const joinGameRoom = async () => {
      try {
        await joinRoom(roomId, playerName, playerId);
      } catch (error) {
        console.error('Error joining room:', error);
        setError('Failed to join room');
      }
    };
    
    joinGameRoom();
    
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
      leaveRoom(roomId, playerId);
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
  
  // Handle piece selection
  const handleSelectPiece = (piece: Piece) => {
    setSelectedPiece(piece);
    
    // Calculate valid cells for this piece
    if (room && room.status === 'playing') {
      const newValidCells: {row: number, col: number}[] = [];
      
      // Check each cell on the board
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const position = `${row}-${col}` as BoardPosition;
          const cellState = room.gameState.board[position];
          
          // Check if this is a valid move
          if (isValidMove(room.gameState.board, row, col, piece)) {
            newValidCells.push({ row, col });
          }
        }
      }
      
      setValidCells(newValidCells);
    }
  };
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (selectedPiece && room && room.status === 'playing' && 
        playerRole === room.currentTurn) {
      // Make the move
      makeMove(roomId, playerId, selectedPiece, row, col);
      playSound('place');
      
      // Reset selection
      setSelectedPiece(null);
      setValidCells([]);
    }
  };
  
  // Handle starting the game
  const handleStartGame = async () => {
    if (!room || playerRole === 'spectator') return;
    
    try {
      await startGame(roomId, playerId);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };
  
  // Handle completing the coin flip
  const handleCoinFlipComplete = async () => {
    try {
      await completeCoinFlip(roomId);
    } catch (error) {
      console.error('Error completing coin flip:', error);
    }
  };
  
  // Copy room code to clipboard
  const copyRoomCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(roomId);
      setRoomCodeCopied(true);
      setTimeout(() => setRoomCodeCopied(false), 2000);
    }
  };
  
  // Handle returning to main menu
  const handleMainMenu = async () => {
    if (playerRole !== 'spectator') {
      await leaveRoom(roomId, playerId);
    }
    
    // Delete the room if the game is finished
    if (room?.status === 'finished') {
      try {
        await deleteGameRoom(roomId);
        console.log('Game room deleted successfully');
      } catch (error) {
        console.error('Error deleting game room:', error);
      }
    }
    
    // Clear any session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`eggyChessOnlineGame-${roomId}`);
    }
    
    router.push('/');
  };
  
  // Handle play again
  const handlePlayAgain = async () => {
    // Delete the current room since the game is finished
    try {
      await deleteGameRoom(roomId);
      console.log('Game room deleted successfully');
    } catch (error) {
      console.error('Error deleting game room:', error);
    }
    
    // Clear any session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`eggyChessOnlineGame-${roomId}`);
    }
    
    // Create a new game
    router.push('/online');
  };
  
  // Clear session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only clean up if the user is a player and the game is finished
      if (playerRole !== 'spectator' && room?.status === 'finished') {
        // We can't await in beforeUnload, so this is a best-effort attempt
        deleteGameRoom(roomId).catch(console.error);
      }
      
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`eggyChessOnlineGame-${roomId}`);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Clean up when component unmounts
      if (playerRole !== 'spectator' && room?.status === 'finished') {
        deleteGameRoom(roomId).catch(console.error);
      }
      
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`eggyChessOnlineGame-${roomId}`);
      }
    };
  }, [roomId, playerRole, room?.status]);
  
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
        <Button onClick={handleMainMenu}>Return to Main Menu</Button>
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
          onClick={handleMainMenu}
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
              ) : room.status === 'coin_flip' ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
                  Coin Flip in Progress
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
            
            {/* Start Game button - only visible when both players are ready */}
            {playerRole !== 'spectator' && room.status === 'waiting' && 
              room.player1?.isReady && room.player2?.isReady && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="default"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleStartGame}
                >
                  Start Game
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Coin Flip */}
      {room.status === 'coin_flip' && (
        <div className="w-full max-w-4xl mb-6 flex justify-center">
          <OnlineCoinFlip 
            firstPlayer={room.currentTurn}
            onComplete={handleCoinFlipComplete}
            playerName1={room.player1?.name || 'Player 1'}
            playerName2={room.player2?.name || 'Player 2'}
          />
        </div>
      )}
      
      {/* Game board */}
      {room.status === 'playing' && (
        <div className="w-full max-w-4xl">
          <div className="flex flex-col items-center gap-6">
            {/* Game layout with players on the sides */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
              {/* Player 2 Area - Left */}
              <div className="player-area-container">
                <OnlinePlayerArea
                  player="player2"
                  availablePieces={room.gameState.availablePieces.player2}
                  isCurrentPlayer={room.currentTurn === 'player2' && playerRole === 'player2'}
                  onSelectPiece={handleSelectPiece}
                />
              </div>
              
              {/* Game Board */}
              <div className="game-board-container w-full max-w-xl mx-auto">
                <OnlineBoard
                  board={room.gameState.board}
                  currentTurn={room.currentTurn}
                  validCells={validCells}
                  onCellClick={handleCellClick}
                  playerName1={room.player1?.name}
                  playerName2={room.player2?.name}
                />
              </div>
              
              {/* Player 1 Area - Right */}
              <div className="player-area-container">
                <OnlinePlayerArea
                  player="player1"
                  availablePieces={room.gameState.availablePieces.player1}
                  isCurrentPlayer={room.currentTurn === 'player1' && playerRole === 'player1'}
                  onSelectPiece={handleSelectPiece}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Game waiting message */}
      {room.status === 'waiting' && (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20 text-white text-center">
          <Egg className="w-16 h-16 mx-auto mb-4 text-amber-400 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">Waiting for players</h2>
          <p className="mb-4">Both players need to be ready to start the game.</p>
          
          {playerRole === 'spectator' && !room.player2 && (
            <Button onClick={() => joinRoom(roomId, playerName, playerId)}>
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
              <Button onClick={handleMainMenu} className="w-full">
                Return to Main Menu
              </Button>
              {/* <Button onClick={handlePlayAgain} className="w-full">
                Play Again
              </Button> */}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}