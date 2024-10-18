import { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import {jwtDecode} from 'jwt-decode';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [roomId, setRoomId] = useState(null); // State for room ID
  const [username, setUsername] = useState(null); // State for username
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setToken(token);
      const decoded = jwtDecode(token);
      console.log(decoded);
      setUsername(decoded.username);
    }
  }, []);

  const login = (receivedToken) => {
    setIsAuthenticated(true);
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken);

    // Decode the token to get the username
    
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Function to create a new room ID
  const createRoom = () => {
    const newRoomId = uuidv4(); // Generate a new UUID
    setRoomId(newRoomId); // Set the generated room ID
    return newRoomId; // Return it if needed
  };

  const joinRoom = (id) => {
    setRoomId(id); // Set the provided room ID
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token, roomId, createRoom, joinRoom , username }}>
      {children}
    </AuthContext.Provider>
  );
};
