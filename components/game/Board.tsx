"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Cell from './Cell';
import { useGameStore } from '@/lib/store';

const Board: React.FC = () => {
  const { board, placePiece, gameStatus, currentPlayer } = useGameStore();
  
  const handleCellClick = (row: number, col: number) => {
    if (gameStatus === 'playing') {
      placePiece(row, col);
    }
  };
  
  return (
    <div className="game-container w-full mx-auto">
      <div className={`
        turn-indicator
        ${currentPlayer === 'player1' ? 'player1-turn' : 'player2-turn'}
      `}>
        {currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s Turn
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
            {board.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <Cell 
                  key={`${rowIndex}-${colIndex}`} 
                  cell={cell} 
                  onClick={() => handleCellClick(rowIndex, colIndex)} 
                />
              ))
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Board;