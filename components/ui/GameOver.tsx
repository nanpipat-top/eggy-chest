"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { playSound } from '@/lib/sounds';
import confetti from 'canvas-confetti';

interface GameOverProps {
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ onPlayAgain, onMainMenu }) => {
  const { gameStatus, winner } = useGameStore();
  
  useEffect(() => {
    if (gameStatus === 'win') {
      playSound('win');
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else if (gameStatus === 'draw') {
      playSound('draw');
    }
  }, [gameStatus]);
  
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white p-8 rounded-3xl w-full max-w-sm mx-4 shadow-2xl border-4 border-white"
        style={{
          background: 'url(/images/wooden-board.jpg)',
          backgroundSize: 'cover',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
      >
        <div className="bg-white/90 p-6 rounded-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{
            color: winner === 'player1' ? '#FFA500' : '#FF3333',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {gameStatus === 'win' ? 'Victory!' : 'It\'s a Draw!'}
          </h2>
          
          {gameStatus === 'win' && (
            <div className="flex justify-center mb-6">
              <img 
                src={winner === 'player1' ? '/images/chick-large.png' : '/images/devil-large.png'} 
                alt={winner === 'player1' ? 'Player 1 wins' : 'Player 2 wins'}
                className="w-24 h-24 bounce-animation"
              />
            </div>
          )}
          
          <p className="text-center mb-8 font-bold text-lg">
            {gameStatus === 'win' 
              ? `${winner === 'player1' ? 'Player 1' : 'Player 2'} wins the game!` 
              : 'No more moves available!'}
          </p>
          
          <div className="flex flex-col gap-3">
            <motion.button
              className="game-button w-full"
              onClick={onPlayAgain}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95, y: 0 }}
            >
              Play Again
            </motion.button>
            
            <motion.button
              className="game-button w-full"
              onClick={onMainMenu}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95, y: 0 }}
            >
              Main Menu
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameOver;