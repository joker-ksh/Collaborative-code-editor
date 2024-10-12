// src/comps/Auth.js
import { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { useAuth } from './AuthContext';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const Auth = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token);  // Automatically login after registration
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Box component="form" onSubmit={isRegistering ? handleRegister : handleLogin}>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
      />
    
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Button type="submit" variant="contained" color="primary">
        {isRegistering ? 'Register' : 'Login'}
      </Button>
      <Button 
        onClick={() => setIsRegistering(!isRegistering)} 
        color="secondary">
        {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
      </Button>
    </Box>
  );
};

export default Auth;
