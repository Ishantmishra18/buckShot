import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Update with your client URL if different
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Game variables
let waitingPlayer = null;
let players = {}; // Store player IDs and their states
let currentGunController = null; // Track whose turn it is
let player=[]

// Utility to generate random bullets array
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

let bullets = generateBullets();



io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinGame', () => {
    if (waitingPlayer === socket.id) {
      return;
    }
    if (waitingPlayer) {
     
      io.emit('startGame',waitingPlayer);
      waitingPlayer = null;
    } else {
      waitingPlayer = socket.id;
    }
  });

  socket.on('needbullets', ()=>{
    bullets = generateBullets();
    io.emit('getbullets', bullets)
  })
  

  // Handle gun pointing action
  socket.on('gunPoint', (gunPoint) => {
      socket.broadcast.emit('gunPoint2', gunPoint);
});

  socket.on('giveLive', (myLive , oppoLive) => {  
    socket.broadcast.emit('updateLive',myLive , oppoLive );
});
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    if (waitingPlayer === socket.id) waitingPlayer = null;
    if (currentGunController === socket.id) currentGunController = null;
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
