import Editor from '@monaco-editor/react';
import blackboardTheme from 'monaco-themes/themes/Blackboard.json'; 
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';  

// env
const apiUrl = import.meta.env.VITE_SERVER_URL;

export default function Core({ roomId, selectedFile }) {
  const [ydoc,setYdoc] = useState(new Y.Doc()); 
  const [editor, setEditor] = useState(null);
  const [provider, setProvider] = useState(null);
  const [binding, setBinding] = useState(null);
  const initialFetchDone = useRef(false);

  function handleEditorMount(_, editor) {
    setEditor(_);
    editor.editor.defineTheme('blackboard', blackboardTheme);
    editor.editor.setTheme('blackboard'); 
  }
  useEffect(() => {
    setYdoc(new Y.Doc());
  }, [roomId, selectedFile]);

  const getConnectedClients = (provider) => {
    if (!provider) return 0;
    // Filter out our own client ID
    const states = Array.from(provider.awareness.getStates().values());
    return states.length;
  };

  const fetchFileContent = async (websocketProvider) => {
    try {
      const monacoText = ydoc.getText('monaco');
      const connectedClients = getConnectedClients(websocketProvider);
      
      // If there are no clients connected, fetch from the server
      if (monacoText.toString().length === 0 && connectedClients <= 1) {
        console.log('No content and no other clients, fetching from server...');
        const response = await axios.post(`${apiUrl}/file/${selectedFile}`, {
          roomId: roomId
        });
  
        ydoc.transact(() => {
          monacoText.insert(0, response.data.content);
        });
      } else if (connectedClients > 1) {
        console.log('Other clients connected, synchronizing content.');
        // insertt

      } else {
        console.log('Content present, skipping fetch.');
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
      if (ydoc.getText('monaco').toString().length === 0) {
        ydoc.transact(() => {
          ydoc.getText('monaco').insert(0, '// Error loading file');
        });
      }
    }
  };
     
  useEffect(() => {
    // Disconnect and reset the previous provider if any
    if (provider) {
      provider.disconnect();
      setProvider(null);
      setBinding(null);
      ydoc.getText('monaco').delete(0, ydoc.getText('monaco').length);
      initialFetchDone.current = false;
    }
  
    const room_id = `${roomId}-${selectedFile}`;
    const websocketProvider = new WebsocketProvider(`ws://localhost:1234`, room_id, ydoc);
    setProvider(websocketProvider);
  
    // Add a small delay to allow awareness to sync
    let syncTimeout;
    
    websocketProvider.on('sync', (isSynced) => {
      if (isSynced && !initialFetchDone.current) {
        if (syncTimeout) clearTimeout(syncTimeout);
        
        syncTimeout = setTimeout(() => {
           if (getConnectedClients(websocketProvider) <= 1) {
               ydoc.getText('monaco').delete(0, ydoc.getText('monaco').length);
          }
          fetchFileContent(websocketProvider);
          initialFetchDone.current = true;
        }, 300);
      }
    });
  
    return () => {
      // Clear the timeout and properly disconnect the provider
      if (syncTimeout) clearTimeout(syncTimeout);
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
  }, [provider,selectedFile, editor, ydoc]);

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