import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { 
  GameRoom, 
  GameState, 
  Player, 
  PlayerInfo, 
  Move, 
  Piece, 
  Board, 
  BoardPosition,
  InitialBoard 
} from './types';
import { generateInitialBoard } from './game-utils';

// Create a new game room
export const createGameRoom = async (roomName: string, creatorName: string, creatorId: string): Promise<string> => {
  try {
    const roomId = nanoid(6).toUpperCase();
    
    const player1: PlayerInfo = {
      id: creatorId,
      name: creatorName,
      isReady: false,
      isOnline: true,
      lastActive: Date.now()
    };
    
    // Create a serializable board without nested arrays
    const serializableBoard: Board = generateInitialBoard();
    
    const initialGameState: GameState = {
      board: serializableBoard,
      currentPlayer: 'player1',
      selectedPiece: null,
      gameStatus: 'idle',
      winner: null,
      availablePieces: {
        player1: { small: 2, medium: 2, large: 2 },
        player2: { small: 2, medium: 2, large: 2 },
      },
      moveHistory: [],
    };
    
    const newRoom: GameRoom = {
      id: roomId,
      name: roomName,
      createdAt: Date.now(),
      status: 'waiting',
      player1,
      player2: null,
      currentTurn: 'player1',
      winner: null,
      gameState: initialGameState,
      lastUpdated: Date.now(),
      spectators: 0
    };
    
    // Create the document with a specific ID
    // Convert to plain object to ensure it's serializable
    const serializableRoom = JSON.parse(JSON.stringify(newRoom));
    await setDoc(doc(db, 'gameRooms', roomId), serializableRoom);
    return roomId;
  } catch (error) {
    console.error('Error creating game room:', error);
    throw error;
  }
};

// Join an existing game room
export const joinGameRoom = async (roomId: string, playerName: string, playerId: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }
    
    const roomData = roomSnap.data() as GameRoom;
    
    // Check if room is full
    if (roomData.player1 && roomData.player2) {
      // Join as spectator
      await updateDoc(roomRef, {
        spectators: increment(1)
      });
      return false;
    }
    
    // Check if player is already in the room
    if (roomData.player1?.id === playerId) {
      // Update player1 status
      await updateDoc(roomRef, {
        'player1.isOnline': true,
        'player1.lastActive': Date.now()
      });
      return true;
    }
    
    // Join as player2 if slot is available
    if (!roomData.player2) {
      const player2: PlayerInfo = {
        id: playerId,
        name: playerName,
        isReady: false,
        isOnline: true,
        lastActive: Date.now()
      };
      
      // Convert to plain object to ensure it's serializable
      const serializablePlayer = JSON.parse(JSON.stringify(player2));
      
      await updateDoc(roomRef, {
        player2: serializablePlayer,
        lastUpdated: Date.now()
      });
      return true;
    }
    
    // Update player2 status if it's the same player
    if (roomData.player2.id === playerId) {
      await updateDoc(roomRef, {
        'player2.isOnline': true,
        'player2.lastActive': Date.now()
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error joining game room:', error);
    throw error;
  }
};

// Leave a game room
export const leaveGameRoom = async (roomId: string, playerId: string): Promise<void> => {
  try {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      return;
    }
    
    const roomData = roomSnap.data() as GameRoom;
    
    // Check if player is player1
    if (roomData.player1?.id === playerId) {
      // If game hasn't started, remove player1
      if (roomData.status === 'waiting') {
        // If player2 exists, make them player1
        if (roomData.player2) {
          // Convert to plain object to ensure it's serializable
          const serializablePlayer = JSON.parse(JSON.stringify(roomData.player2));
          
          await updateDoc(roomRef, {
            player1: serializablePlayer,
            player2: null,
            lastUpdated: Date.now()
          });
        } else {
          // If no player2, delete the room
          await deleteDoc(roomRef);
        }
      } else {
        // If game has started, mark player as offline
        await updateDoc(roomRef, {
          'player1.isOnline': false,
          'player1.lastActive': Date.now(),
          lastUpdated: Date.now()
        });
      }
    }
    
    // Check if player is player2
    else if (roomData.player2?.id === playerId) {
      // If game hasn't started, remove player2
      if (roomData.status === 'waiting') {
        await updateDoc(roomRef, {
          player2: null,
          lastUpdated: Date.now()
        });
      } else {
        // If game has started, mark player as offline
        await updateDoc(roomRef, {
          'player2.isOnline': false,
          'player2.lastActive': Date.now(),
          lastUpdated: Date.now()
        });
      }
    }
    
    // If player is a spectator, decrement spectator count
    else {
      await updateDoc(roomRef, {
        spectators: increment(-1)
      });
    }
  } catch (error) {
    console.error('Error leaving game room:', error);
    throw error;
  }
};

