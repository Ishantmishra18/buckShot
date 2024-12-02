import React from 'react'
import { RouterProvider, createBrowserRouter} from 'react-router-dom'
import Home from './Components/home'
import Game from './Components/game'

const App = () => {
  const router=createBrowserRouter([
    {
      path:'/',
      element:<Home/>
    },
    {
      path:'/game',
      element:<Game/>
    },
  ])
  
  return (
    <RouterProvider router={router}></RouterProvider>
  )
}

export default App