import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('https://buckshot.onrender.com'); // Initialize socket once

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const joinGameRoom = () => {
    setIsLoading(true); // Start loader when looking for a player
    console.log('Attempting to join game...');
    socket.emit('joinGame');
  };
  
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
    });
  
    socket.on('startGame', () => {
      console.log('Game started');
      setIsLoading(false); // Stop loader when game starts
      navigate('/game');
    });
  
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  
    return () => {
      socket.off('startGame');
      socket.off('connect');
      socket.off('error');
    };
  }, [navigate]);
  
  const cancelSearch = () => {
    setIsLoading(false); // Stop loader when canceled
    socket.emit('leaveGame'); // Notify server to remove from waiting
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-red-950 to-neutral-900 text-white">
      <h1 className="text-6xl font1 mb-10 animate-pulse uppercase">
        The Roulette Game
      </h1>

      <div className="flex gap-8">
        {/* Start Game Button */}
        {!isLoading && (
          <button
            onClick={joinGameRoom}
            className="btn px-8 py-4 rounded-lg bg-black hover:bg-white hover:text-black transition duration-300 shadow-lg"
          >
            Start the Game
          </button>
        )}

        {/* Cancel Button */}
        {isLoading && (
          <button
            onClick={cancelSearch}
            className="btn px-8 py-4 rounded-lg bg-red-600 hover:bg-red-800 transition duration-300 shadow-lg"
          >
            Cancel
          </button>
        )}

        {/* Private Room Button */}
        <Link
          to="/priroom"
          className={`btn px-8 py-4 rounded-lg bg-black hover:bg-white hover:text-black transition duration-300 shadow-lg ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={(e) => isLoading && e.preventDefault()} // Prevent link if loading
        >
          Enter Private Room
        </Link>
      </div>

      {isLoading && (
        <div className="mt-6 flex items-center gap-2 text-xl">
          <div className="loader w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          <span>Looking for another player...</span>
        </div>
      )}

      <footer className="mt-10 text-sm opacity-70">
        © {new Date().getFullYear()} version 1.0
      </footer>
    </div>
  );
};

export default Home;
