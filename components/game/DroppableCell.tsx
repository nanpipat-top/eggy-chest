"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Cell as CellType, Piece as PieceType } from '@/lib/types';
import { getPieceImage } from '@/lib/game-utils';

interface DroppableCellProps {
  cell: CellType;
  isValidDropTarget: boolean;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ cell, isValidDropTarget }) => {
  const { row, col, pieces } = cell;
  
  const {isOver, setNodeRef} = useDroppable({
    id: `cell-${row}-${col}`,
    data: {
      type: 'cell',
      row,
      col
    }
  });
  
  // Determine cell color for checkerboard pattern
  const isEvenCell = (row + col) % 2 === 0;
  
  // Get the top piece to display (if any)
  const topPiece = pieces.length > 0 ? pieces[pieces.length - 1] : null;
  
  return (
    <motion.div
      ref={setNodeRef}
      className={`
        game-cell w-full h-full flex items-center justify-center relative
        ${isOver && isValidDropTarget ? 'drop-indicator' : ''}
        ${isValidDropTarget && !isOver ? 'cell-highlight' : ''}
      `}
      style={{
        minHeight: "100px", // Ensure minimum height for better touch targets
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
            className={`piece-img-${topPiece.size}`}
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default DroppableCell;