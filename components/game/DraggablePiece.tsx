"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Piece as PieceType, PieceSize } from '@/lib/types';
import { getPieceImage } from '@/lib/game-utils';

interface DraggablePieceProps {
  piece: PieceType;
  count: number;
  disabled?: boolean;
}

const sizeDimensions: Record<PieceSize, { container: string, image: string }> = {
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

const DraggablePiece: React.FC<DraggablePieceProps> = ({ piece, count, disabled = false }) => {
  const { id, size, player } = piece;
  
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: id,
    data: {
      type: 'piece',
      piece: piece
    },
    disabled: disabled || count <= 0
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    cursor: (disabled || count <= 0) ? 'not-allowed' : 'grab',
    touchAction: 'none', // Prevent scrolling while dragging on touch devices
  };
  
  const imageUrl = getPieceImage(player, size);
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        game-piece relative
        ${sizeDimensions[size].container}
        ${isDragging ? 'dragging' : ''}
        ${(disabled || count <= 0) ? 'opacity-40' : ''}
      `}
      {...listeners}
      {...attributes}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: (disabled || count <= 0) ? 0.4 : 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
      whileHover={(!disabled && count > 0) ? { 
        scale: 1.1,
        y: -5,
        transition: { duration: 0.2 }
      } : {}}
    >
      <img 
        src={imageUrl} 
        alt={`${player} ${size} piece`} 
        draggable="false" 
        className={`piece-img-${size}`}
        style={{ width: 'auto', height: 'auto' }}
      />
      
      {count > 0 && (
        <div className="piece-count">{count}</div>
      )}
    </motion.div>
  );
};

export default DraggablePiece;