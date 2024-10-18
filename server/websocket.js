const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const rooms = {"1234" : {clients: []}};

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'create_room') {
        const roomId = uuidv4();
        ws.send(JSON.stringify({ type: 'room_created', roomId }));
    }
    // Join room
    if (data.type === 'join_room') {
      const roomId = data.roomId;
      rooms[roomId] = rooms[roomId] || { clients: [] };
      rooms[roomId].clients.push(ws);
      console.log(rooms[roomId].clients.length);

    // Handle file updates
    } else if (data.type === 'file') {
      const room = rooms[ws.roomId];
      if (room) {
        room.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'file', payload: data.payload }));
          }
        });
      }
    }
  });

  ws.on('close', () => {
    // Clean up clients on disconnect
    Object.keys(rooms).forEach((roomId) => {
      rooms[roomId].clients = rooms[roomId].clients.filter((client) => client !== ws);
    });
  });
});
