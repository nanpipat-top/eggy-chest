"use client";

import React from 'react';
import { motion } from 'framer-motion';
import OnlineCell from './OnlineCell';
import { BoardPosition, Piece } from '@/lib/types';

interface OnlineBoardProps {
  board: Record<BoardPosition, { pieces: Piece[] }>;
  currentTurn: 'player1' | 'player2';
  validCells: { row: number; col: number }[];
  onCellClick: (row: number, col: number) => void;
  playerName1?: string;
  playerName2?: string;
}

const OnlineBoard: React.FC<OnlineBoardProps> = ({ 
  board, 
  currentTurn, 
  validCells, 
  onCellClick,
  playerName1 = 'Player 1',
  playerName2 = 'Player 2'
}) => {
  return (
    <div className="game-container w-full mx-auto">
      <div className={`
        turn-indicator
        ${currentTurn === 'player1' ? 'player1-turn' : 'player2-turn'}
      `}>
        {currentTurn === 'player1' ? playerName1 : playerName2}'s Turn
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
        <div className="game-board wooden-board-bg">
          <div className="grid grid-cols-3 gap-4 w-full h-full">
            {Array.from({ length: 3 }, (_, rowIndex) => (
              Array.from({ length: 3 }, (_, colIndex) => {
                const position = `${rowIndex}-${colIndex}` as BoardPosition;
                const cell = board[position] || { pieces: [] };
                
                return (
                  <OnlineCell 
                    key={`${rowIndex}-${colIndex}`} 
                    row={rowIndex}
                    col={colIndex}
                    pieces={cell.pieces} 
                    isValidMove={validCells.some(cell => cell.row === rowIndex && cell.col === colIndex)}
                    onClick={() => onCellClick(rowIndex, colIndex)} 
                  />
                );
              })
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnlineBoard;
