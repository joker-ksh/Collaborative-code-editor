import React from "react";
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import TerminalIcon from '@mui/icons-material/Terminal';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';

export default function Nav({ value, setValue }) {

  return (
    <BottomNavigation
      showLabels
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
    >
      <BottomNavigationAction label="Console" icon={<TerminalIcon />} />
      <BottomNavigationAction label="Instructions" icon={<HelpCenterIcon />} />
    </BottomNavigation>
  );
}
