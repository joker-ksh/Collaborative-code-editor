import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';

const CollaborativeEditor = ({ fileName, token, username }) => {
  const editorRef = useRef(null);
  const [permissions, setPermissions] = useState({ canRead: false, canWrite: false, canShare: false });
    console.log(fileName, token, username)
  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      `ws://localhost:3000`,
      `${fileName}?token=${token}`,
      ydoc
    );

    const type = ydoc.getText('monaco');
    const permissionsMap = ydoc.getMap('permissions');

    const editor = monaco.editor.create(editorRef.current, {
      value: '',
      language: 'javascript',
      theme: 'vs-dark',
      readOnly: !permissions.canWrite
    });

    const binding = new MonacoBinding(type, editor.getModel(), new Set([editor]), provider.awareness);
    editor.bindings = [binding];
    const updatePermissions = () => {
      const userPermissions = permissionsMap.get(username) || { canRead: false, canWrite: false, canShare: false };
      setPermissions(userPermissions);
      editor.updateOptions({ readOnly: !userPermissions.canWrite });
    };

    permissionsMap.observe(updatePermissions);
    updatePermissions();

    return () => {
      editor.dispose();
      provider.disconnect();
    };
  }, [fileName, token, username]);

  return (
    <div>
      <div ref={editorRef} style={{ height: '90vh', width: '100%' }} />
      <div>
        Permissions: 
        Read: {permissions.canRead ? 'Yes' : 'No'}, 
        Write: {permissions.canWrite ? 'Yes' : 'No'}, 
        Share: {permissions.canShare ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

export default CollaborativeEditor;