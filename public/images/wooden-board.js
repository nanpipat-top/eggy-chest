"use client";

import React from 'react';

const WoodenBoardBackground = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at center, rgba(139, 69, 19, 0.9) 0%, rgba(101, 67, 33, 0.95) 80%, rgba(80, 50, 20, 1) 100%),
          linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)
        `,
        backgroundSize: '100% 100%, 20px 20px',
        zIndex: -1,
        opacity: 0.9,
      }}
    >
      {/* Wood grain overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(0deg, 
              rgba(0, 0, 0, 0.05) 0px, 
              rgba(0, 0, 0, 0) 2px, 
              rgba(0, 0, 0, 0.05) 4px
            )
          `,
          opacity: 0.5,
        }}
      />
      
      {/* Vignette effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.7)',
        }}
      />
    </div>
  );
};

export default WoodenBoardBackground;
