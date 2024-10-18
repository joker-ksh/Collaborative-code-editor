import Editor from '@monaco-editor/react';
import blackboardTheme from 'monaco-themes/themes/Blackboard.json'; 
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios'; 

// env
const apiUrl = import.meta.env.VITE_SERVER_URL;

export default function Core({ roomId, selectedFile }) {
  const ydoc = useMemo(() => new Y.Doc(), []); 
  const [editor, setEditor] = useState(null);
  const [provider, setProvider] = useState(null);
  const [binding, setBinding] = useState(null);

  function handleEditorMount(_, editor) {
    setEditor(_);
    editor.editor.defineTheme('blackboard', blackboardTheme);
    editor.editor.setTheme('blackboard'); 
  }

  const fetchFileContent = async () => {
    try {
      const response = await axios.post(`${apiUrl}/file/${selectedFile}`, {
        roomId: roomId  
      });
      
      // Set the Yjs text with the fetched file content
      if(ydoc.getText('monaco').length == 0) {
        ydoc.getText('monaco').insert(0, response.data.content);
      }
        
      
    } catch (error) {
      console.error("Error fetching file content:", error);
      // You might want to set some default text in the Yjs document
      ydoc.getText('monaco').insert(0, '// Error loading file');
    }
  };

  useEffect(() => {
    const room_id = `${roomId}-${selectedFile}`;
    const websocketProvider = new WebsocketProvider(`ws://localhost:1234`, room_id, ydoc);
    setProvider(websocketProvider);

    websocketProvider.on('status', async ({ status }) => {
      if (status === 'connected') {
        const otherClients = websocketProvider.awareness.getStates().size;
        console.log(`Connected to ${otherClients} other clients`);
        if (otherClients === 1) {
          await fetchFileContent(); 
        }
      }
    });

    return () => {
      if (websocketProvider.wsconnected) {
        websocketProvider.disconnect();
      }
      ydoc.destroy();
    };
  }, [roomId, selectedFile, ydoc]);

  useEffect(() => {
    if (provider === null || editor === null) return;

    const monacoBinding = new MonacoBinding(
      ydoc.getText('monaco'),
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
    setBinding(monacoBinding);

    return () => {
      monacoBinding.destroy();
    };
  }, [provider, editor, ydoc]);

  return (
    <div style={{ flexGrow: 1 }}>
      <Editor  
        height="94.52vh" 
        defaultLanguage="javascript" 
        onMount={handleEditorMount} 
        options={{
          minimap: { enabled: true },
          scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          fontSize: 18,
          fontWeight: 'bold',
          wordWrap: 'on',
          fontFamily: 'MonoLisa, Menlo, Monaco, Courier New , monospace'
        }}
      />
    </div>
  );
}
