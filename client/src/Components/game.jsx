import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';

const Game = () => {
  const [socketID, setSocketID] = useState('');
  const [isBulbOn, setIsBulbOn] = useState(false);
  const [gunPoint  ,setGunPoint]=useState()
  const [items, setItems] = useState([]); // Bullets/items

  const socket = useMemo(() => io('http://localhost:3000'), []);

  useEffect(() => {
    // Capture the socket's unique ID
    socket.on('connect', () => {
      setSocketID(socket.id);
    });

    // Listen for bulb toggle events
    socket.on('toggleBulb2', (bulbState) => {
      setIsBulbOn(bulbState);
      console.log('state is', bulbState);
    });

    // Generate random items (between 1 and 8)
    const randomLength = Math.floor(Math.random() * 7) + 2;
    setItems(Array.from({ length: randomLength }));

    return () => {
      socket.disconnect(); // Cleanup socket connection on component unmount
    };
  }, [socket]);

  const handleBulbToggle = () => {
    const newBulbState = !isBulbOn;
    setIsBulbOn(newBulbState);
    socket.emit('toggleBulb', newBulbState);
    console.log('backend me gya with ', newBulbState);
  };

  return (
    <div className="page h-screen w-screen bg-black relative flex items-center justify-between">
      {/* Bullets Section */}
      <div className="bullets grid place-content-center backdrop-blur-m absolute top-0 h-screen w-screen z-40">
        <div className="bulletcont flex gap-5">
      {items.map((_, index) => {

      let isRed;
      if (index === 0) {
        isRed = true; // First bullet is red
      } else if (index === items.length - 1) {
        isRed = false; // Last bullet is green
      } else {
        isRed = Math.random() < 0.5; // Randomize the rest
      }
      return (
        <div
          key={index}
          className="w-5 h-12 flex flex-col items-center rounded-t-lg overflow-hidden relative"
        >
          <div className="shadow absolute top-0 left-0 w-full h-full"></div>
          <div
            className={`topshell w-full h-[70%] ${
              isRed ? 'bg-red-500' : 'bg-green-500'
            }`}
          ></div>
          <div className="btmshell w-full h-[30%] bg-neutral-700"></div>
        </div>
      );
    })}
    </div>
      </div>

      {/* Left Player */}
      <div className="player-left imgcont h-[40vh] w-[20%] flex items-center justify-center">
        <img src="/player/default.png" alt="Player Left" className="h-[40vh] w-full" />
      </div>

      {/* Gun in the Center */}
      <div className="gun-cont imgcont flex flex-col items-center justify-center text-white">
        <img src="/gun.png" alt="Gun" className="h-[25vh] object-cover opacity-80" onClick={handleBulbToggle} />
        <h2 className='text-2xl'>who would you shoot?</h2>
        <div className="choice flex gap-56 text-6xl uppercase mt-10 font1">
          <h2>you</h2>
          <h2>opponent</h2>
        </div>
      </div>

      {/* Right Player */}
      <div className="player-right imgcont h-[40vh] w-[20%] flex items-center justify-center">
        <img src="/player/default.png" alt="Player Right" className="h-[40vh] w-full" />
      </div>
    </div>
  );
};

export default Game;
