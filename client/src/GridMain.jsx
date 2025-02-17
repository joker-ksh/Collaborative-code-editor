import React, { useEffect } from "react";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid2 from '@mui/material/Grid2';
import Versions from "./comps/left-panel/Versions";
import Nav from "./comps/right-panel/top-nav/Nav";
import Main from "./comps/right-panel/main";
import NavTop from "./comps/editor-panel/nav-top/NavTop";
import Core from "./comps/editor-panel/core/Core";
import Bottom from "./comps/editor-panel/bottom-nav/Bottom";
import { useWebSocket } from "./WebSocketContext";
import { useAuth } from "./AuthContext";
// const Item = styled(Paper)(({ theme }) => ({
//   backgroundColor: '#fff',
//   ...theme.typography.body2,
//   padding: theme.spacing(1),
//   textAlign: 'center',
//   color: theme.palette.text.secondary,
//   ...theme.applyStyles('dark', {
//     backgroundColor: '#1A2027',
//   }),
// }));




export default function GridMain() {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const {roomId} = useAuth();
  function handleFileSelect(e){
    setSelectedFile(e.name)
  }

  return (
    <Grid2 container
    sx={{
      padding: '20px',
    }}
    >
      <Grid2 size={2.5}>
        <Versions handleFileSelect={handleFileSelect}/>
      </Grid2>
      <Grid2 size={6}>
        <NavTop />
        {selectedFile && (<Core  roomId={roomId}  selectedFile={selectedFile}/>)}
      </Grid2>
      <Grid2 size="grow">
        <Main></Main>
      </Grid2>
    </Grid2>
  );
}
