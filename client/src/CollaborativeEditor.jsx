import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco'; 
import React, { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';

const CollaborativeEditor = ({ roomId }) => {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [editor, setEditor] = useState(null);
  const [provider, setProvider] = useState(null);
  const [binding, setBinding] = useState(null);
  const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
  useEffect(() => {
    const websocketProvider = new WebsocketProvider(wsUrl, roomId, ydoc);
    setProvider(websocketProvider);

    return () => {
      if(websocketProvider.wsconnected) {
        websocketProvider.disconnect();
      }
      ydoc.destroy();
    };
  }, [roomId, ydoc]);

  useEffect(() => {
    if (provider === null || editor === null) return;

    const monacoBinding = new MonacoBinding(
      ydoc.getText('monaco'),  // Shared Yjs text for this specific editor
      editor.getModel(),        // Monaco editor model
      new Set([editor]),        // Bindings (editors)
      provider.awareness        // Awareness for real-time collaboration
    );
    setBinding(monacoBinding);

    return () => {
      monacoBinding.destroy();
    };
  }, [provider, editor, ydoc]);

  return (
    <Editor
      height="90vh"
      defaultValue="// Start coding..."
      defaultLanguage="javascript"
      onMount={editorInstance => setEditor(editorInstance)} // Set editor instance when mounted
    />
  );
};

export default CollaborativeEditor;
