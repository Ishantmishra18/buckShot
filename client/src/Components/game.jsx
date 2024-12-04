import React, { useEffect, useState, useMemo, useTransition } from 'react';
import { io } from 'socket.io-client';
import Players from './players';

const Game = () => {
  const [gunPoint, setGunPoint] = useState(0);
  const [socketId , setSocketID]=useState()
  const [oppoId , setOppoID]=useState()
  const [timer, setTimer] = useState(30);
  const [items, setItems] = useState([]);
  const [yourTurn,setYourTurn] = useState(true);
  const [showBullets, setShowBullets] = useState(true); 
  const [bulletIndex, setBulletIndex] = useState(0);
  const [myLive, setMyLive] = useState(8)
  const [oppoLive, setOppoLive] = useState(8)


  const socket = useMemo(() => io('http://localhost:3000'), []);

  useEffect(() => {
    socket.on('connect', () => setSocketID(socket.id));
    console.log('new user')
    socket.on('startGame', (waitingPlayer) => {
      setOppoID(waitingPlayer)
    });
    socket.emit('needbullets')
    socket.on('getbullets', (bullets)=>{
      setItems(bullets)
    })
  setShowBullets(true);
      setTimeout(() => setShowBullets(false), 3000);
    return () => socket.disconnect();
  },[]);
  

  useEffect(() => {
    socket.emit('gunPoint', gunPoint);
    socket.on('gunPoint2', (gunPoint) => setGunPoint(gunPoint));
  }, [gunPoint, socket]);

  useEffect(() => {
    socket.emit('giveLive',oppoLive , myLive);
    socket.on('updateLive', (oppoLive , myLive) => {
      setOppoLive(oppoLive) 
      setMyLive(myLive)});
      
  }, [oppoLive,myLive,socket]);


  const fireGun = (liveDown , who) => {
    if (bulletIndex === items.length) {
      socket.emit('needbullets');
  
      // Use a one-time listener for 'getbullets'
      socket.once('getbullets', (bullets) => {
        setItems(bullets);
        setShowBullets(true);
        setTimeout(() => setShowBullets(false), 3000);
      });
  
      setBulletIndex(0); // Reset bullet index
    } else {
      if (items[bulletIndex] === 0) {
        alert('Click! The shell was blank.');
        who==1&&setYourTurn(!yourTurn)
      } else {
        alert('Bang! That was a good shot.');
        liveDown((prevIndex)=>prevIndex-1);
        setYourTurn(!yourTurn)
      }
      setBulletIndex((prevIndex) => prevIndex + 1); // Increment bullet index safely
    }
  };
  
  console.log(yourTurn)

  return (
    <div className="page h-screen w-screen bg-black relative flex items-center justify-between px-4 overflow-hidden">
      {/* Bullets Section */}
   
        <div className={`bullets grid place-content-center backdrop-blur-sm pointer-events-none backdrop-blur-m absolute top-0 h-screen w-screen z-40 ${!showBullets&&'hidden'}`}>
          <div className="bulletcont flex gap-5">
            {items.map((item, index) => (
              <div key={index} className="w-5 h-12 flex flex-col items-center rounded-t-lg overflow-hidden relative">
                <div className="shadow absolute top-0 left-0 w-full h-full"></div>
                <div className={`topshell w-full h-[70%] ${item === 1 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <div className="btmshell w-full h-[30%] bg-neutral-700"></div>
              </div>
            ))}
          </div>
        </div>
      

     <Players userSocket={socketId} lives={myLive}/>

      {/* Gun in the Center */}
      <div className="gun-cont w-[40%] imgcont flex flex-col items-center justify-center text-white">
        <div className="timer text-3xl">{timer}</div>
        <img
          src="/gun.png"
          alt="Gun"
          className={`w-[35vw] object-cover opacity-80 pointer-events-none duration-300 ${
            gunPoint === 1 ? '-rotate-12' : gunPoint === 2 ? '-rotate-[160deg]' : ''
          }`}
        />
        <h2 className="text-2xl font1">Who would you shoot?</h2>
        <div className="choice flex gap-48 text-5xl uppercase mt-10 font1">
          <h2
            className="cursor-pointer"
            onMouseEnter={() =>setGunPoint(2)}
            onMouseLeave={() =>setGunPoint(0)}
            onClick={()=>fireGun(setMyLive , 0)}
          >
            suicide
          </h2>
          <h2
            className="cursor-pointer"
            onMouseEnter={() => setGunPoint(1)}
            onMouseLeave={() => setGunPoint(0)}
            onClick={()=>fireGun(setOppoLive , 1)}
          >
            opponent
          </h2>
        </div>
      </div>

      {/* Right Player */}
      <Players userSocket={oppoId} lives={oppoLive}/>
    </div>
  );
};

export default Game;
