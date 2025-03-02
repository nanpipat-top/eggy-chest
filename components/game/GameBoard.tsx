"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useGameStore } from '@/lib/store';
import { isValidMove } from '@/lib/game-utils';
import DroppableCell from './DroppableCell';
import { playSound } from '@/lib/sounds';

const GameBoard: React.FC = () => {
  const { board, placePieceDirectly, gameStatus, currentPlayer } = useGameStore();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [validDropCells, setValidDropCells] = React.useState<{row: number, col: number}[]>([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced to make dragging easier to start
      },
    })
  );
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Find valid drop targets for this piece
    const piece = (active.data.current as any)?.piece;
    if (piece) {
      const validCells = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (isValidMove(board, row, col, piece)) {
            validCells.push({row, col});
          }
        }
      }
      setValidDropCells(validCells);
      playSound('select');
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.data.current) {
      const piece = (active.data.current as any)?.piece;
      const { row, col } = (over.data.current as any);
      
      if (piece && row !== undefined && col !== undefined) {
        placePieceDirectly(piece, row, col);
      }
    }
    
    setActiveId(null);
    setValidDropCells([]);
  };
  
  const handleDragCancel = () => {
    setActiveId(null);
    setValidDropCells([]);
    playSound('invalid');
  };
  
  return (
    <div className="game-container w-full max-w-xl mx-auto">
      <div className={`
        turn-indicator
        ${currentPlayer === 'player1' ? 'player1-turn' : 'player2-turn'}
      `}>
        {currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s Turn
      </div>
      
      <motion.div 
        className="board-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.8 
        }}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="game-board">
            <div className="grid grid-cols-3 gap-4 w-full aspect-square">
              {board.map((row, rowIndex) => (
                row.map((cell, colIndex) => {
                  const isValidTarget = validDropCells.some(
                    vc => vc.row === rowIndex && vc.col === colIndex
                  );
                  
                  return (
                    <DroppableCell 
                      key={`${rowIndex}-${colIndex}`} 
                      cell={cell}
                      isValidDropTarget={isValidTarget}
                    />
                  );
                })
              ))}
            </div>
          </div>
        </DndContext>
      </motion.div>
    </div>
  );
};

export default GameBoard;