"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface InstructionsProps {
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="game-card p-8 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="game-title text-3xl font-bold">How to Play</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Game Objective</h3>
            <p>
              Get three of your eggs in a row (horizontally, vertically, or diagonally) to win!
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Egg Sizes</h3>
            <p className="mb-2">
              There are three egg sizes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Small - Can be placed on an empty cell</li>
              <li>Medium - Can be placed on an empty cell or on top of a small egg</li>
              <li>Large - Can be placed on an empty cell, small egg, or medium egg</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Stacking Rules</h3>
            <p className="mb-2">
              You can stack eggs based on their size:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Larger eggs can be placed on top of smaller eggs</li>
              <li>When stacked, only the top egg counts for winning</li>
              <li>You can stack on your opponent's eggs to capture their position</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Winning</h3>
            <p>
              The game ends when a player gets three of their eggs in a row or when all eggs have been placed.
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <motion.button
            className="game-button bg-gradient-to-r from-primary/90 to-primary text-white shadow-lg w-full"
            onClick={onClose}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95, y: 0 }}
          >
            Got it!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Instructions;