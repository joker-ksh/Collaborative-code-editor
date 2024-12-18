const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;
const SECRET_KEY = 'your_secret_key';
const USERS_FILE = './users.json';
const BASE_DIR = './codes';

app.use(bodyParser.json());
app.use(cors());

let rooms = {}; // Store rooms and their associated clients

// Get users from the file
const getUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
};

// Save users to the file
const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);
  saveUsers(users);

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, SECRET_KEY, {
    expiresIn: '5h',
  });

  res.json({ message: 'User registered successfully', token });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: '5h',
  });

  res.json({ token });
});

// Token authentication middleware
const authenticateToken = (req, res, next) => {
  let token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  token = token.split(' ')[1];

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

wss.on('connection', (ws, req) => {
  console.log('New client connected');

  // Handle messages from clients
  ws.on('message', async (message) => {
    const msg = JSON.parse(message);
    console.log(msg);

    if (msg.type === 'join') {
      const roomId = msg.roomId;
      const username = msg.username; // Assuming the message contains the username

      if (!rooms[roomId]) {
        rooms[roomId] = { clients: [], host: null };
      }

      // If no host is present, the joining client becomes the host
      if (!rooms[roomId].host) {
        rooms[roomId].host = username;
        const hostFiles =  get_user_files(username);
        ws.roomId = roomId; // Store the room ID in the WebSocket instance
        ws.username = username; // Store the username in the WebSocket instance
        rooms[roomId].clients.push(ws);
        broadcastToRoom(roomId, { type: 'file_list', files: hostFiles });
  
        // Fetch the files for the host and broadcast them to all clients
      } else {
        // If the room already has a host, fetch the host's files for the new client only
        const hostUsername = rooms[roomId].host;
        const hostFiles = get_user_files(hostUsername);
        
        // Send the file list only to the new client
        ws.send(JSON.stringify({ type: 'file_list', files: hostFiles }));
        ws.roomId = roomId; // Store the room ID in the WebSocket instance
        ws.username = username; // Store the username in the WebSocket instance
        rooms[roomId].clients.push(ws);
      }

      // Add the new client to the room
      
     

      console.log(`Client ${username} joined room ${roomId}`);
    }

    // Handle file actions (like edits or updates)
    else if (msg.type === 'file_action') {
      const roomId = ws.roomId;
      if (rooms[roomId]) {
        broadcastToRoom(roomId, { type: 'file_action', payload: msg.payload });
      }
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    const roomId = ws.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].clients = rooms[roomId].clients.filter(client => client !== ws);
      if (rooms[roomId].clients.length === 0) {
        delete rooms[roomId]; // Remove the room if empty
      }
    }
  });
});


// Function to broadcast messages to all clients in a specific room
const broadcastToRoom = (roomId, message) => {
  console.log(rooms[roomId] , message)
  if (rooms[roomId]) {
    rooms[roomId].clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
};

// Create a new file
app.post('/create-file', authenticateToken, (req, res) => {
  const { fileName, content, roomId } = req.body;
  // const userFolderPath = path.join(BASE_DIR, req.user.username);
  const userFolderPath = path.join(BASE_DIR, rooms[roomId].host);
  console.log(userFolderPath)

  if (!fs.existsSync(userFolderPath)) {
    fs.mkdirSync(userFolderPath, { recursive: true });
  }

  const filePath = path.join(userFolderPath, fileName);

  if (fs.existsSync(filePath)) {
    return res.status(400).json({ message: 'File already exists' });
  }

  fs.writeFileSync(filePath, content || '', 'utf8');

  // Broadcast file creation to all connected clients in the room
  broadcastToRoom(roomId, { type: 'create_file', payload: {name :  fileName } });

  res.status(201).json({ message: 'File created successfully', file: { name: fileName, content } });
});
// delete a file
app.delete('/delete-file', authenticateToken, (req, res) => {
  const { fileName, roomId } = req.body;
  const userFolderPath = path.join(BASE_DIR, rooms[roomId].host);
  console.log(fileName,"delete")
  const filePath = path.join(userFolderPath, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  fs.unlinkSync(filePath);
  
  // Broadcast file deletion to all connected clients in the room
  broadcastToRoom(roomId, { type: 'delete_file', payload: {name : fileName } });

  res.json({ message: 'File deleted successfully' });
});

// Get list of files
app.get('/files', authenticateToken, (req, res) => {
  const userFolderPath = path.join(BASE_DIR, req.user.username);
  const files = getFiles(userFolderPath); 
  

  res.json(files);
});
function get_user_files(username){
  const userFolderPath = path.join(BASE_DIR, username);
  const files = getFiles(userFolderPath); 
  return files;
}

function getFiles(userFolderPath) {
  if (!fs.existsSync(userFolderPath)) {
    return [];
  }

  const files = fs.readdirSync(userFolderPath).map((fileName) => {
    return { name: fileName, path: path.join(userFolderPath, fileName) };
  });
  return files
}
function checkSameRoom(req,res,next){
  // set the hostname from the rooms object and catch the error if the room is not found
  try{
    req.curhost = rooms[req.body.roomId].host;
    next();
  }
  catch(err){
    res.status(400).json({ message: 'Room not found' });
  }
  

}

// Get a specific file's content
app.post('/file/:fileName', checkSameRoom, (req, res) => {
  const userFolderPath = path.join(BASE_DIR, req.curhost);
  const { fileName } = req.params;

  const filePath = path.join(userFolderPath, fileName);
  console.log(filePath)
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  res.json({ content });
});

// Delete a file
app.delete('/file/:fileName', authenticateToken, (req, res) => {
  const userFolderPath = path.join(BASE_DIR, req.user.username);
  const { fileName, roomId } = req.body; // Assuming roomId is sent in the body

  const filePath = path.join(userFolderPath, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  fs.unlinkSync(filePath);
  
  // Broadcast file deletion to all connected clients in the room
  broadcastToRoom(roomId, { type: 'file_deleted', payload: { fileName, user: req.user.username } });

  res.json({ message: 'File deleted successfully' });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
