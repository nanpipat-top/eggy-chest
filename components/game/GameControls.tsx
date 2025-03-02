"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { RotateCcw, Volume2, VolumeX, Home } from 'lucide-react';
import { soundManager } from '@/lib/sounds';
import { useRouter } from 'next/navigation';

const GameControls: React.FC = () => {
  const { resetGame, gameStatus } = useGameStore();
  const [isMuted, setIsMuted] = React.useState(false);
  const router = useRouter();
  
  const handleResetGame = () => {
    resetGame();
  };
  
  const handleToggleMute = () => {
    if (soundManager) {
      const newMuteState = soundManager.toggleMute();
      setIsMuted(newMuteState);
    }
  };
  
  const handleMainMenu = () => {
    router.push('/');
  };
  
  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-3 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.4
      }}
    >
      <motion.button
        onClick={handleResetGame}
        className="game-button flex items-center gap-2"
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.95, y: 0 }}
      >
        <RotateCcw className="w-5 h-5" />
        Reset Game
      </motion.button>
      
      <motion.button
        onClick={handleToggleMute}
        className="game-button flex items-center gap-2"
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.95, y: 0 }}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
        {isMuted ? 'Unmute' : 'Mute'}
      </motion.button>
      
      <motion.button
        onClick={handleMainMenu}
        className="game-button flex items-center gap-2"
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.95, y: 0 }}
      >
        <Home className="w-5 h-5" />
        Main Menu
      </motion.button>
    </motion.div>
  );
};

export default GameControls;