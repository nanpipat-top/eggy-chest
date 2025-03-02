"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Player, PieceSize } from '@/lib/types';
import DraggablePiece from './DraggablePiece';
import { generatePieceId } from '@/lib/game-utils';

interface PlayerAreaProps {
  player: Player;
  availablePieces: Record<PieceSize, number>;
  isCurrentPlayer: boolean;
}

const PlayerArea: React.FC<PlayerAreaProps> = ({ player, availablePieces, isCurrentPlayer }) => {
  // Create one piece of each size with count
  const pieceTypes: PieceSize[] = ['small', 'medium', 'large'];
  
  return (
    <motion.div 
      className={`
        player-area relative
        ${player === 'player1' ? 'player1' : 'player2'}
        ${isCurrentPlayer ? 'pulse-animation' : ''}
      `}
      initial={{ opacity: 0, y: player === 'player1' ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.3
      }}
    >
      <div className={`player-label ${player === 'player1' ? 'player1-label' : 'player2-label'}`}>
        {player === 'player1' ? 'Player 1' : 'Player 2'}
      </div>
      
      <div className="flex flex-row justify-center gap-6 p-4">
        {pieceTypes.map((size) => {
          const count = availablePieces[size];
          const piece = {
            id: generatePieceId(player, size, 0),
            size,
            player,
          };
          
          return (
            <div key={size} className="relative flex flex-col items-center">
              <DraggablePiece 
                piece={piece} 
                count={count} 
                disabled={!isCurrentPlayer}
              />
              <div className="mt-2 text-sm font-bold text-center text-white">
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </div>
            </div>
          );
        })}
      </div>
      
      {isCurrentPlayer && (
        <div className="text-center mt-2 text-white font-bold">
          Drag an egg to place it on the board
        </div>
      )}
    </motion.div>
  );
};

export default PlayerArea;