"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Piece as PieceType, PieceSize } from '@/lib/types';

interface PieceProps {
  piece: PieceType;
  index?: number;
  isTopPiece?: boolean;
  totalPieces?: number;
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  count?: number;
}

const sizeClasses: Record<PieceSize, { container: string, image: string }> = {
  small: {
    container: 'w-8 h-8 md:w-10 md:h-10',
    image: 'w-8 h-8 md:w-10 md:h-10'
  },
  medium: {
    container: 'w-12 h-12 md:w-14 md:h-14',
    image: 'w-12 h-12 md:w-14 md:h-14'
  },
  large: {
    container: 'w-16 h-16 md:w-18 md:h-18',
    image: 'w-16 h-16 md:w-18 md:h-18'
  }
};

const Piece: React.FC<PieceProps> = ({
  piece,
  index = 0,
  isTopPiece = false,
  totalPieces = 1,
  isSelectable = false,
  isSelected = false,
  onClick,
  count,
}) => {
  const { size, player } = piece;
  
  // Calculate z-index based on piece size and position in stack
  // Larger pieces should appear on top of smaller ones
  const sizeValue = size === 'large' ? 3 : size === 'medium' ? 2 : 1;
  const zIndex = 10 + (isTopPiece ? 10 : 0) + sizeValue;
  
  // Only show a slight offset for pieces in a stack to create a subtle 3D effect
  const yOffset = totalPieces > 1 ? -3 : 0;
  
  return (
    <motion.div
      className={cn(
        'game-piece absolute cursor-pointer transition-all',
        sizeClasses[size].container,
        player === 'player1' ? 'player1-piece' : 'player2-piece',
        isSelectable && 'hover:ring-2 hover:ring-offset-2 hover:ring-primary',
        isSelected && 'ring-4 ring-offset-2 ring-primary',
        !isSelectable && !isSelected && 'cursor-default'
      )}
      style={{
        zIndex,
        transform: `translateY(${yOffset}px)`,
      }}
      onClick={isSelectable ? onClick : undefined}
      initial={{ scale: 0.5, opacity: 0, y: -20 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: yOffset,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.1 * index
        }
      }}
      exit={{ scale: 0.5, opacity: 0, y: -20 }}
      whileHover={isSelectable ? { 
        scale: 1.1,
        y: yOffset - 5,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={isSelectable ? { 
        scale: 0.95,
        y: yOffset
      } : {}}
    >
      <img 
        src={`/images/pieces/${player}-${size}.png`}
        alt={`${player} ${size} piece`}
        className={`piece-img-${size}`}
        style={{ width: 'auto', height: 'auto' }}
        draggable={false}
      />
      
      {count !== undefined && count > 0 && (
        <span className="piece-count">{count}</span>
      )}
    </motion.div>
  );
};

export default Piece;