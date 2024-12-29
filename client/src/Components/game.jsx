import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import Players from './players';
import {Link} from 'react-router-dom'

const Game = () => {
  const [gunPoint, setGunPoint] = useState(0);
  const [socketId, setSocketID] = useState(null);
  const [oppoId, setOppoID] = useState(null);
  const [items, setItems] = useState([]);
  const [shuffledItems, setShuffledItems] = useState([]);
  const [bulletIndex, setBulletIndex] = useState(0);
  const [myLive, setMyLive] = useState(10);
  const [oppoLive, setOppoLive] = useState(10);
  const [showBullets, setShowBullets] = useState(true);
  const [myTurn, setMyTurn] = useState(false);
  const [gameOver , setGameOver]=useState(false)
  const [showFlash, setShowFlash] = useState(false); 

  // Socket instance
  const socket = useMemo(() => io('https://buckshot.onrender.com'), []);

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
    // Emit gun point changes when it changes
    if (myTurn) {
      socket.emit('gunPoint', gunPoint);
    }
  
    // Listen for gun point updates from the other player
    socket.on('gunPoint2', (newGunPoint) => {
      setGunPoint(newGunPoint); // Update gun direction for the opponent
    });
  
    return () => {
      socket.off('gunPoint2');
    };
  }, [gunPoint, myTurn]);


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
  // Synchronize bulletIndex across both players
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


//random bullets generate
useEffect(() => {
  // Shuffle items only once when received
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  setShuffledItems(shuffled);
}, [items]);


//healthbar
useEffect(() => {
  socket.on('updateLive',(oppolive , mylive)=>{
    setMyLive(oppolive)
    setOppoLive(mylive)
    console.log('heath bar is upadated mylive and oopolive are',mylive , oppolive)
  })
  
}, []);


//game over
useEffect(() => {
  if (myLive <= 0 || oppoLive <= 0) {
    setGameOver(true);
   
  }
}, [myLive, oppoLive]);

//fire gun sound
useEffect(() => {
  socket.on('gunshotSound', (soundPath) => {
    const gunSound = new Audio(soundPath);
    console.log('Playing sound:', soundPath);
    gunSound.play().catch((err) => {
      console.error('Error playing gunshot sound:', err);
    });
  });

  return () => {
    socket.off('gunshotSound'); // Cleanup listener on unmount
  };
}, [socket , bulletIndex]);

//flash visuals
useEffect(()=>{
  socket.on('flash',()=>{
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
  })
},[])

 
//fire gun function
const fireGun = (setLive, isOpponent) => {
 const soundPath = items[bulletIndex] === 0 ? './sounds/clickfire.mp3' : './sounds/gunfire.mp3';
 const gunSound =new Audio(soundPath)
 gunSound.play()
  socket.emit('gunSound', soundPath); 

  // Update health if a bullet is fired
  if (items[bulletIndex] !== 0) {

    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
    socket.emit('flash')
    
    setLive((prev) => {
      const newLive = prev - 1;
      socket.emit('updateLive', isOpponent ? myLive : newLive, isOpponent ? newLive : oppoLive); // Emit updated values
      return newLive;
    });
  }

  // Change turn if necessary
  if (isOpponent || items[bulletIndex] === 1) {
    setMyTurn((prev) => {
      const newTurn = !prev;
      socket.emit('turnChangeit', newTurn);
      return newTurn;
    });
  }

  // Increment bullet index
  const newBulletIndex = bulletIndex + 1;
  setBulletIndex(newBulletIndex);
  socket.emit('bulletUpdate', newBulletIndex); // Emit updated bullet index
};


  return (
  <div className="page h-screen w-screen bg-black relative flex items-center justify-between px-4 overflow-hidden">
    {/* Gunshot Flash */}
    {showFlash && (
      <div className="absolute top-0 left-0 w-full h-full bg-red-900 backdrop-blur-sm opacity-80 z-50 animate-pulse"></div>
    )}

    {/* Game Over Screen */}
    <div className={`h-full w-full absolute backdrop-blur-md top-0 left-0 grid place-content-center z-50 ${!gameOver && 'hidden'}`}>
      <div className="gameovercard font1 w-[90%] sm:w-[60%] md:w-[40%] h-[80vh] shadow-2xl rounded-2xl flex flex-col items-center justify-between p-10">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl mb-4">Game Over</h1>
          <h2 className={`text-lg sm:text-2xl md:text-3xl ${myLive <= 0 ? 'text-red-700' : 'text-green-700'} uppercase`}>
            {myLive <= 0 ? 'You Lost!' : 'You Won!'}
          </h2>
        </div>
        <img src={myLive <= 0 ? './player/lose.png' : './player/win.png'} alt="Result" className="h-[40%] sm:h-[50%] md:h-[60%] object-contain" />
        <Link
          to="/"
          className="mt-6 px-6 sm:px-10 py-3 sm:py-4 bg-yellow-800 hover:bg-yellow-900 text-black rounded-lg text-lg sm:text-2xl font-bold uppercase shadow-lg duration-300"
        >
          Back to Home
        </Link>
      </div>
    </div>

    {/* Bullets Section */}
    <div className={`bullets grid place-content-center backdrop-blur-sm absolute top-0 h-screen w-screen z-40 ${!showBullets && 'hidden'}`}>
      <div className="bulletcont flex gap-2 sm:gap-5">
        {shuffledItems.map((val, index) => (
          <div key={index} className="w-3 sm:w-5 h-8 sm:h-12 flex flex-col items-center rounded-t-lg overflow-hidden relative">
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
    <div className="gun-cont w-[90%] sm:w-[60%] md:w-[40%] imgcont flex flex-col items-center justify-center text-white mx-auto">
      <h1 className="turn font1 text-2xl sm:text-4xl md:text-5xl">{myTurn ? 'Your Turn' : 'Waiting...'}</h1>
      <img
        src="/gun.png"
        alt="Gun"
        className={`w-[70vw] sm:w-[50vw] md:w-[35vw] object-cover opacity-80 pointer-events-none duration-300 ${!myTurn ? 'scale-x-[-1]' : ''} ${
          gunPoint === 1 ? 'rotate-0' : gunPoint === 2 ? '-rotate-[180deg]' : 'rotate-12'
        }`}
      />
      <h2 className="text-lg sm:text-xl md:text-2xl font1 mt-5 sm:mt-10">Who would you shoot?</h2>
      <div className={`choice flex gap-12 sm:gap-48 text-xl sm:text-3xl md:text-5xl uppercase mt-6 sm:mt-12 font1 ${!myTurn && 'pointer-events-none'}`}>
        <h2
          className="cursor-pointer hover:translate-y-1 duration-200"
          onMouseEnter={() => setGunPoint(2)}
          onMouseLeave={() => setGunPoint(0)}
          onClick={() => fireGun(setMyLive, false)}
        >
          Suicide
        </h2>
        <h2
          className="cursor-pointer hover:translate-y-1 duration-200"
          onMouseEnter={() => setGunPoint(1)}
          onMouseLeave={() => setGunPoint(0)}
          onClick={() => fireGun(setOppoLive, true)}
        >
          Opponent
        </h2>
      </div>
    </div>

    {/* Opponent Player */}
    <Players userSocket={oppoId} lives={oppoLive} myTurn={!myTurn} opp={true} />
  </div>
);

};

export default Game;
