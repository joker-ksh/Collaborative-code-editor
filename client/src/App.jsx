import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Box, Button } from '@mui/material'
import Nav from './comps/right-panel/top-nav/Nav'
import Versions from './comps/left-panel/Versions'
import GridMain from './GridMain'
import { useAuth } from './AuthContext'
import Auth from './AuthPage'
import CollaborativeEditor from './CollaborativeEditor'

function App() {
  const {isAuthenticated , token } = useAuth()
  return (
    <>
      <Box >
        {isAuthenticated ? <GridMain/> : <Auth />}
        {/* <GridMain/> */}

      </Box>
    </>
  )
}

export default App
