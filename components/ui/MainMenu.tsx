"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Egg, Users, Copy, Info, X, ChevronRight, Gamepad2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nanoid } from 'nanoid';
import { createGameRoom, getGameRooms } from '@/lib/online-game';
import { GameRoom } from '@/lib/types';
import { playSound } from '@/lib/sounds';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const MainMenu: React.FC = () => {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Load player name from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('playerName');
      if (storedName) {
        setPlayerName(storedName);
      }
    }
  }, []);
  
  // Generate or load player ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let playerId = localStorage.getItem('playerId');
      if (!playerId) {
        playerId = nanoid();
        localStorage.setItem('playerId', playerId);
      }
    }
  }, []);
  
  // Load available rooms
  const loadRooms = async () => {
    try {
      setIsLoading(true);
      setError('');
      const rooms = await getGameRooms();
      setAvailableRooms(rooms);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setIsLoading(false);
      setError('Failed to load rooms. Please try again.');
    }
  };
  
  useEffect(() => {
    if (joinDialogOpen) {
      loadRooms();
    }
  }, [joinDialogOpen]);
  
  // Start local game
  const handleStartLocalGame = () => {
    playSound('select');
    router.push('/game');
  };
  
  // Create online game
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Save player name
      localStorage.setItem('playerName', playerName);
      
      // Create room
      const playerId = localStorage.getItem('playerId') || nanoid();
      localStorage.setItem('playerId', playerId);
      
      const roomId = await createGameRoom(roomName, playerName, playerId);
      
      // Navigate to room
      router.push(`/online/${roomId}`);
    } catch (error: any) {
      console.error('Error creating room:', error);
      setError(`Failed to create room: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };
  
  // Join online game
  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    // Save player name
    localStorage.setItem('playerName', playerName);
    
    // Navigate to room
    router.push(`/online/${roomCode.toUpperCase()}`);
  };
  
  // Join a specific room from the list
  const handleJoinSpecificRoom = (roomId: string) => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    // Save player name
    localStorage.setItem('playerName', playerName);
    
    // Navigate to room
    router.push(`/online/${roomId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          backgroundImage: 'url(/images/nature-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.8)'
        }}
      />
      
      {/* Game Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg">
          Eggy Chess
        </h1>
        <p className="text-xl text-white mt-2 opacity-90">A strategic stacking game</p>
      </motion.div>
      
      {/* Main Menu Card */}
      <motion.div
        className="w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.2
        }}
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Game Menu</CardTitle>
            <CardDescription className="text-center text-white/70">
              Choose a game mode to play
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              onClick={handleStartLocalGame}
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Play Local Game
            </Button>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  onClick={() => {
                    setCreateDialogOpen(true);
                    playSound('select');
                  }}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Create Online Game
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle>Create Online Game</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Create a new game room for others to join.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="player-name" className="text-sm font-medium">
                      Your Name
                    </label>
                    <Input
                      id="player-name"
                      placeholder="Enter your name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="room-name" className="text-sm font-medium">
                      Room Name
                    </label>
                    <Input
                      id="room-name"
                      placeholder="Enter room name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-white/20 text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRoom}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    {isLoading ? 'Creating...' : 'Create Room'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  onClick={() => {
                    setJoinDialogOpen(true);
                    playSound('select');
                  }}
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Join Online Game
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle>Join Online Game</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Join an existing game room.
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="code">
                  <TabsList className="bg-white/20 text-white">
                    <TabsTrigger value="code" className="data-[state=active]:bg-white/30">
                      Enter Code
                    </TabsTrigger>
                    <TabsTrigger value="browse" className="data-[state=active]:bg-white/30">
                      Browse Rooms
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="code" className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="player-name-join" className="text-sm font-medium">
                        Your Name
                      </label>
                      <Input
                        id="player-name-join"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="room-code" className="text-sm font-medium">
                        Room Code
                      </label>
                      <Input
                        id="room-code"
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    
                    {error && (
                      <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <Button 
                      onClick={handleJoinRoom}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      Join Room
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="browse" className="py-4">
                    <div className="space-y-2 mb-4">
                      <label htmlFor="player-name-browse" className="text-sm font-medium">
                        Your Name
                      </label>
                      <Input
                        id="player-name-browse"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    
                    {error && (
                      <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {isLoading ? (
                        <div className="text-center py-8 text-white/70">
                          Loading rooms...
                        </div>
                      ) : availableRooms.length > 0 ? (
                        availableRooms.map((room) => (
                          <div 
                            key={room.id}
                            className="bg-white/20 rounded-lg p-3 flex justify-between items-center hover:bg-white/30 transition-colors cursor-pointer"
                            onClick={() => handleJoinSpecificRoom(room.id)}
                          >
                            <div>
                              <div className="font-medium">{room.name}</div>
                              <div className="text-sm text-white/70">
                                {room.player1 ? 1 : 0}/2 Players • {room.status === 'waiting' ? 'Waiting' : 'Playing'}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-white/70" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-white/70">
                          No rooms available. Create one!
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 border-white/20 text-white hover:bg-white/20"
                      onClick={loadRooms}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Refresh Rooms'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => {
                setShowInstructions(true);
                playSound('select');
              }}
            >
              <Info className="mr-2 h-4 w-4" />
              How to Play
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Egg className="mr-2 h-5 w-5 text-amber-400" />
              How to Play Eggy Chess
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Learn the rules and strategies of the game
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <h3 className="text-lg font-bold mb-2">Game Objective</h3>
              <p>
                The goal is to create a line of three of your eggs in a row - horizontally, vertically, or diagonally.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2">Game Pieces</h3>
              <p className="mb-2">
                Each player has 6 eggs in three different sizes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>2 Small eggs</li>
                <li>2 Medium eggs</li>
                <li>2 Large eggs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2">Game Rules</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Players take turns placing one of their eggs on the 3×3 board.
                </li>
                <li>
                  <strong>Stacking Rule:</strong> A larger egg can be placed on top of a smaller egg, regardless of which player the smaller egg belongs to.
                </li>
                <li>
                  Only the top egg in each stack is visible and counts for winning.
                </li>
                <li>
                  The game ends when a player creates a line of three of their eggs, or when all eggs have been placed and no player has won (a draw).
                </li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2">Strategy Tips</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Save your larger eggs to capture strategic positions by stacking on top of opponent's eggs.</li>
                <li>Try to create multiple threats that your opponent cannot block simultaneously.</li>
                <li>Pay attention to which eggs your opponent has remaining.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2">Online Play</h3>
              <p>
                Create a room and share the room code with a friend, or browse available rooms to join an existing game.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowInstructions(false)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Footer */}
      <motion.div
        className="mt-8 text-white/60 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        © 2025 Eggy Chess • All Rights Reserved
      </motion.div>
    </div>
  );
};

export default MainMenu;