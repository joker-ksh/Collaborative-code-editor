const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection , setPersistence } = require('y-websocket/bin/utils');



const wss = new WebSocket.Server({ port: 1234 });

wss.on('connection', (conn, req) => {
    const docName = req.url.slice(1); // Get the doc name from URL
    console.log(`Client connected to document: ${docName}`);
    

    setupWSConnection(conn, req, {
        docName,
        gc: true,


       
      
       
    });

    // set persistence
    setPersistence({
        bindState: async (docName, ydoc) => {
            console.log(`Binding state for document: ${docName}`);

            
        },
        writeState: async (docName, ydoc) => {
            console.log(`Writing state for document: ${docName}`);
        }
    });

    
    
});

console.log("WebSocket server running on ws://localhost:1234");
