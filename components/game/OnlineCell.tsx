"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Piece } from '@/lib/types';
import { getPieceImage } from '@/lib/game-utils';
import { playSound } from '@/lib/sounds';

interface OnlineCellProps {
  row: number;
  col: number;
  pieces: Piece[];
  isValidMove?: boolean;
  onClick: () => void;
}

const OnlineCell: React.FC<OnlineCellProps> = ({ 
  row, 
  col, 
  pieces, 
  isValidMove = false,
  onClick 
}) => {
  const topPiece = pieces.length > 0 ? pieces[pieces.length - 1] : null;
  
  const handleClick = () => {
    if (isValidMove) {
      onClick();
      playSound('place');
    } else if (pieces.length > 0) {
      // If clicking on a cell with pieces but not valid for placement
      playSound('invalid');
    }
  };
  
  return (
    <motion.div
      className={cn(
        'game-cell w-full h-full flex items-center justify-center relative',
        isValidMove && 'cell-highlight cursor-pointer',
        !isValidMove && pieces.length === 0 && 'empty-cell',
        !isValidMove && pieces.length > 0 && 'occupied-cell'
      )}
      onClick={handleClick}
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
      whileHover={{ 
        scale: isValidMove ? 1.05 : 1,
        y: isValidMove ? -5 : 0
      }}
      whileTap={{ 
        scale: isValidMove ? 0.95 : 1 
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

export default OnlineCell;
