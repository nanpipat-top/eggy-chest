"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Egg } from 'lucide-react';

const TurnIndicator: React.FC = () => {
  const { currentPlayer, gameStatus } = useGameStore();
  
  if (gameStatus !== 'playing') {
    return null;
  }
  
  const playerColors = {
    player1: 'bg-gradient-to-r from-amber-300 to-amber-400 text-amber-900',
    player2: 'bg-gradient-to-r from-sky-300 to-sky-400 text-sky-900',
  };
  
  const playerNames = {
    player1: 'Player 1',
    player2: 'Player 2',
  };
  
  return (
    <motion.div
      className="flex items-center justify-center mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg font-bold">Current Turn:</span>
        <motion.div
          className={`
            turn-active px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold
            ${playerColors[currentPlayer]}
          `}
          key={currentPlayer}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          style={{
            boxShadow: `0 6px 16px ${currentPlayer === 'player1' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(14, 165, 233, 0.4)'}`,
            border: '3px solid white'
          }}
        >
          <Egg className="w-5 h-5" />
          {playerNames[currentPlayer]}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TurnIndicator;