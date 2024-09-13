import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Box, Button } from '@mui/material'
import Nav from './comps/right-panel/top-nav/Nav'
import Versions from './comps/left-panel/Versions'
import GridMain from './GridMain'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Box >
        <GridMain />
      </Box>
    </>
  )
}

export default App
