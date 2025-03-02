import { Board, Cell, Piece, PieceSize, Player, InitialBoard, BoardPosition } from './types';

// Generate an empty 3x3 board
export function generateInitialBoard(): Board {
  const board: Board = {} as Board;
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const position = `${row}-${col}` as BoardPosition;
      board[position] = {
        row,
        col,
        pieces: [],
      };
    }
  }
  
  return board;
}

// Check if a move is valid based on stacking rules
export function isValidMove(board: Board, row: number, col: number, piece: Piece): boolean {
  // Check if the cell exists
  if (row < 0 || row >= 3 || col < 0 || col >= 3) {
    return false;
  }
  
  // Get the cell from the board
  const position = `${row}-${col}` as BoardPosition;
  const cell = board[position];
  
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
    large: 3
  };
  
  return sizeValues[piece.size] > sizeValues[topPiece.size];
}

// Check for a win condition (3 in a row)
export function checkWinCondition(board: Board): Player | null {
  // Helper function to check if a line of 3 cells has the same top piece player
  function checkLine(cell1: Cell, cell2: Cell, cell3: Cell): boolean {
    // All cells must have at least one piece
    if (cell1.pieces.length === 0 || cell2.pieces.length === 0 || cell3.pieces.length === 0) {
      return false;
    }
    
    // Get the top piece from each cell
    const topPiece1 = cell1.pieces[cell1.pieces.length - 1];
    const topPiece2 = cell2.pieces[cell2.pieces.length - 1];
    const topPiece3 = cell3.pieces[cell3.pieces.length - 1];
    
    // Check if all top pieces belong to the same player
    return topPiece1.player === topPiece2.player && topPiece2.player === topPiece3.player;
  }
  
  // Helper function to get the player of the top piece in a cell
  function getTopPiecePlayer(cell: Cell): Player {
    return cell.pieces[cell.pieces.length - 1].player;
  }

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
  
  // No win condition found
  return null;
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