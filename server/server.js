const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Y = require('yjs');
const utils = require('y-websocket/bin/utils');
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

// Yjs document store
const docs = new Map();

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

// WebSocket connection handler
wss.on('connection', (conn, req) => {
  const token = req.url.split('token=')[1];
    // get the path from the request url without the leading '/' without params
  const docName = req.url.split('?')[0].slice(1);
  if (!token) {
    conn.close(1008, 'Authentication failed');
    return;
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      conn.close(1008, 'Invalid token');
      return;
    }

    const username = decoded.username;
    // const docName = req.url.split('document=')[1];
    console.log('Connection established:', username, docName);
    
    let doc = docs.get(docName);
    if (!doc) {
      doc = new Y.Doc();
      const permissions = doc.getMap('permissions');
      permissions.set(username, { canRead: true, canWrite: true, canShare: true });
      docs.set(docName, doc);
    }

    // Check user permissions
    const permissions = doc.getMap('permissions');
    const userPermissions = permissions.get(username);
    
    if (!userPermissions || !userPermissions.canRead) {
      conn.close(1008, 'Permission denied');
      return;
    }

    utils.setupWSConnection(conn, req, { 
      docName,
      gc: true,
      permissions: userPermissions
    });
  });
});

// Create a new file
app.post('/create-file', authenticateToken, (req, res) => {
  const { fileName, content } = req.body;
  const userFolderPath = path.join(BASE_DIR, req.user.username);

  if (!fs.existsSync(userFolderPath)) {
    fs.mkdirSync(userFolderPath, { recursive: true });
  }

  const filePath = path.join(userFolderPath, fileName);

  if (fs.existsSync(filePath)) {
    return res.status(400).json({ message: 'File already exists' });
  }

  fs.writeFileSync(filePath, content || '', 'utf8');

  // Create Yjs document for the new file
  const doc = new Y.Doc();
  const ytext = doc.getText('monaco');
  ytext.insert(0, content || '');
  const permissions = doc.getMap('permissions');
  permissions.set(req.user.username, { canRead: true, canWrite: true, canShare: true });
  docs.set(fileName, doc);

  res.status(201).json({ message: 'File created successfully', file: { name: fileName, content } });
});

// Get list of files
app.get('/files', authenticateToken, (req, res) => {
  const userFolderPath = path.join(BASE_DIR, req.user.username);

  if (!fs.existsSync(userFolderPath)) {
    return res.json([]);
  }

  const files = fs.readdirSync(userFolderPath).map((fileName) => {
    return { name: fileName, path: path.join(userFolderPath, fileName) };
  });

  res.json(files);
});

// Get a specific file's content
app.get('/file/:fileName', authenticateToken, (req, res) => {
  const userFolderPath = path.join(BASE_DIR, req.user.username);
  const { fileName } = req.params;

  const filePath = path.join(userFolderPath, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  res.json({ content });
});

// Delete a file
app.delete('/file/:fileName', authenticateToken, (req, res) => {
  const userFolderPath = path.join(BASE_DIR, req.user.username);
  const { fileName } = req.params;

  const filePath = path.join(userFolderPath, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  fs.unlinkSync(filePath);
  
  // Remove Yjs document for the deleted file
  docs.delete(fileName);

  res.json({ message: 'File deleted successfully' });
});

// Update permissions
app.post('/update-permissions', authenticateToken, (req, res) => {
  const { docName, targetUser, newPermissions } = req.body;
  const doc = docs.get(docName);
  
  if (!doc) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const permissions = doc.getMap('permissions');
  const requesterPermissions = permissions.get(req.user.username);

  if (!requesterPermissions || !requesterPermissions.canShare) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  permissions.set(targetUser, newPermissions);
  
  res.json({ message: 'Permissions updated successfully' });
});

// Get permissions
app.get('/permissions/:docName', authenticateToken, (req, res) => {
  const { docName } = req.params;
  const doc = docs.get(docName);
  
  if (!doc) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const permissions = doc.getMap('permissions');
  res.json(Object.fromEntries(permissions));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});