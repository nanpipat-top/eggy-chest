"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { playSound } from '@/lib/sounds';
import { PieceSize, Player } from '@/lib/types';
import { getPieceImage } from '@/lib/game-utils';

interface PieceSelectorProps {
  player: Player;
  isActive: boolean;
  pieceCounts: Record<PieceSize, number>;
}

// Define specific sizes for each piece type
const sizeDimensions: Record<PieceSize, string> = {
  small: 'w-8 h-8 md:w-10 md:h-10',
  medium: 'w-12 h-12 md:w-14 md:h-14',
  large: 'w-16 h-16 md:w-18 md:h-18',
};

const PieceSelector: React.FC<PieceSelectorProps> = ({ player, isActive, pieceCounts }) => {
  const { selectPiece, selectedPiece } = useGameStore();
  
  // Create one piece of each size with count
  const pieceTypes: PieceSize[] = ['small', 'medium', 'large'];
  
  const handleSelectPiece = (size: PieceSize) => {
    // Only allow selection if there are pieces of this size available and it's this player's turn
    if (pieceCounts[size] > 0 && isActive) {
      // Create a temporary piece object for selection
      const tempPiece = {
        id: `${player}-${size}-temp`,
        size,
        player,
      };
      
      selectPiece(tempPiece);
      playSound('select');
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {pieceTypes.map((size) => {
          const count = pieceCounts[size];
          const isAvailable = count > 0 && isActive;
          const isSelected = selectedPiece?.size === size && selectedPiece?.player === player;
          
          return (
            <motion.div
              key={size}
              className={`relative ${!isAvailable ? 'opacity-40' : ''}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: isAvailable ? 1 : 0.4,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }
              }}
            >
              <motion.div 
                className={`
                  piece-button relative
                  ${isSelected ? 'ring-4 ring-white' : ''}
                  ${isAvailable ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
                `}
                onClick={isAvailable ? () => handleSelectPiece(size) : undefined}
                whileHover={isAvailable ? { scale: 1.1 } : {}}
                whileTap={isAvailable ? { scale: 0.95 } : {}}
              >
                <img 
                  src={getPieceImage(player, size)} 
                  alt={`${size} egg`}
                  className={`piece-img-${size}`}
                  style={{ width: 'auto', height: 'auto', maxWidth: 'none' }}
                  draggable="false"
                />
                
                {count > 0 && (
                  <span className="piece-count absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {isActive && selectedPiece?.player === player && (
        <motion.div
          className="text-center text-white font-bold text-sm w-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          Selected: {selectedPiece.size.charAt(0).toUpperCase() + selectedPiece.size.slice(1)}
        </motion.div>
      )}
    </div>
  );
};

export default PieceSelector;