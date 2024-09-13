import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from '@mui/material'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Button variant="contained" onClick={() => setCount((count) => count + 1)}>
        count is: {count}
      </Button>
    </>
  )
}

export default App
