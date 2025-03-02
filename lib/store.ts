import { create } from 'zustand';
import { GameState, Player, Piece, PieceSize, Board, Cell, Move } from './types';
import { generateInitialBoard, checkWinCondition, isValidMove, generatePieceId } from './game-utils';
import { playSound } from './sounds';

interface GameStore extends GameState {
  initializeGame: () => void;
  selectPiece: (piece: Piece) => void;
  placePiece: (row: number, col: number) => void;
  resetGame: () => void;
  placePieceDirectly: (piece: Piece, row: number, col: number) => void;
  setGameState: (state: GameState) => void;
  setCurrentPlayer: (player: Player) => void;
  setWinner: (player: Player | null) => void;
  setGameStatus: (status: GameState['gameStatus']) => void;
}

const initialState: GameState = {
  board: generateInitialBoard(),
  currentPlayer: Math.random() < 0.5 ? 'player1' : 'player2',
  selectedPiece: null,
  gameStatus: 'idle',
  winner: null,
  availablePieces: {
    player1: { small: 2, medium: 2, large: 2 },
    player2: { small: 2, medium: 2, large: 2 },
  },
  moveHistory: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  initializeGame: () => {
    set({
      ...initialState,
      gameStatus: 'playing',
      currentPlayer: Math.random() < 0.5 ? 'player1' : 'player2',
      board: generateInitialBoard(),
    });
  },

  selectPiece: (piece: Piece) => {
    set({ selectedPiece: piece });
  },

  placePiece: (row: number, col: number) => {
    const { board, selectedPiece, currentPlayer, availablePieces, moveHistory } = get();
    
    if (!selectedPiece || get().gameStatus !== 'playing') return;
    
    // Check if the move is valid
    if (!isValidMove(board, row, col, selectedPiece)) return;
    
    // Create a deep copy of the board
    const newBoard = JSON.parse(JSON.stringify(board)) as Board;
    
    // Add the piece to the cell
    newBoard[row][col].pieces.push(selectedPiece);
    
    // Update available pieces
    const newAvailablePieces = { ...availablePieces };
    newAvailablePieces[currentPlayer][selectedPiece.size as keyof typeof newAvailablePieces[Player]] -= 1;
    
    // Record the move
    const newMove: Move = {
      player: currentPlayer,
      pieceId: selectedPiece.id,
      pieceSize: selectedPiece.size,
      toCell: { row, col },
      timestamp: Date.now(),
    };
    
    // Check for win condition
    const winResult = checkWinCondition(newBoard);
    
    // Check for draw (all pieces used)
    const player1PiecesLeft = Object.values(newAvailablePieces.player1).reduce((a, b) => a + b, 0);
    const player2PiecesLeft = Object.values(newAvailablePieces.player2).reduce((a, b) => a + b, 0);
    const isDraw = !winResult && player1PiecesLeft === 0 && player2PiecesLeft === 0;
    
    set({
      board: newBoard,
      selectedPiece: null,
      currentPlayer: currentPlayer === 'player1' ? 'player2' : 'player1',
      availablePieces: newAvailablePieces,
      moveHistory: [...moveHistory, newMove],
      gameStatus: winResult ? 'win' : isDraw ? 'draw' : 'playing',
      winner: winResult || null,
    });
    
    // Play appropriate sound
    if (winResult) {
      playSound('win');
    } else if (isDraw) {
      playSound('draw');
    } else {
      playSound('place');
    }
  },
  
  placePieceDirectly: (piece: Piece, row: number, col: number) => {
    const { board, currentPlayer, availablePieces, moveHistory, gameStatus } = get();
    
    if (gameStatus !== 'playing') return;
    
    // Check if it's the correct player's turn
    if (piece.player !== currentPlayer) return;
    
    // Check if the move is valid
    if (!isValidMove(board, row, col, piece)) return;
    
    // Create a deep copy of the board
    const newBoard = JSON.parse(JSON.stringify(board)) as Board;
    
    // Add the piece to the cell
    newBoard[row][col].pieces.push(piece);
    
    // Update available pieces
    const newAvailablePieces = { ...availablePieces };
    newAvailablePieces[currentPlayer][piece.size as keyof typeof newAvailablePieces[Player]] -= 1;
    
    // Record the move
    const newMove: Move = {
      player: currentPlayer,
      pieceId: piece.id,
      pieceSize: piece.size,
      toCell: { row, col },
      timestamp: Date.now(),
    };
    
    // Check for win condition
    const winResult = checkWinCondition(newBoard);
    
    // Check for draw (all pieces used)
    const player1PiecesLeft = Object.values(newAvailablePieces.player1).reduce((a, b) => a + b, 0);
    const player2PiecesLeft = Object.values(newAvailablePieces.player2).reduce((a, b) => a + b, 0);
    const isDraw = !winResult && player1PiecesLeft === 0 && player2PiecesLeft === 0;
    
    set({
      board: newBoard,
      selectedPiece: null,
      currentPlayer: currentPlayer === 'player1' ? 'player2' : 'player1',
      availablePieces: newAvailablePieces,
      moveHistory: [...moveHistory, newMove],
      gameStatus: winResult ? 'win' : isDraw ? 'draw' : 'playing',
      winner: winResult || null,
    });
    
    // Play appropriate sound
    if (winResult) {
      playSound('win');
    } else if (isDraw) {
      playSound('draw');
    } else {
      playSound('place');
    }
  },

  resetGame: () => {
    set({
      ...initialState,
      board: generateInitialBoard(),
      currentPlayer: Math.random() < 0.5 ? 'player1' : 'player2',
    });
  },
  
  setGameState: (state: GameState) => {
    set(state);
  },
  
  setCurrentPlayer: (player: Player) => {
    set({ currentPlayer: player });
  },
  
  setWinner: (player: Player | null) => {
    set({ winner: player });
  },
  
  setGameStatus: (status: GameState['gameStatus']) => {
    set({ gameStatus: status });
  }
}));