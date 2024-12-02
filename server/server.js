import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app); // No need for 'new'

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

let waitingPlayer = null; // Declare waitingPlayer

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinGame', () => {
    if (waitingPlayer === socket.id) {
      console.log('You are already waiting for a player!');
      return;
    }
    if (waitingPlayer) {
      io.to(waitingPlayer).emit('startGame');
      io.to(socket.id).emit('startGame');
      waitingPlayer = null;
      console.log('second user joined')
    } else {
      waitingPlayer = socket.id;
      console.log('first user joined')
    }
  });

  socket.on('toggleBulb', (bulbState) => {
    socket.broadcast.emit('toggleBulb2', bulbState);
    console.log('receiced from frontend here') // Broadcast to all except sender
  });

  socket.on('disconnect', () => {
    if (waitingPlayer === socket.id) waitingPlayer = null;
    console.log('A user disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
