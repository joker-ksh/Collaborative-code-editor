# Collaborative Code Editor

A real-time collaborative code editor built with Monaco Editor, Yjs, and a WebSocket server. This project enables multiple users to edit code simultaneously, offering a seamless and interactive coding experience.

[![Watch the video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://github.com/abdul2801/Collaborative-code-editor/blob/main/media-2024-10-29_17.29.05.mp4)


## Features

- **Multiple File Support**: Work with multiple files in a structured folder layout.
- **Yjs Connection**: Real-time collaboration across multiple files using Yjs.
- **Authentication**: Secure user authentication is implemented.
- **Room Creation**: Dynamic room creation for collaboration sessions.

## Todo List
- [x] Multiple files
- [x] Yjs connection for multiple files
- [x] Authentication done
- [x] Room creation
- [ ] Saving files to the server after all clients leave the Yjs instance
- [ ] Running code in a container
- [ ] Support for WebRTC
- [ ] Add other features or tasks needed here

## Getting Started

### Prerequisites

- Node.js
- Yarn or npm

### Installation

-  ```bash
    cd server/
    node server.js
    node websocket.js
- ```bash
    cd client/
    npm run dev

