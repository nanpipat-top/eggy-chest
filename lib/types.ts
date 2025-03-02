// Game Types
export type PieceSize = 'small' | 'medium' | 'large';
export type Player = 'player1' | 'player2';

export interface Piece {
  id: string;
  size: PieceSize;
  player: Player;
}

export interface Cell {
  row: number;
  col: number;
  pieces: Piece[];
}

export type BoardPosition = `${number}-${number}`;
export type Board = Record<BoardPosition, Cell>;
export type InitialBoard = Cell[][];

export type GameStatus = 'idle' | 'playing' | 'win' | 'draw';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  selectedPiece: Piece | null;
  gameStatus: GameStatus;
  winner: Player | null;
  availablePieces: {
    player1: { small: number; medium: number; large: number };
    player2: { small: number; medium: number; large: number };
  };
  moveHistory: Move[];
}

export interface Move {
  player: Player;
  pieceId: string;
  pieceSize: PieceSize;
  toCell: { row: number; col: number };
  timestamp: number;
}

export interface DragItem {
  id: string;
  type: 'piece';
  size: PieceSize;
  player: Player;
}

// Online Game Types
export interface GameRoom {
  id: string;
  name: string;
  createdAt: number;
  status: 'waiting' | 'coin_flip' | 'playing' | 'finished';
  player1: PlayerInfo | null;
  player2: PlayerInfo | null;
  currentTurn: Player;
  winner: Player | null;
  gameState: GameState;
  lastUpdated: number;
  spectators: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  avatar?: string;
  isReady: boolean;
  isOnline: boolean;
  lastActive: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: number;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
  };
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}