// Set player ready status
export const setPlayerReady = async (roomId: string, playerId: string, isReady: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }
    
    const roomData = roomSnap.data() as GameRoom;
    
    // Update player1 ready status
    if (roomData.player1?.id === playerId) {
      await updateDoc(roomRef, {
        'player1.isReady': isReady,
        'player1.lastActive': Date.now(),
        lastUpdated: Date.now()
      });
    }
    
    // Update player2 ready status
    else if (roomData.player2?.id === playerId) {
      await updateDoc(roomRef, {
        'player2.isReady': isReady,
        'player2.lastActive': Date.now(),
        lastUpdated: Date.now()
      });
    }
    
    // Note: We no longer automatically start the game when both players are ready
    // This will be handled by the startGame function instead
  } catch (error) {
    console.error('Error setting player ready status:', error);
    throw error;
  }
};

// Start the game after both players are ready
export const startGame = async (roomId: string, playerId: string): Promise<void> => {
  try {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }
    
    const roomData = roomSnap.data() as GameRoom;
    
    // Check if both players are ready
    if (!roomData.player1?.isReady || !roomData.player2?.isReady) {
      throw new Error('Both players must be ready to start the game');
    }
    
    // Check if the player is one of the players in the room
    if (roomData.player1?.id !== playerId && roomData.player2?.id !== playerId) {
      throw new Error('Only players in the room can start the game');
    }
    
    // Use the board directly since generateInitialBoard now returns a Board object
    const serializableBoard: Board = generateInitialBoard();
    
    // Randomly determine first player
    const firstPlayer: Player = Math.random() < 0.5 ? 'player1' : 'player2';
    
    // Start the game
    const initialGameState: GameState = {
      board: serializableBoard,
      currentPlayer: firstPlayer,
      selectedPiece: null,
      gameStatus: 'playing',
      winner: null,
      availablePieces: {
        player1: { small: 2, medium: 2, large: 2 },
        player2: { small: 2, medium: 2, large: 2 },
      },
      moveHistory: [],
    };
    
    // Convert to plain object to ensure it's serializable
    const serializableGameState = JSON.parse(JSON.stringify(initialGameState));
    
    await updateDoc(roomRef, {
      status: 'coin_flip',
      gameState: serializableGameState,
      currentTurn: firstPlayer,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
};

// Complete the coin flip and start the actual game
export const completeCoinFlip = async (roomId: string): Promise<void> => {
  try {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }
    
    await updateDoc(roomRef, {
      status: 'playing',
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error completing coin flip:', error);
    throw error;
  }
};

// Make a move in the game
export const makeMove = async (
  roomId: string, 
  playerId: string, 
  piece: Piece, 
  row: number, 
  col: number
): Promise<void> => {
  try {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }
    
    const roomData = roomSnap.data() as GameRoom;
    
    // Check if it's the player's turn
    const playerRole = roomData.player1?.id === playerId ? 'player1' : 'player2';
    
    if (playerRole !== roomData.currentTurn || roomData.status !== 'playing') {
      throw new Error('Not your turn or game not in progress');
    }
    
    // Create a new move
    const newMove: Move = {
      player: playerRole as Player,
      pieceId: piece.id,
      pieceSize: piece.size,
      toCell: { row, col },
      timestamp: Date.now()
    };
    
    // Update the game state with the new move
    const gameState = { ...roomData.gameState };
    
    // Create a deep copy of the board
    const newBoard = JSON.parse(JSON.stringify(gameState.board));
    
    // Add the piece to the cell
    const position: BoardPosition = `${row}-${col}`;
    newBoard[position].pieces.push(piece);
    
    // Update available pieces
    const newAvailablePieces = { ...gameState.availablePieces };
    newAvailablePieces[playerRole][piece.size] -= 1;
    
    // Update move history
    const newMoveHistory = [...gameState.moveHistory, newMove];
    
    // Check for win condition
    const winResult = checkWinCondition(newBoard);
    
    // Check for draw (all pieces used)
    const player1PiecesLeft = Object.values(newAvailablePieces.player1).reduce((a, b) => a + b, 0);
    const player2PiecesLeft = Object.values(newAvailablePieces.player2).reduce((a, b) => a + b, 0);
    const isDraw = !winResult && player1PiecesLeft === 0 && player2PiecesLeft === 0;
    
    // Update the game state
    const updatedGameState: GameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: playerRole === 'player1' ? 'player2' : 'player1',
      selectedPiece: null,
      availablePieces: newAvailablePieces,
      moveHistory: newMoveHistory,
      gameStatus: winResult ? 'win' : isDraw ? 'draw' : 'playing',
      winner: winResult || null
    };
    
    // Convert to plain object to ensure it's serializable
    const serializableGameState = JSON.parse(JSON.stringify(updatedGameState));
    
    // Update the room
    await updateDoc(roomRef, {
      gameState: serializableGameState,
      currentTurn: playerRole === 'player1' ? 'player2' : 'player1',
      status: winResult || isDraw ? 'finished' : 'playing',
      winner: winResult || null,
      lastUpdated: Date.now()
    });
    
  } catch (error) {
    console.error('Error making move:', error);
    throw error;
  }
};

// Get a list of available game rooms
export const getGameRooms = async (): Promise<GameRoom[]> => {
  try {
    const roomsCollection = collection(db, 'gameRooms');
    
    // Try the optimized query first (requires index)
    try {
      const q = query(
        roomsCollection, 
        where('status', '!=', 'finished'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const rooms: GameRoom[] = [];
      
      querySnapshot.forEach((doc) => {
        rooms.push(doc.data() as GameRoom);
      });
      
      return rooms;
    } catch (indexError) {
      console.warn('Index not yet available, falling back to simpler query:', indexError);
      
      // Fallback to a simpler query that doesn't require an index
      const simpleQuery = query(
        roomsCollection,
        limit(20)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      const rooms: GameRoom[] = [];
      
      // Filter in memory instead
      querySnapshot.forEach((doc) => {
        const room = doc.data() as GameRoom;
        if (room.status !== 'finished') {
          rooms.push(room);
        }
      });
      
      // Sort in memory
      rooms.sort((a, b) => {
        return b.createdAt - a.createdAt; // Sort by timestamp directly
      });
      
      return rooms;
    }
  } catch (error) {
    console.error('Error getting game rooms:', error);
    throw error;
  }
};

// Get a specific game room
export const getGameRoom = async (roomId: string): Promise<GameRoom | null> => {
  try {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      return null;
    }
    
    return roomSnap.data() as GameRoom;
  } catch (error) {
    console.error('Error getting game room:', error);
    throw error;
  }
};

// Subscribe to a game room for real-time updates
export const subscribeToGameRoom = (
  roomId: string, 
  callback: (room: GameRoom | null) => void
): (() => void) => {
  const roomRef = doc(db, 'gameRooms', roomId);
  
  const unsubscribe = onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as GameRoom);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to game room:', error);
    callback(null);
  });
  
  return unsubscribe;
};

