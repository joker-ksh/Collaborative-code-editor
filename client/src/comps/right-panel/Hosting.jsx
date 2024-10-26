import React, { useState } from 'react';
import { useTheme } from '@emotion/react';
import { Button, Container, TextField ,Box  , Typography} from '@mui/material';
import { useWebSocket } from '../../WebSocketContext';
import { useAuth } from '../../AuthContext';

export default function Hosting() {
  const theme = useTheme();
  const {ws } = useWebSocket();
  const { createRoom, joinRoom ,username , roomId} = useAuth();
  const [roomIdInput, setRoomIdInput] = useState(''); // State for the room ID input
  console.log(username);
  const handleHost = () => {
    if (ws) {
      const roomid = createRoom();
      ws.send(JSON.stringify({ type: 'join', roomId: roomid , username }));
    }
  };

  const handleJoin = () => {
    if (ws && roomIdInput) {
      joinRoom(roomIdInput); // Use the joinRoom function from AuthContext
      ws.send(JSON.stringify({ type: 'join', roomId: roomIdInput , username}));
    }
  };

  return (
    <div>
     {/* container */}
     <Container>
  {/* TextField for Room ID */}
  <Box display="flex" justifyContent="center" mb={2}>
    <TextField
      label="Enter Room ID"
      variant="outlined"
      value={roomIdInput}
      onChange={(e) => setRoomIdInput(e.target.value)}
      sx={{ marginLeft: 2, marginRight: 2, width: '100%', maxWidth: 400 }}
    />
  </Box>

  {/* Buttons for Host and Join, centered on the next line */}
  <Box display="flex" justifyContent="center" gap={2}>
    <Button
      variant="contained"
      color="primary"
      sx={{
        backgroundColor: theme.palette.primary.main,
        width: '100px',
      }}
      onClick={handleHost}
    >
      Host
    </Button>

    <Button
      variant="contained"
      color="primary"
      sx={{
        backgroundColor: theme.palette.primary.main,
        width: '100px',
      }}
      onClick={handleJoin}
    >
      Join
    </Button>
  </Box>
  <Box display="flex" justifyContent="center" mb={2}>
    <Typography variant="h6" color="textPrimary">
     {roomId} {/* Display the roomId here */}
    </Typography>
  </Box>

</Container>


    </div>
  );
}
