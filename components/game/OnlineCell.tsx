"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Cell as CellType, Piece } from '@/lib/types';
import { getPieceImage } from '@/lib/game-utils';
import { playSound } from '@/lib/sounds';

interface OnlineCellProps {
  cell: CellType;
  row: number;
  col: number;
  isValidCell?: boolean;
  onClick: (row: number, col: number) => void;
}

const OnlineCell: React.FC<OnlineCellProps> = ({ 
  cell, 
  row, 
  col, 
  isValidCell = false,
  onClick 
}) => {
  const pieces = cell?.pieces || [];
  const topPiece = pieces.length > 0 ? pieces[pieces.length - 1] : null;
  
  const handleClick = () => {
    if (isValidCell) {
      onClick(row, col);
      playSound('place');
    } else if (pieces.length > 0) {
      // If clicking on a cell with pieces but not valid for placement
      playSound('invalid');
    }
  };
  
  return (
    <motion.div
      className={cn(
        'game-cell w-full h-full flex items-center justify-center relative bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20',
        isValidCell && 'cell-highlight cursor-pointer border-2 border-green-400 shadow-green-300/50',
        !isValidCell && pieces.length === 0 && 'empty-cell hover:bg-white/20',
        !isValidCell && pieces.length > 0 && 'occupied-cell'
      )}
      onClick={handleClick}
      whileHover={{ 
        scale: isValidCell ? 1.05 : 1,
        y: isValidCell ? -5 : 0
      }}
      whileTap={{ 
        scale: isValidCell ? 0.95 : 1 
      }}
    >
      {/* Cell coordinate label (for debugging) */}
      <div className="absolute top-1 left-1 text-xs text-white/30">
        {row},{col}
      </div>
      
      {/* Stack of pieces */}
      {pieces.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="piece-stack relative w-full h-full flex items-center justify-center">
            {pieces.map((piece, index) => {
              const isTop = index === pieces.length - 1;
              const offset = index * 2; // Offset for stacking effect
              
              return (
                <div 
                  key={piece.id}
                  className={`absolute ${getPieceSize(piece.size)}`}
                  style={{ 
                    zIndex: index,
                    transform: `translateY(-${offset}px)` 
                  }}
                >
                  <img 
                    src={getPieceImage(piece.player, piece.size)} 
                    alt={`${piece.player} ${piece.size} piece`}
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Helper function to get CSS class for piece size
const getPieceSize = (size: string): string => {
  switch (size) {
    case 'small': return 'w-8 h-8 md:w-10 md:h-10';
    case 'medium': return 'w-12 h-12 md:w-14 md:h-14';
    case 'large': return 'w-16 h-16 md:w-18 md:h-18';
    default: return 'w-12 h-12';
  }
};

export default OnlineCell;
