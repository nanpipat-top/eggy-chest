"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Player } from '@/lib/types';
import { playSound } from '@/lib/sounds';

interface CoinFlipProps {
  onComplete: (firstPlayer: Player) => void;
}

const CoinFlip: React.FC<CoinFlipProps> = ({ onComplete }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<Player | null>(null);
  
  const handleFlip = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    playSound('flip');
    
    // Random flip duration between 2-3 seconds
    const flipDuration = 2000 + Math.random() * 1000;
    
    // Determine the winner randomly
    setTimeout(() => {
      const winner = Math.random() < 0.5 ? 'player1' : 'player2';
      setResult(winner);
      
      // Wait a bit before completing
      setTimeout(() => {
        onComplete(winner);
      }, 1500);
    }, flipDuration);
  };
  
  return (
    <motion.div
      className="bg-white/90 p-8 rounded-3xl w-full max-w-md shadow-2xl border-4 border-white"
      style={{
        background: 'url(/images/wooden-board.jpg)',
        backgroundSize: 'cover',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/90 p-6 rounded-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center" style={{
          color: '#FFA500',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          Who Goes First?
        </h2>
        
        <div className="relative w-40 h-40 mb-8 mx-auto">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={isFlipping ? {
              rotateY: ['0deg', '1800deg'],
              z: [0, 100, 0]
            } : {}}
            transition={isFlipping ? {
              duration: 2,
              ease: "easeInOut"
            } : {}}
          >
            {result ? (
              <img 
                src={result === 'player1' ? '/images/chick-large.png' : '/images/devil-large.png'} 
                alt={result === 'player1' ? 'Player 1' : 'Player 2'}
                className="w-32 h-32"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-300 to-rose-300 flex items-center justify-center shadow-lg border-4 border-white">
                <img src="/images/chick-small.png" alt="Player 1" className="w-12 h-12 absolute left-4 top-4" />
                <img src="/images/devil-small.png" alt="Player 2" className="w-12 h-12 absolute right-4 bottom-4" />
              </div>
            )}
          </motion.div>
        </div>
        
        {!isFlipping && !result && (
          <motion.button
            className="game-button mx-auto block"
            onClick={handleFlip}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95, y: 0 }}
          >
            Flip Coin
          </motion.button>
        )}
        
        {result && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xl font-bold mb-2">
              {result === 'player1' ? 'Player 1' : 'Player 2'} goes first!
            </p>
            <p className="text-sm text-gray-600">
              Starting game...
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CoinFlip;