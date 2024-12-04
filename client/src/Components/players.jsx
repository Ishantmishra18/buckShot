import React from 'react'

const players = ({userSocket , lives}) => {
  

  let userLives = lives
  return (
    <div className="imgcont flex flex-col w-[30vw] items-center justify-center">
    <h2 className="text-white font1 text-3xl">I{userSocket}</h2>
    <img src="/player/default.png" alt="Player Left" className="object-contain w-[20vw]" />
    <div className="healthbar flex gap-2">
    {Array.from({ length: userLives }).map((_, index) => (
        <div className="h-6 w-2 bg-green-700 rounded-md"></div>
      ))}
    </div>
  </div>

  )
}

export default players