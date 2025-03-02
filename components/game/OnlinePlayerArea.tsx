"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, PieceSize, Piece } from '@/lib/types';
import { getPieceImage, generatePieceId } from '@/lib/game-utils';
import { playSound } from '@/lib/sounds';

interface OnlinePlayerAreaProps {
  player: Player;
  availablePieces: Record<PieceSize, number>;
  isCurrentPlayer: boolean;
  onSelectPiece: (piece: Piece) => void;
}

// Define specific sizes for each piece type
const sizeDimensions: Record<PieceSize, string> = {
  small: 'w-8 h-8 md:w-10 md:h-10',
  medium: 'w-12 h-12 md:w-14 md:h-14',
  large: 'w-16 h-16 md:w-18 md:h-18',
};

const OnlinePlayerArea: React.FC<OnlinePlayerAreaProps> = ({ 
  player, 
  availablePieces, 
  isCurrentPlayer,
  onSelectPiece
}) => {
  const [selectedSize, setSelectedSize] = useState<PieceSize | null>(null);
  
  // Create one piece of each size with count
  const pieceTypes: PieceSize[] = ['small', 'medium', 'large'];
  
  const handleSelectPiece = (size: PieceSize) => {
    // Only allow selection if there are pieces of this size available and it's this player's turn
    if (availablePieces[size] > 0 && isCurrentPlayer) {
      // Create a temporary piece object for selection
      const tempPiece = {
        id: generatePieceId(player, size, 0),
        size,
        player,
      };
      
      setSelectedSize(size);
      onSelectPiece(tempPiece);
      playSound('select');
    }
  };
  
  return (
    <motion.div 
      className={`
        player-area w-full max-w-[150px] p-4 rounded-lg
        ${player === 'player1' ? 'bg-yellow-100/20' : 'bg-green-100/20'}
        ${isCurrentPlayer ? 'ring-2 ring-white/50 shadow-lg' : ''}
      `}
      initial={{ opacity: 0, x: player === 'player1' ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.3
      }}
    >
      <div className="text-center font-bold mb-4 text-white">
        {player === 'player1' ? 'Player 1' : 'Player 2'}
        {isCurrentPlayer && <span className="ml-2 text-xs animate-pulse">• Your Turn</span>}
      </div>
      
      <div className="flex flex-col items-center gap-4 py-2">
        <AnimatePresence>
          {pieceTypes.map((size) => {
            const count = availablePieces[size];
            const isAvailable = count > 0 && isCurrentPlayer;
            const isSelected = selectedSize === size;
            
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
                    piece-container flex flex-col items-center mb-2
                    ${isSelected ? 'selected' : ''}
                    ${isAvailable ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                  `}
                  onClick={isAvailable ? () => handleSelectPiece(size) : undefined}
                  whileHover={isAvailable ? { scale: 1.1 } : {}}
                  whileTap={isAvailable ? { scale: 0.95 } : {}}
                >
                  <div className={`
                    relative
                    ${isSelected ? 'ring-2 ring-white shadow-lg' : ''}
                  `}>
                    <img 
                      src={getPieceImage(player, size)} 
                      alt={`${size} egg`}
                      className={sizeDimensions[size]}
                      draggable="false"
                    />
                    
                    {count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white mt-1 font-medium">
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isCurrentPlayer && selectedSize && (
          <motion.div
            className="text-center text-white font-bold text-sm w-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            Selected: {selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)}
          </motion.div>
        )}
      </div>
      
      {isCurrentPlayer && (
        <div className="text-center mt-2 text-white text-sm font-bold">
          {selectedSize ? 'Click on board to place' : 'Select an egg'}
        </div>
      )}
    </motion.div>
  );
};

export default OnlinePlayerArea;
