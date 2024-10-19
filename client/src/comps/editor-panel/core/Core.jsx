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
  const ydoc = useMemo(() => new Y.Doc(), []); 
  const [editor, setEditor] = useState(null);
  const [provider, setProvider] = useState(null);
  const [binding, setBinding] = useState(null);
  const initialFetchDone = useRef(false);

  function handleEditorMount(_, editor) {
    setEditor(_);
    editor.editor.defineTheme('blackboard', blackboardTheme);
    editor.editor.setTheme('blackboard'); 
  }

  const fetchFileContent = async () => {
    try {
      const monacoText = ydoc.getText('monaco');

      if (monacoText.length === 0) {
        console.log('Fetching content from the server...');
        const response = await axios.post(`${apiUrl}/file/${selectedFile}`, {
          roomId: roomId  
        });

        ydoc.transact(() => {
          monacoText.insert(0, response.data.content);
        });
      } else {
        console.log('Content already present in the document.');
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
      if (monacoText.length === 0) {
        ydoc.getText('monaco').insert(0, '// Error loading file');
      }
    }
  };
  
  useEffect(() => {
    const room_id = `${roomId}-${selectedFile}`;
    const websocketProvider = new WebsocketProvider(`ws://localhost:1234`, room_id, ydoc);
    setProvider(websocketProvider);

    initialFetchDone.current = false;

    websocketProvider.on('sync', (isSynced) => {
      if (isSynced && !initialFetchDone.current) {
        fetchFileContent();
        initialFetchDone.current = true;
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