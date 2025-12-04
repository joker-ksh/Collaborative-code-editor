# Server Documentation

This documentation covers two separate servers that work together to provide collaborative code editing functionality.

---

# Part 1: server.js - Main Express Server (Port 3000)

## Overview

The main server is built with Express.js and handles user authentication, file management, and real-time room-based collaboration using WebSockets. It provides REST API endpoints for user operations and file CRUD operations.

## Dependencies

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
```

## Configuration

```javascript
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';
const USERS_FILE = './users.json';
const BASE_DIR = './codes';
```

- **PORT**: Server runs on port 3000
- **SECRET_KEY**: Used for JWT token generation (should be changed in production)
- **USERS_FILE**: JSON file storing user credentials
- **BASE_DIR**: Root directory for user code files

## Middleware

```javascript
app.use(bodyParser.json());
app.use(cors());
```

- **bodyParser.json()**: Parses incoming JSON requests
- **cors()**: Enables Cross-Origin Resource Sharing

## Data Structures

### Rooms Object
```javascript
let rooms = {}; // Store rooms and their associated clients
```

Structure:
```javascript
rooms = {
  "roomId": {
    clients: [ws1, ws2, ws3...],
    host: "username"
  }
}
```

## User Management

### Helper Functions

#### getUsers()
```javascript
const getUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
};
```
- Reads users from `users.json` file
- Returns empty array if file doesn't exist

#### saveUsers(users)
```javascript
const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};
```
- Saves user array to `users.json` file
- Pretty-prints JSON with 2-space indentation

## REST API Endpoints

### 1. Register User

**Endpoint**: `POST /register`

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token"
}
```

**Process**:
1. Checks if username already exists
2. Hashes password using bcrypt (10 salt rounds)
3. Creates new user with auto-incremented ID
4. Generates JWT token (expires in 5 hours)
5. Returns token for immediate login

**Error Responses**:
- `400`: Username already exists

---

### 2. Login User

**Endpoint**: `POST /login`

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "token": "jwt_token"
}
```

**Process**:
1. Finds user by username
2. Compares password with hashed password
3. Generates JWT token (expires in 5 hours)
4. Returns token

**Error Responses**:
- `400`: Invalid credentials (username not found or wrong password)

---

### 3. Create File

**Endpoint**: `POST /create-file`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "fileName": "string",
  "content": "string",
  "roomId": "string"
}
```

**Response**:
```json
{
  "message": "File created successfully",
  "file": {
    "name": "fileName",
    "content": "fileContent"
  }
}
```

**Process**:
1. Gets room host username from `rooms[roomId].host`
2. Creates user folder if it doesn't exist
3. Checks if file already exists
4. Creates file with given content (empty string if no content)
5. Broadcasts file creation to all clients in the room

**Error Responses**:
- `400`: File already exists
- `401`: Access denied (no token)
- `403`: Invalid token

**WebSocket Broadcast**:
```json
{
  "type": "create_file",
  "payload": {
    "name": "fileName"
  }
}
```

---

### 4. Delete File

**Endpoint**: `DELETE /delete-file`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "fileName": "string",
  "roomId": "string"
}
```

**Response**:
```json
{
  "message": "File deleted successfully"
}
```

**Process**:
1. Gets room host username
2. Checks if file exists
3. Deletes file from filesystem
4. Broadcasts deletion to all clients in the room

**Error Responses**:
- `404`: File not found
- `401`: Access denied
- `403`: Invalid token

**WebSocket Broadcast**:
```json
{
  "type": "delete_file",
  "payload": {
    "name": "fileName"
  }
}
```

---

### 5. Get File List

**Endpoint**: `GET /files`

**Authentication**: Required (Bearer token)

**Response**:
```json
[
  {
    "name": "fileName",
    "path": "/full/path/to/file"
  }
]
```

**Process**:
1. Gets authenticated user's folder path
2. Returns list of all files in the folder
3. Returns empty array if folder doesn't exist

---

### 6. Get File Content

**Endpoint**: `POST /file/:fileName`

**Authentication**: Not required (uses room-based check)

**Request Body**:
```json
{
  "roomId": "string"
}
```

**Response**:
```json
{
  "content": "file content as string"
}
```

**Process**:
1. Validates room exists via `checkSameRoom` middleware
2. Gets host's file path
3. Reads and returns file content

**Error Responses**:
- `400`: Room not found
- `404`: File not found

---

### 7. Delete File (Alternative)

**Endpoint**: `DELETE /file/:fileName`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "fileName": "string",
  "roomId": "string"
}
```

