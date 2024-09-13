import React from "react";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid2 from '@mui/material/Grid2';
import Versions from "./comps/left-panel/Versions";
import Nav from "./comps/right-panel/top-nav/Nav";
import Main from "./comps/right-panel/main";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

export default function GridMain() {
  return (
    <Grid2 container>
      <Grid2 size={2.5}>
        <Versions />
      </Grid2>
      <Grid2 size={6}>
        <Item>size=6</Item>
      </Grid2>
      <Grid2 size="grow">
        <Main></Main>
      </Grid2>
    </Grid2>
  );
}
