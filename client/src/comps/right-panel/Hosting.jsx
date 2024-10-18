import React, { useState } from 'react';
import { useTheme } from '@emotion/react';
import { Button, TextField } from '@mui/material';
import { useWebSocket } from '../../WebSocketContext';
import { useAuth } from '../../AuthContext';

export default function Hosting() {
  const theme = useTheme();
  const {ws} = useWebSocket();
  const { createRoom, joinRoom ,username} = useAuth();
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
      {/* Host button */}
      <Button
        variant="contained"
        color="primary"
        sx={{
          backgroundColor: theme.palette.primary.main,
        }}
        onClick={handleHost}
      >
        Host
      </Button>

      {/* Input field for joining a room */}
      <TextField
        label="Enter Room ID"
        variant="outlined"
        value={roomIdInput}
        onChange={(e) => setRoomIdInput(e.target.value)} // Update state on input change
        sx={{ marginLeft: 2, marginRight: 2 }} // Add some margin
      />

      {/* Join button */}
      <Button
        variant="contained"
        color="primary"
        sx={{
          backgroundColor: theme.palette.primary.main,
        }}
        onClick={handleJoin}
      >
        Join
      </Button>
    </div>
  );
}
