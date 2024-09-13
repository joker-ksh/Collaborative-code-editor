import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'; // Icon for files
import FolderIcon from '@mui/icons-material/Folder'; // Icon for folders
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';

export default function File() {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List
      sx={{ width: '100%', bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader" sx={{ color: 'white' }}>
          File List
        </ListSubheader>
      }
    >
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <FolderIcon   sx={{ color: 'white' }} /> {/* Represents a folder */}
        </ListItemIcon>
        <ListItemText primary="Documents"  sx={{ color: 'white' }} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <InsertDriveFileIcon /> {/* Represents a file */}
            </ListItemIcon>
            <ListItemText primary="File 1.txt" sx={{ color: 'white' }} />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <InsertDriveFileIcon /> {/* Represents a file */}
            </ListItemIcon>
            <ListItemText primary="File 2.docx" sx={{ color: 'white' }} />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <InsertDriveFileIcon /> {/* Represents a file */}
            </ListItemIcon>
            <ListItemText primary="File 3.pdf" sx={{ color: 'white' }} />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
}
