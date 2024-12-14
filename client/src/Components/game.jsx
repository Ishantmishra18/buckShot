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
  const [myTurn , setMyTurn] = useState(false)

  const socket = useMemo(() => io('http://localhost:3000'), []);

  useEffect(() => {
    socket.on('connect', () => setSocketID(socket.id));
    
    socket.emit('joinGame')

    socket.on('playerRole',(role)=>{
      console.log('the role is', role)
      if(role==='one'){
        setMyTurn(true)
        console.log('role is', role)
      }
      else{
        setMyTurn(false)
      }
    })
    socket.on('startGame', () => {
      console.log(socket.id);
     
    });

    socket.emit('needbullets');
    socket.on('getbullets', (bullets) => setItems(bullets));

    setShowBullets(true);
    setTimeout(() => setShowBullets(false), 3000);

    return () => socket.disconnect();
  }, [socket]);

  useEffect(() => {
    socket.emit('gunPoint', gunPoint);
    socket.on('gunPoint2', (gunPoint) => setGunPoint(gunPoint));
  }, [gunPoint, socket]);

  useEffect(() => {
    socket.on('turnChange',()=>{
      setMyTurn(!myTurn)
    })
  }, [myTurn]);

  
  const fireGun = (liveDown, who) => {
    socket.emit('gunfire')
    socket.on('gunfire',(val)=>{
      setMyTurn(val)
    })
    if(!myTurn){
      alert('your turn is not there')
    }
    else if (bulletIndex === items.length) {
      socket.emit('needbullets');
      socket.once('getbullets', (bullets) => {
        setItems(bullets);
        setShowBullets(true);
        setTimeout(() => setShowBullets(false), 3000);
      });
      setBulletIndex(0);
    } 
    else {
      if (items[bulletIndex] === 0) {
        const audio = new Audio('./sounds/clickfire.mp3');
        audio.play();
      } else {
        const audio = new Audio('./sounds/gunfire.mp3');
        audio.play();
        setMyTurn(!myTurn)
        socket.emit('turnChangeit')
        liveDown((prev) => prev - 1);
      }
      setBulletIndex((prev) => prev + 1);
    }
  };
  
  return (
    <div className="page h-screen w-screen bg-black relative flex items-center justify-between px-4 overflow-hidden">
      <div className="reset absolute top-4 left-4 bg-white p-4 cursor-pointer rounded-xl" onClick={()=>{setMyLive(8) ,setOppoLive(8)}}>reset</div>
      {/* Bullets Section */}
      <div className={`bullets grid place-content-center backdrop-blur-sm absolute top-0 h-screen w-screen z-40 ${!showBullets && 'hidden'}`}>
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

      {/* Player Components */}
      <Players userSocket={socketId} lives={myLive} myTurn={myTurn} opp={false}/>

      {/* Gun in the Center */}
      <div className="gun-cont w-[40%] imgcont flex flex-col items-center justify-center text-white">
        <div className="timer text-3xl">{timer}</div>
        <img
          src="/gun.png"
          alt="Gun"
          className={`w-[35vw] object-cover opacity-80 pointer-events-none duration-300 ${gunPoint === 1 ? '-rotate-12' : gunPoint === 2 ? '-rotate-[160deg]' : ''}`}
        />
        <h2 className="text-2xl font1">Who would you shoot?</h2>
        <div className="choice flex gap-48 text-5xl uppercase mt-10 font1">
          <h2 className="cursor-pointer" onMouseEnter={() => setGunPoint(2)} onMouseLeave={() => setGunPoint(0)} onClick={() => fireGun(false)}>
            Suicide
          </h2>
          <h2 className="cursor-pointer" onMouseEnter={() => setGunPoint(1)} onMouseLeave={() => setGunPoint(0)} onClick={() => fireGun(true)}>
            Opponent
          </h2>
        </div>
      </div>

      {/* Right Player */}
      <Players userSocket={oppoId} lives={oppoLive} myTurn={!myTurn} opp={true}/>
    </div>
  );
};

export default Game;
