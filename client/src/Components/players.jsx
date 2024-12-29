import React, { useEffect, useState } from 'react';

const Players = ({ lives, myTurn, opp }) => {
  const [shake, setShake] = useState(false);
  const [previousLives, setPreviousLives] = useState(lives);

  // Trigger shake animation when lives change
  useEffect(() => {
    if (lives !== previousLives) {
      setShake(true);
      setTimeout(() => setShake(false), 500); // Reset shake after animation duration
    }
    setPreviousLives(lives);
  }, [lives, previousLives]);

  const healthPercentage = (lives / 10) * 100; // Assuming max lives is 10, adjust as needed.

  return (
    <div className="imgcont flex flex-col w-[30vw] items-center justify-center">
      <h2 className="text-white font1 text-3xl">{!opp ? 'You' : 'Opponent'}</h2>
      <img
        src={myTurn ? '/player/myTurn.jpg' : '/player/notTurn.jpg'}
        alt="Player"
        className={`object-contain w-[20vw] h-[50vh] transition-transform duration-300 ${
          opp ? 'scale-x-[-1]' : ''
        } ${shake ? 'animate-shake' : ''}`}
      />
      <div className="relative w-[60%] mt-2 h-8 bg-neutral-900 rounded-md overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-green-900 transition-width duration-300"
          style={{ width: `${healthPercentage}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
          {lives} / 10
        </div>
      </div>
    </div>
  );
};



export default Players;
