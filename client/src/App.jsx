import './App.css'
import { Box, Button } from '@mui/material'
import GridMain from './GridMain'
import { useAuth } from './AuthContext'
import Auth from './AuthPage'

function App() {
  const {isAuthenticated , token } = useAuth()
  return (
    <>
      <Box >
        {isAuthenticated ? <GridMain/> : <Auth />}
      </Box>
    </>
  )
}

export default App
