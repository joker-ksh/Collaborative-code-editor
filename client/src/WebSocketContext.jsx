import React, { createContext, useEffect, useState, useContext } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [files, setFiles] = useState([]); // State to store the list of files
  const [messageType, setMessageType] = useState(''); // Track the latest message type for debugging or logic
  

  useEffect(() => {
    const webSocket = new WebSocket('ws://localhost:3000'); // Replace with your WebSocket server URL

    webSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);

      // Process the message based on its type
      switch (data.type) {
        case 'file_list':
          console.log('List of files received:', data.files);
          setFiles(data.files); // Update the file list
          break;
        case 'create_file':
          console.log(`File created: ${data.payload.name}`);
          
          setFiles((prevFiles) => [...prevFiles, {name : data.payload.name}]); // Add the new file to the list
          console.log(files);
          break;
        case 'delete_file':
          console.log(`File deleted: ${data.payload.name}`);
          setFiles((prevFiles) => prevFiles.filter((file) => file.name !== data.payload.name)); // Remove the file from the list
          break;
        default:
          console.error(`Unknown message type: ${data.type}`);
          break;
      }

      // Track the message type for any additional logic
      setMessageType(data.type);
    };

    webSocket.onclose = () => {
      console.log('WebSocket connection closed');
      setWs(null); // Set to null when closed
    };

    webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(webSocket);

    return () => {
      webSocket.close(); // Clean up the WebSocket connection on unmount
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws, files, messageType }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use WebSocket context
export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