**Response**:
```json
{
  "message": "File deleted successfully"
}
```

**Process**:
1. Deletes file from authenticated user's folder
2. Broadcasts deletion to room clients

**WebSocket Broadcast**:
```json
{
  "type": "file_deleted",
  "payload": {
    "fileName": "string",
    "user": "username"
  }
}
```

## Middleware Functions

### authenticateToken
```javascript
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
```

**Purpose**: Validates JWT token from Authorization header

**Process**:
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token using SECRET_KEY
3. Attaches decoded user data to `req.user`

**Error Responses**:
- `401`: No token provided
- `403`: Invalid or expired token

---

### checkSameRoom
```javascript
function checkSameRoom(req, res, next) {
  try {
    req.curhost = rooms[req.body.roomId].host;
    next();
  } catch(err) {
    res.status(400).json({ message: 'Room not found' });
  }
}
```

**Purpose**: Validates room exists and sets current host

**Process**:
1. Attempts to get host from room
2. Sets `req.curhost` for use in route handler
3. Catches error if room doesn't exist

## Helper Functions

### get_user_files(username)
```javascript
function get_user_files(username) {
  const userFolderPath = path.join(BASE_DIR, username);
  const files = getFiles(userFolderPath); 
  return files;
}
```

**Purpose**: Gets all files for a specific user

**Returns**: Array of file objects with `name` and `path`

---

### getFiles(userFolderPath)
```javascript
function getFiles(userFolderPath) {
  if (!fs.existsSync(userFolderPath)) {
    return [];
  }

  const files = fs.readdirSync(userFolderPath).map((fileName) => {
    return { name: fileName, path: path.join(userFolderPath, fileName) };
  });
  return files;
}
```

**Purpose**: Reads directory and returns file list

**Returns**: Array of objects with file names and full paths

## WebSocket Implementation

### Connection Handler
```javascript
wss.on('connection', (ws, req) => {
  console.log('New client connected');
  
  ws.on('message', async (message) => {
    const msg = JSON.parse(message);
    // Handle different message types
  });

  ws.on('close', () => {
    // Handle client disconnect
  });
});
```

### Message Types

#### 1. Join Room
**Client Sends**:
```json
{
  "type": "join",
  "roomId": "string",
  "username": "string"
}
```

**Process**:
1. Creates room if it doesn't exist
2. If no host exists, first user becomes host
3. Host's files are fetched and broadcast to all clients
4. New clients receive existing host's file list
5. Client is added to room's client array
6. `ws.roomId` and `ws.username` are stored on connection

**Server Broadcasts** (to all in room):
```json
{
  "type": "file_list",
  "files": [...]
}
```

**Or sends to new client only**:
```json
{
  "type": "file_list",
  "files": [...]
}
```

---

#### 2. File Action
**Client Sends**:
```json
{
  "type": "file_action",
  "payload": {...}
}
```

**Process**:
1. Broadcasts payload to all clients in the same room

**Server Broadcasts**:
```json
{
  "type": "file_action",
  "payload": {...}
}
```

### Disconnect Handling
```javascript
ws.on('close', () => {
  console.log('Client disconnected');
  const roomId = ws.roomId;
  if (roomId && rooms[roomId]) {
    rooms[roomId].clients = rooms[roomId].clients.filter(client => client !== ws);
    if (rooms[roomId].clients.length === 0) {
      delete rooms[roomId];
    }
  }
});
```

**Process**:
1. Removes disconnected client from room's client array
2. Deletes room if no clients remain

### Broadcasting Function
```javascript
const broadcastToRoom = (roomId, message) => {
  if (rooms[roomId]) {
    rooms[roomId].clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
};
```

