import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';


export default function Slide() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
        sx={{
            '& .MuiButtonBase-root': {
              // Style the scroll buttons
              color: 'white', // Change the color of the scroll buttons
            }
        }}
      >
        <Tab label="Item One" />
        <Tab label="Item Two" />
        <Tab label="Item Three" />
        <Tab label="Item Four" />
        <Tab label="Item Five" />
        <Tab label="Item Six" />
        <Tab label="Item Seven" />
      </Tabs>
    </Box>
  );
}