import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import Players from './players';

const Game = () => {
  const [gunPoint, setGunPoint] = useState(0);
  const [socketId, setSocketID] = useState(null);
  const [oppoId, setOppoID] = useState(null);
  const [timer, setTimer] = useState(30);
  const [items, setItems] = useState([]);
  const [bulletIndex, setBulletIndex] = useState(0);
  const [myLive, setMyLive] = useState(8);
  const [oppoLive, setOppoLive] = useState(8);
  const [showBullets, setShowBullets] = useState(true);
  const [myTurn, setMyTurn] = useState(false);

  // Socket instance
  const socket = useMemo(() => io('http://localhost:3000'), []);

  // On mount: Socket setup and cleanup
  useEffect(() => {
    socket.on('connect', () => setSocketID(socket.id));
    socket.emit('joinGame');

    socket.on('assignTurn', (isMyTurn) => {
      setMyTurn(isMyTurn); // Set initial turn
    });

    socket.on('startGame', () => {
      console.log('Game started. My socket ID:', socket.id);
    });

    socket.emit('needbullets');
    socket.on('getbullets', (bullets) => {
      setItems(bullets);
      console.log('hello', bullets)
    });

    setShowBullets(true);
    setTimeout(() => setShowBullets(false), 3000);

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  // Gun pointing updates
  useEffect(() => {
    socket.emit('gunPoint',gunPoint)
    socket.on('gunPoint2',(gunpoint)=>{
        setGunPoint(gunpoint)
    })
  }, [socket , gunPoint]);

  // Turn changes
  useEffect(() => {
    socket.on('turnChange', () => {
      setMyTurn((prevTurn) => !prevTurn);  // Toggling based on previous value
    });
  
    // Clean up the event listener when the component unmounts
    return () => {
      socket.off('turnChange');
    };
  }, []);  // Empty dependency array ensures this runs only once on mount
  




 // Bullet updates
useEffect(() => {
  socket.on('bulletUpdate', (bullets) => {
    setBulletIndex(bullets);
    console.log('I got the bullet',bullets) // Synchronize bulletIndex across both players
  });

  // Listen for bullet index reset from the server
  socket.on('resetBulletIndex', () => {
    setBulletIndex(0); // Reset the bullet index to 0 when the server sends the reset signal
  });

  // Detect when bullets run out and request new bullets
  if (bulletIndex === items.length) {
    socket.emit('needbullets'); // Notify the server to generate new bullets
  }

  // Listen for new bullets
  socket.on('getbullets', (newBullets) => {
    setItems(newBullets); // Update the bullets array
    setBulletIndex(0); // Reset the bullet index to start from the first bullet
    setShowBullets(true); // Show the bullets
    setTimeout(() => setShowBullets(false), 3000); // Hide bullets after 3 seconds
  });

  return () => {
    socket.off('bulletUpdate');
    socket.off('getbullets');
    socket.off('resetBulletIndex');
  };
}, [bulletIndex, items.length, socket]);





//healthbar
useEffect(() => {
  socket.emit('updateLive',myLive , oppoLive)
  socket.on('updateLive',(oppolive , mylive)=>{
    setMyLive(mylive)
    setOppoLive(oppolive)
  })
  
}, [myLive, oppoLive]);

 
//fire gun function
  const fireGun = (liveDown, isOpponent) => {
    const audio = new Audio(items[bulletIndex] === 0 ? './sounds/clickfire.mp3' : './sounds/gunfire.mp3');
    audio.play();

    if (items[bulletIndex] !== 0) {
      liveDown((prev) => prev - 1);
    }

    if(isOpponent || items[bulletIndex]===1){
      setMyTurn(!myTurn)
      socket.emit('turnChangeit')
    }
  
    const newBulletIndex = bulletIndex + 1;

    setBulletIndex(newBulletIndex)
    
    socket.emit('bulletUpdate', newBulletIndex); // Emit the updated bullet index to the server
    console.log('Shell and bullets are', newBulletIndex, items.length);
  };

  return (
    <div className="page h-screen w-screen bg-black relative flex items-center justify-between px-4 overflow-hidden">
      {/* Bullets Section */}
      <div className={`bullets grid place-content-center backdrop-blur-sm absolute top-0 h-screen w-screen z-40 ${!showBullets && 'hidden'}`}>
  <div className="bulletcont flex gap-5">
    {/* {[...items]
      .map((item, index) => ({ item, index })) // Pair items with their original indices
      .sort(() => Math.random() - 0.5)} // Shuffle the pairs randomly */
      items.map(( val , index ) => (
        <div key={index} className="w-5 h-12 flex flex-col items-center rounded-t-lg overflow-hidden relative">
          <div className="shadow absolute top-0 left-0 w-full h-full"></div>
          <div className={`topshell w-full h-[70%] ${val === 1 ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <div className="btmshell w-full h-[30%] bg-neutral-700"></div>
        </div>
      ))}
  </div>
</div>


      {/* Player Components */}
      <Players userSocket={socketId} lives={myLive} myTurn={myTurn} opp={false} />

      {/* Gun in the Center */}
      <div className="gun-cont w-[40%] imgcont flex flex-col items-center justify-center text-white">
        <div className="timer text-3xl">{timer}</div>
        <img
          src="/gun.png"
          alt="Gun"
          className={`w-[35vw] object-cover opacity-80 pointer-events-none duration-300 ${!myTurn ? 'scale-x-[-1]' : ''} ${gunPoint === 1 ? '-rotate-12' : gunPoint === 2 ? '-rotate-[160deg]' : ''}`}
        />
        <h2 className="text-2xl font1">Who would you shoot?</h2>
        <div className={`choice flex gap-48 text-5xl uppercase mt-28 font1 ${!myTurn && 'pointer-events-none'}`}>
          <h2 className="cursor-pointer" onMouseEnter={() => setGunPoint(2)} onMouseLeave={() => setGunPoint(0)} onClick={() => fireGun(setMyLive, false)}>
            Suicide
          </h2>
          <h2 className="cursor-pointer" onMouseEnter={() => setGunPoint(1)} onMouseLeave={() => setGunPoint(0)} onClick={() => fireGun(setOppoLive, true)}>
            Opponent
          </h2>
        </div>
      </div>

      {/* Right Player */}
      <Players userSocket={oppoId} lives={oppoLive} myTurn={!myTurn} opp={true} />
    </div>
  );
};

export default Game;