// Delete a game room
export const deleteGameRoom = async (roomId: string): Promise<void> => {
  try {
    const roomRef = doc(db, 'gameRooms', roomId);
    await deleteDoc(roomRef);
    console.log(`Game room ${roomId} has been deleted`);
  } catch (error) {
    console.error('Error deleting game room:', error);
    throw error;
  }
};

// Helper function to check for win conditions
const checkWinCondition = (board: Board): Player | null => {
  // Check rows
  for (let row = 0; row < 3; row++) {
    const positions: BoardPosition[] = [`${row}-0`, `${row}-1`, `${row}-2`];
    if (checkLine(board[positions[0]], board[positions[1]], board[positions[2]])) {
      return getTopPiecePlayer(board[positions[0]]);
    }
  }
  
  // Check columns
  for (let col = 0; col < 3; col++) {
    const positions: BoardPosition[] = [`0-${col}`, `1-${col}`, `2-${col}`];
    if (checkLine(board[positions[0]], board[positions[1]], board[positions[2]])) {
      return getTopPiecePlayer(board[positions[0]]);
    }
  }
  
  // Check diagonals
  const diagonal1: BoardPosition[] = ['0-0', '1-1', '2-2'];
  if (checkLine(board[diagonal1[0]], board[diagonal1[1]], board[diagonal1[2]])) {
    return getTopPiecePlayer(board[diagonal1[0]]);
  }
  
  const diagonal2: BoardPosition[] = ['0-2', '1-1', '2-0'];
  if (checkLine(board[diagonal2[0]], board[diagonal2[1]], board[diagonal2[2]])) {
    return getTopPiecePlayer(board[diagonal2[0]]);
  }
  
  return null;
};

// Helper function to check if three cells form a line with the same player's pieces on top
const checkLine = (cell1: any, cell2: any, cell3: any): boolean => {
  if (cell1.pieces.length === 0 || cell2.pieces.length === 0 || cell3.pieces.length === 0) {
    return false;
  }
  
  const player1 = getTopPiecePlayer(cell1);
  const player2 = getTopPiecePlayer(cell2);
  const player3 = getTopPiecePlayer(cell3);
  
  return player1 === player2 && player2 === player3;
};

// Helper function to get the player of the top piece in a cell
const getTopPiecePlayer = (cell: any): Player | null => {
  if (cell.pieces.length === 0) {
    return null;
  }
  
  return cell.pieces[cell.pieces.length - 1].player;
};