**Purpose**: Sends message to all connected clients in a specific room

**Parameters**:
- `roomId`: Room identifier
- `message`: Object to be JSON stringified and sent

---

# Part 2: websocket.js - Y.js WebSocket Server (Port 1234)

## Overview

This is a dedicated Y.js WebSocket server for real-time collaborative document editing. It uses Conflict-free Replicated Data Types (CRDTs) to enable multiple users to edit the same document simultaneously without conflicts.

## Dependencies

```javascript
const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils');
```

- **ws**: WebSocket library
- **yjs**: CRDT framework for conflict-free collaboration
- **y-websocket**: Y.js WebSocket provider utilities

## Server Configuration

```javascript
const wss = new WebSocket.Server({ port: 1234 });
```

- **Port**: 1234
- **URL**: `ws://localhost:1234`

## Connection Handler

```javascript
wss.on('connection', (conn, req) => {
    const docName = req.url.slice(1);
    console.log(`Client connected to document: ${docName}`);
    
    setupWSConnection(conn, req, {
        docName,
        gc: true,
    });

    setPersistence({
        bindState: async (docName, ydoc) => {
            console.log(`Binding state for document: ${docName}`);
        },
        writeState: async (docName, ydoc) => {
            console.log(`Writing state for document: ${docName}`);
        }
    });
});
```

## Document Name Extraction

```javascript
const docName = req.url.slice(1);
```

**How it works**:
- Client connects to: `ws://localhost:1234/document-name`
- `req.url` = `/document-name`
- `docName` = `document-name` (after slicing first character)

**Example**:
- URL: `ws://localhost:1234/my-code-file.js`
- Document name: `my-code-file.js`

## Y.js Connection Setup

```javascript
setupWSConnection(conn, req, {
    docName,
    gc: true,
});
```

**Parameters**:
- **conn**: WebSocket connection
- **req**: HTTP request object
- **options**:
  - `docName`: Unique document identifier
  - `gc`: Garbage collection enabled

**What it does**:
1. Initializes Y.js document for the given `docName`
2. Synchronizes document state between client and server
3. Manages updates and broadcasts to all clients on same document
4. Enables garbage collection to free up memory

## Persistence Configuration

```javascript
setPersistence({
    bindState: async (docName, ydoc) => {
        console.log(`Binding state for document: ${docName}`);
    },
    writeState: async (docName, ydoc) => {
        console.log(`Writing state for document: ${docName}`);
    }
});
```

### bindState(docName, ydoc)

**Purpose**: Load existing document state from storage

**Parameters**:
- `docName`: Document identifier
- `ydoc`: Y.js document instance

**When called**: When a document is first accessed

**Current Implementation**: Only logs (no actual loading)

**To Implement**:
```javascript
bindState: async (docName, ydoc) => {
    const savedState = await database.getDocument(docName);
    if (savedState) {
        Y.applyUpdate(ydoc, savedState);
    }
}
```

---

### writeState(docName, ydoc)

**Purpose**: Save document state to persistent storage

**Parameters**:
- `docName`: Document identifier
- `ydoc`: Y.js document instance

**When called**: When document is modified

**Current Implementation**: Only logs (no actual saving)

**To Implement**:
```javascript
writeState: async (docName, ydoc) => {
    const state = Y.encodeStateAsUpdate(ydoc);
    await database.saveDocument(docName, state);
}
```

## How Y.js Works

### CRDT (Conflict-free Replicated Data Type)

Y.js uses CRDTs to ensure that:
1. Multiple users can edit simultaneously
2. All changes are merged automatically
3. No conflicts occur (last-write-wins is not needed)
4. Eventually all clients reach the same state

### Document Synchronization

1. **Client connects** to `ws://localhost:1234/document-name`
2. **Server creates/retrieves** Y.js document for that name
3. **Initial sync**: Server sends current document state to client
4. **Client makes changes**: Updates are sent to server
5. **Server broadcasts**: Changes sent to all other clients on same document
6. **CRDT magic**: Changes are merged automatically without conflicts

### Multi-User Collaboration

