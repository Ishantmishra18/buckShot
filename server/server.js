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
let currentTurn ='one'
let players={}

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

let waiting=null

io.on('connection', (socket) => {

  socket.on('joinGame', () => {
    if (!players.one && !waiting) {
      players.one = socket.id;
      socket.emit('playerRole', 'one');
      waiting = socket.id;
    } else {
      players.two = socket.id;
      socket.emit('playerRole', 'two');
      io.emit('startGame');
      waiting = null;
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
  socket.on('fire',()=>{
    if ((currentTurn=='one' && socket.id !== players.one) ||(currentTurn=='two' && socket.id !== players.two)){
        socket.emit('gunfire',false)
    }
    
    io.emit('gunfire',true)
  })
  socket.on('quitGame',()=>{
    socket.broadcast.emit('opponentLeft')
  })
  socket.on('turnChangeit',()=>{
    socket.broadcast.emit('turnChange')
  })

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    if (players.one === socket.id) {
      players.one = null;
      console.log(`Player one (${socket.id}) left the game.`);
    } else if (players.two === socket.id) {
      players.two = null;
      console.log(`Player two (${socket.id}) left the game.`);
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
