import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('https://buckshot.onrender.com'); // Initialize socket once

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [displayHow, setDisplayHow] = useState(false);

  const joinGameRoom = () => {
    setIsLoading(true);
    console.log('Attempting to join game...');
    socket.emit('joinGame');
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
    });

    socket.on('startGame', () => {
      console.log('Game started');
      setIsLoading(false);
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
    setIsLoading(false);
    socket.emit('leaveGame');
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center text-white relative overflow-hidden">
      <div className="howtoplay absolute top-10 left-10 p-5 bg-black border-2 border-neutral-700 text-center bg-opacity-35 text-white text-xl rounded-lg cursor-pointer z-30 font1" onClick={()=>setDisplayHow(true)}>how to play?</div>
      <div className={`howCard absolute top-0 left-0 h-screen w-screen z-40 backdrop-blur-lg grid place-content-center ${!displayHow && 'hidden'}`}>
  <div className="card w-[40vw] max-w-[90vw] h-[70vh] max-h-[90vh] bg-black bg-opacity-75 rounded-lg flex flex-col relative p-7 overflow-y-auto">
    <div 
      className="cross absolute top-6 right-6 text-3xl p-3 bg-black bg-opacity-25 cursor-pointer border-2 border-neutral-600 rounded-md" 
      onClick={() => setDisplayHow(false)}
    >
      X
    </div>
    <h2 className="text-3xl font1 mb-6">How to Play</h2>
    <p className="mb-4">
      The goal is simple: eliminate your opponent by reducing their lives to zero while keeping yourself alive.
    </p>
    <p className="mb-4">
      <strong>Your Turn to Shoot:</strong> Each round, decide where to aim:  
      <ul className="list-disc ml-5">
        <li><strong>Shoot Yourself:</strong> Risk losing a life. If the bullet is empty, you keep your turn.</li>
        <li><strong>Shoot Opponent:</strong> Try to reduce their lives. Whether you hit or miss, the turn passes to your opponent.</li>
      </ul>
    </p>
    <p className="mb-4">
      <strong>Bullet Preview:</strong> At the start of each round, the bullets will be shown in a random order for a few seconds. Use this time to memorize their positions.  
    </p>
    <p className="mb-4">
      <strong>Winning:</strong> The game ends when one player’s lives reach zero. Outlast your opponent to win!
    </p>
    <p className="mb-4">
      <strong>Tips:</strong>  
      <ul className="list-disc ml-5">
        <li>just don't die</li>
      </ul>
    </p>
  </div>
</div>

      <img src="/images/mainbg.jpg" alt="" className='absolute object-cover top-0 left-0 h-screen w-screen -z-10'/>
      <div className="shade absolute top-0 left-0 h-screen w-screen"></div>
      <h1 className="text-6xl font-bold mb-8 text-center font1 tracking-wide drop-shadow-lg">
        The Roulette Game
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-sm md:max-w-md items-center">
        {/* Start Game Button */}
        {!isLoading && (
          <button
            onClick={joinGameRoom}
            className="px-6 py-4 w-full bg-neutral-900  hover:to-green-800 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:translate-y-1"
          >
            Start Game
          </button>
        )}

        {/* Cancel Button */}
        {isLoading && (
          <button
            onClick={cancelSearch}
            className="px-8 py-4 w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:translate-y-1"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mt-6 flex items-center gap-2 text-lg animate-pulse">
          <div className="loader w-8 h-8 border-4 font-bold border-t-transparent border-white rounded-full animate-spin"></div>
          <span>Looking for another player...</span>
        </div>
      )}

      <footer className="mt-10 text-sm opacity-70 text-center">
        © {new Date().getFullYear()} The Roulette Game v1.0
      </footer>
    </div>
  );
};

export default Home;
