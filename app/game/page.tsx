"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Board from '@/components/game/Board';
import PieceSelector from '@/components/game/PieceSelector';
import GameControls from '@/components/game/GameControls';
import CoinFlip from '@/components/ui/CoinFlip';
import GameOver from '@/components/ui/GameOver';
import { useGameStore } from '@/lib/store';
import { Player } from '@/lib/types';

export default function GamePage() {
  const [showCoinFlip, setShowCoinFlip] = useState(true);
  const { initializeGame, resetGame, gameStatus, currentPlayer, availablePieces } = useGameStore();
  const router = useRouter();
  
  useEffect(() => {
    // Reset the game state when the component mounts
    resetGame();
  }, [resetGame]);
  
  const handleCoinFlipComplete = (firstPlayer: Player) => {
    // Set the first player and start the game
    initializeGame();
    setShowCoinFlip(false);
  };
  
  const handlePlayAgain = () => {
    resetGame();
    setShowCoinFlip(true);
  };
  
  const handleMainMenu = () => {
    router.push('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {showCoinFlip ? (
        <CoinFlip onComplete={handleCoinFlipComplete} />
      ) : (
        <motion.div 
          className="game-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="game-title text-4xl font-extrabold mb-2 text-center"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            Eggy Chess
          </motion.h1>
          
          {/* Player 2 Area - Top */}
          <motion.div 
            className="player-area player2-area w-full max-w-md"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-2">Player 2</h3>
            <PieceSelector 
              player="player2" 
              isActive={currentPlayer === 'player2'} 
              pieceCounts={availablePieces.player2}
            />
          </motion.div>
          
          {/* Game Board */}
          <div className="game-board-container">
            <Board />
          </div>
          
          {/* Player 1 Area - Bottom */}
          <motion.div 
            className="player-area player1-area w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-2">Player 1</h3>
            <PieceSelector 
              player="player1" 
              isActive={currentPlayer === 'player1'} 
              pieceCounts={availablePieces.player1}
            />
          </motion.div>
          
          <div className="mt-4 flex justify-center">
            <GameControls />
          </div>
          
          {(gameStatus === 'win' || gameStatus === 'draw') && (
            <GameOver 
              onPlayAgain={handlePlayAgain}
              onMainMenu={handleMainMenu}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};