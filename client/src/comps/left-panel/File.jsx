import * as React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"; // Icon for files
import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { Box, Button, TextField } from "@mui/material";
import { useWebSocket } from "../../WebSocketContext";

const apiUrl = import.meta.env.VITE_SERVER_URL;

export default function File({handleFileSelect}) {
  const [fileList, setFileList] = useState([]); // Updated to hold the list of files
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFileName, setNewFileName] = useState(""); // State to store new file name
  const { token } = useAuth();
  const {files} = useWebSocket();
  useEffect(() => {
    if (files) {
      setFileList(files);
      setLoading(false);
      
    }
  }, [files]);
  // Function to fetch the file structure
  console.log(fileList); 
  const fetchFileStructure = async () => {
    try {
      const response = await fetch(apiUrl + "/files", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch file structure");
      }

      const data = await response.json();
      setFileList(data); // Set the list of files here
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchFileStructure();
  // }, [token]);

  // Handle file creation
  const handleCreateFile = async () => {
    if (!newFileName.trim()) return; // Do not create if name is empty

    try {
      const response = await fetch(apiUrl + "/create-file", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: newFileName }), // Pass the new file name in the request body
      });

      if (!response.ok) {
        throw new Error("Failed to create file");
      }

      // Clear the input field and refetch files after successful creation
      setNewFileName("");
      fetchFileStructure(); // Refetch file structure to get updated list
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <List
        sx={{ bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* ListSubheader */}
            <ListSubheader component="div" id="nested-list-subheader">
              Files
            </ListSubheader>

            {/* Add File Button */}
            <Button variant="contained" color="primary" sx={{ margin: '10px' }} onClick={handleCreateFile}>
              Add File
            </Button>
          </Box>
        }
      >
        {/* TextField to take the new file name */}
        <Box sx={{ margin: '10px 0' }}>
          <TextField
            label="New File Name"
            variant="outlined"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            sx={{ marginBottom: '10px' }}
          />
        </Box>

        {/* List of files */}
        {fileList.map((file, index) => (
          <ListItemButton key={index} onClick={() => handleFileSelect(file)}>
            <ListItemIcon>
              <InsertDriveFileIcon sx={{ color: "white" }} /> {/* File Icon */}
            </ListItemIcon>
            <ListItemText  primary={file.name} sx={{ color: "white" }} />
          </ListItemButton>
        ))}
      </List>
    </>
  );
}