```
Client A ─┐
          ├──> Y.js Server (document-name) ──> Sync
Client B ─┤                                      ↓
          └─────────────────────────────────> Client C
```

All clients connected to the same `docName` see the same document state in real-time.

## Client-Side Usage Example

```javascript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Create a Y.js document
const doc = new Y.Doc();

// Connect to Y.js WebSocket server
const provider = new WebsocketProvider(
  'ws://localhost:1234',     // Server URL
  'my-document',              // Document name
  doc                         // Y.js document
);

// Use shared types
const yText = doc.getText('content');
yText.insert(0, 'Hello, World!');

// All connected clients will see this change automatically
```

## Integration Between Both Servers

### Server Responsibilities

**Main Server (Port 3000)**:
- User authentication (register/login)
- File management (create/delete files)
- Room management (host assignment, client tracking)
- File metadata and permissions
- WebSocket for room events and file list updates

**Y.js Server (Port 1234)**:
- Real-time collaborative document editing
- CRDT-based conflict resolution
- Document state synchronization
- Character-by-character live updates

### Typical Workflow

1. **User logs in** via Main Server (port 3000)
2. **User creates/joins room** via WebSocket on Main Server
3. **User selects file** from host's file list
4. **Main Server sends file content** via REST API
5. **Client connects to Y.js Server** (port 1234) with document name
6. **User edits in real-time** via Y.js
7. **Changes sync automatically** to all users editing the same file
8. **User saves file** by calling Main Server API

## Current Limitations

### Main Server (Port 3000)
1. **No persistence for WebSocket state**: Rooms are lost on server restart
2. **No file versioning**: No history of file changes
3. **No permission system**: All room members have equal access
4. **No rate limiting**: APIs can be abused
5. **Weak security**: SECRET_KEY is hardcoded

### Y.js Server (Port 1234)
1. **No persistence**: Document state is lost when all clients disconnect
2. **No authentication**: Anyone can connect to any document
3. **No authorization**: No access control for documents
4. **No room integration**: Doesn't check if user is in the room
5. **No cleanup**: Documents stay in memory indefinitely

## Security Recommendations

### Main Server
- [ ] Use environment variables for SECRET_KEY
- [ ] Add rate limiting on authentication endpoints
- [ ] Implement proper error handling and logging
- [ ] Add input validation on all endpoints
- [ ] Use HTTPS in production
- [ ] Implement refresh tokens
- [ ] Add password strength requirements
- [ ] Store sessions in Redis instead of memory

### Y.js Server
- [ ] Add JWT authentication on WebSocket connection
- [ ] Verify user has access to the document/room
- [ ] Implement rate limiting per IP/user
- [ ] Add document access control lists
- [ ] Sanitize document names
- [ ] Add connection timeouts
- [ ] Implement document cleanup for inactive documents

## Potential Improvements

### Main Server
1. Implement Redis for room state persistence
2. Add database (PostgreSQL/MongoDB) for user and file data
3. Add file versioning and history
4. Implement role-based permissions (host, editor, viewer)
5. Add WebRTC for voice/video chat
6. Implement file upload/download
7. Add syntax highlighting metadata storage

### Y.js Server
1. Implement actual persistence (database storage)
2. Add authentication middleware
3. Integrate with Main Server's room system
4. Add compression for better performance
5. Implement document expiry and cleanup
6. Add awareness protocol for cursor positions
7. Add metrics and monitoring

## Console Outputs

### Main Server
```
Server running on http://localhost:3000
New client connected
Login attempt: username
Client username joined room roomId
Client disconnected
```

### Y.js Server
```
WebSocket server running on ws://localhost:1234
Client connected to document: document-name
Binding state for document: document-name
Writing state for document: document-name
```

## Environment Setup

### Required Files/Folders
- `./users.json` - Stores user credentials
- `./codes/` - Base directory for user files
- `./codes/[username]/` - Individual user folders

### Installation
```bash
npm install express ws yjs y-websocket jsonwebtoken bcryptjs body-parser cors
```

### Running the Servers
```bash
# Terminal 1 - Main Server
node server.js

# Terminal 2 - Y.js Server
node websocket.js
```

Both servers must be running for full functionality.