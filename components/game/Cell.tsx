"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Cell as CellType } from '@/lib/types';
import { useGameStore } from '@/lib/store';
import { isValidMove } from '@/lib/game-utils';
import { playSound } from '@/lib/sounds';
import { getPieceImage } from '@/lib/game-utils';

interface CellProps {
  cell: CellType;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ cell, onClick }) => {
  // Handle case when cell is undefined
  if (!cell) {
    console.error('Cell is undefined');
    return <div className="game-cell w-full h-full bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20"></div>;
  }
  
  const { row, col, pieces } = cell;
  const { selectedPiece, board } = useGameStore();
  
  const isValidDropTarget = selectedPiece 
    ? isValidMove(board, row, col, selectedPiece)
    : false;
  
  const handleClick = () => {
    if (selectedPiece) {
      if (isValidDropTarget) {
        onClick();
        playSound('place');
      } else {
        playSound('invalid');
      }
    }
  };
  
  // Get the top piece to display (if any)
  const topPiece = pieces.length > 0 ? pieces[pieces.length - 1] : null;
  
  return (
    <motion.div
      className={cn(
        'game-cell w-full h-full flex items-center justify-center relative',
        isValidDropTarget && 'cell-highlight cursor-pointer',
        !isValidDropTarget && selectedPiece && 'invalid-cell'
      )}
      onClick={handleClick}
      whileHover={{ 
        scale: isValidDropTarget ? 1.05 : 1,
        y: isValidDropTarget ? -5 : 0
      }}
      whileTap={{ 
        scale: isValidDropTarget ? 0.95 : 1 
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: { 
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: (row * 3 + col) * 0.05
        }
      }}
    >
      {/* Show stack indicator if there are multiple pieces */}
      {pieces.length > 1 && (
        <div className="stack-indicator">
          {pieces.length}
        </div>
      )}
      
      {/* Only render the top piece */}
      {topPiece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img 
            src={getPieceImage(topPiece.player, topPiece.size)} 
            alt={`${topPiece.player} ${topPiece.size} piece`}
            className={`
              ${topPiece.size === 'small' ? 'w-16 h-16 md:w-20 md:h-20' : 
              topPiece.size === 'medium' ? 'w-22 h-22 md:w-28 md:h-28' : 
              'w-28 h-28 md:w-36 md:h-36'}
            `}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Cell;