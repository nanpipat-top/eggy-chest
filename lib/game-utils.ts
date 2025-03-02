import { Board, Cell, Piece, PieceSize, Player, InitialBoard, BoardPosition } from './types';

// Generate an empty 3x3 board
export function generateInitialBoard(): InitialBoard {
  const board: InitialBoard = [];
  
  for (let row = 0; row < 3; row++) {
    board[row] = [];
    for (let col = 0; col < 3; col++) {
      board[row][col] = {
        row,
        col,
        pieces: [],
      };
    }
  }
  
  return board;
}

// Check if a move is valid based on stacking rules
export function isValidMove(board: Board | InitialBoard, row: number, col: number, piece: Piece): boolean {
  // Check if the cell exists
  if (row < 0 || row >= 3 || col < 0 || col >= 3) {
    return false;
  }
  
  let cell: Cell;
  
  // Handle both board types
  if (Array.isArray(board)) {
    // It's an InitialBoard (2D array)
    cell = board[row][col];
  } else {
    // It's a Board (flat object)
    const position = `${row}-${col}` as BoardPosition;
    cell = board[position];
  }
  
  // If the cell is empty, any piece can be placed
  if (cell.pieces.length === 0) {
    return true;
  }
  
  // Get the top piece in the cell
  const topPiece = cell.pieces[cell.pieces.length - 1];
  
  // Stacking rule: Can only place a larger piece on top of a smaller one
  const sizeValues: Record<PieceSize, number> = {
    small: 1,
    medium: 2,
    large: 3,
  };
  
  return sizeValues[piece.size] > sizeValues[topPiece.size];
}

// Check for win conditions
export function checkWinCondition(board: Board | InitialBoard): Player | null {
  // For InitialBoard (2D array)
  if (Array.isArray(board)) {
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (checkLine(board[row][0], board[row][1], board[row][2])) {
        return getTopPiecePlayer(board[row][0]);
      }
    }
    
    // Check columns
    for (let col = 0; col < 3; col++) {
      if (checkLine(board[0][col], board[1][col], board[2][col])) {
        return getTopPiecePlayer(board[0][col]);
      }
    }
    
    // Check diagonals
    if (checkLine(board[0][0], board[1][1], board[2][2])) {
      return getTopPiecePlayer(board[0][0]);
    }
    
    if (checkLine(board[0][2], board[1][1], board[2][0])) {
      return getTopPiecePlayer(board[0][2]);
    }
  } 
  // For Board (flat object)
  else {
    // Check rows
    for (let row = 0; row < 3; row++) {
      const pos1 = `${row}-0` as BoardPosition;
      const pos2 = `${row}-1` as BoardPosition;
      const pos3 = `${row}-2` as BoardPosition;
      if (checkLine(board[pos1], board[pos2], board[pos3])) {
        return getTopPiecePlayer(board[pos1]);
      }
    }
    
    // Check columns
    for (let col = 0; col < 3; col++) {
      const pos1 = `0-${col}` as BoardPosition;
      const pos2 = `1-${col}` as BoardPosition;
      const pos3 = `2-${col}` as BoardPosition;
      if (checkLine(board[pos1], board[pos2], board[pos3])) {
        return getTopPiecePlayer(board[pos1]);
      }
    }
    
    // Check diagonals
    const diag1Pos1 = `0-0` as BoardPosition;
    const diag1Pos2 = `1-1` as BoardPosition;
    const diag1Pos3 = `2-2` as BoardPosition;
    if (checkLine(board[diag1Pos1], board[diag1Pos2], board[diag1Pos3])) {
      return getTopPiecePlayer(board[diag1Pos1]);
    }
    
    const diag2Pos1 = `0-2` as BoardPosition;
    const diag2Pos2 = `1-1` as BoardPosition;
    const diag2Pos3 = `2-0` as BoardPosition;
    if (checkLine(board[diag2Pos1], board[diag2Pos2], board[diag2Pos3])) {
      return getTopPiecePlayer(board[diag2Pos1]);
    }
  }
  
  return null;
}

// Helper function to check if three cells form a line with the same player's pieces on top
function checkLine(cell1: Cell, cell2: Cell, cell3: Cell): boolean {
  if (cell1.pieces.length === 0 || cell2.pieces.length === 0 || cell3.pieces.length === 0) {
    return false;
  }
  
  const player1 = getTopPiecePlayer(cell1);
  const player2 = getTopPiecePlayer(cell2);
  const player3 = getTopPiecePlayer(cell3);
  
  return player1 === player2 && player2 === player3;
}

// Helper function to get the player of the top piece in a cell
function getTopPiecePlayer(cell: Cell): Player | null {
  if (cell.pieces.length === 0) {
    return null;
  }
  
  return cell.pieces[cell.pieces.length - 1].player;
}

// Generate a unique ID for pieces
export function generatePieceId(player: Player, size: PieceSize, index: number): string {
  return `${player}-${size}-${index}`;
}

// Get available pieces for a player
export function getAvailablePieces(player: Player, availablePieces: Record<Player, Record<PieceSize, number>>): Piece[] {
  const pieces: Piece[] = [];
  
  const sizes: PieceSize[] = ['small', 'medium', 'large'];
  
  sizes.forEach((size) => {
    const count = availablePieces[player][size];
    for (let i = 0; i < count; i++) {
      pieces.push({
        id: generatePieceId(player, size, i),
        size,
        player,
      });
    }
  });
  
  return pieces;
}

// Get the size value of a piece (1 for small, 2 for medium, 3 for large)
export function getPieceSizeValue(size: PieceSize): number {
  const sizeValues: Record<PieceSize, number> = {
    small: 1,
    medium: 2,
    large: 3,
  };
  return sizeValues[size];
}

// Get piece image based on player and size
export function getPieceImage(player: Player, size: PieceSize): string {
  if (player === 'player1') {
    return `/images/chick-${size}.png`;
  } else {
    return `/images/devil-${size}.png`;
  }
}