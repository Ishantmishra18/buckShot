import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://buckshot-1-frontend.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT;

// Map to track rooms and their players
let rooms = {};

const generateBullets = () => {
  const randomLength = Math.floor(Math.random() * 7) + 2; // Length between 2 and 8

  // Create an array with at least one 0 and one 1
  const initialBullets = [0, 1];

  // Fill the rest of the array with random 0s and 1s
  const remainingBullets = Array.from(
    { length: randomLength - 2 },
    () => Math.floor(Math.random() * 2)
  );

  // Combine and shuffle the array to randomize the positions of 0 and 1
  const bullets = [...initialBullets, ...remainingBullets];

  // Shuffle the array
  for (let i = bullets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bullets[i], bullets[j]] = [bullets[j], bullets[i]];
  }

  return bullets;
};

let bullets;



io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Handle player joining a game
  socket.on('joinGame', () => {
    // Find a room with space for a new player (less than 2 players)
    let roomName = Object.keys(rooms).find((room) => rooms[room].length < 2);

    // If no room is available, create a new room
    if (!roomName) {
      roomName = socket.id;  // Use socket.id as the unique room name
      rooms[roomName] = [socket.id];  // Create a new room with the current player
      socket.emit('waitingForOpponent');  // Notify the player that they are waiting for an opponent
    } else {
      // Join the existing room
      rooms[roomName].push(socket.id);  // Add the new player to the room
      socket.emit('gameReady', { oppoId: rooms[roomName][0] });  // Notify the second player
      io.to(rooms[roomName][0]).emit('gameReady', { oppoId: socket.id });  // Notify the first player

      // Randomly assign turn for the two players
      const firstPlayer = rooms[roomName][0];  // First player
      const secondPlayer = rooms[roomName][1];  // Second player
      const isFirstPlayerTurn = Math.random() < 0.5;  // Randomly decide who starts

      // Emit the initial turn assignment to both players
      io.to(firstPlayer).emit('assignTurn', isFirstPlayerTurn);
      io.to(secondPlayer).emit('assignTurn', !isFirstPlayerTurn);

      // Provide bullets to both players
      bullets = generateBullets();
      io.to(firstPlayer).emit('getbullets', bullets);
      io.to(secondPlayer).emit('getbullets', bullets);

      // Start the game
      startGame(roomName);
    }
  });

  // Emit startGame event to both players
  const startGame = (roomName) => {
    rooms[roomName].forEach(playerId => {
      io.to(playerId).emit('startGame');  // Start game for both players in the room
    });
  };

    // flash visuals
    socket.on('flash',()=>{
      const roomName = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));
        if (roomName) {
          const otherPlayer = rooms[roomName].find(playerId => playerId !== socket.id);
       if (otherPlayer) {
        socket.to(otherPlayer).emit('flash');
      }
        }
    })

  // Turn change logic
  socket.on('turnChangeit', () => {
    const roomName = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));
    if (roomName) {
      const otherPlayer = rooms[roomName].find(playerId => playerId !== socket.id);
      if (otherPlayer) {
        socket.to(otherPlayer).emit('turnChange');  // Send turnChange event to the other player
      }
    }
  });

  // Handle gun pointing updates from the client
socket.on('gunPoint', (gunPoint) => {
  const roomName = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));
  if (roomName) {
    const otherPlayer = rooms[roomName].find(playerId => playerId !== socket.id);
    if (otherPlayer) {
      socket.to(otherPlayer).emit('gunPoint2', gunPoint); // Broadcast gunPoint to the opponent
    }
  }
});

//Gun Sound Effect
socket.on('gunSound', (soundPath) => {
  const roomName = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));
  if (roomName) {
    const otherPlayer = rooms[roomName].find(playerId => playerId !== socket.id);
    if (otherPlayer) {
      socket.to(otherPlayer).emit('gunshotSound', soundPath);
    }
  }
});

  socket.on('bulletUpdate', (bulletIndex) => {
    const roomName = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));
    if (roomName) {
      // Broadcast the updated bullet index to all players in the room
      const otherPlayer = rooms[roomName].find(playerId => playerId !== socket.id);
      if (otherPlayer) {
        socket.to(otherPlayer).emit('bulletUpdate',bulletIndex);}
    }
  });
  
  socket.on('resetBulletIndex', () => {
    const roomName = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));
    if (roomName) {
      // Broadcast the reset event to all players in the room
      io.to(roomName).emit('resetBulletIndex');
    }
  });
  
  

  // Provide bullets to players
  socket.on('needbullets', () => {
    bullets = generateBullets();
    io.emit('getbullets', bullets);
  });

  // Update lives
  socket.on('updateLive', (myLive, oppoLive) => {
    const roomName = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));
    if (roomName) {
      const opponent = rooms[roomName].find((player) => player !== socket.id);
      socket.to(opponent).emit('updateLive', oppoLive, myLive);
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log(`A user disconnected: ${socket.id}`);

    // Remove player from rooms if present
    const roomName = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));
    if (roomName) {
      const playersInRoom = rooms[roomName];
      const remainingPlayer = playersInRoom.find((player) => player !== socket.id);

      // Notify the remaining player about the disconnection
      if (remainingPlayer) {
        io.to(remainingPlayer).emit('opponentLeft');
      }

      // Delete the room
      delete rooms[roomName];
      console.log(`Room ${roomName} deleted`);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
