import React from 'react';
import Editor from '@monaco-editor/react';
import blackboardTheme from 'monaco-themes/themes/Blackboard.json'; // Import the entire JSON object


export default function Core() {
  function handleEditorMount(_,editor) {
    // Register the imported theme
    console.log(editor);
    editor.editor.defineTheme('blackboard', blackboardTheme);
    editor.editor.setTheme('blackboard'); // Apply the theme
  }

  return (
    <div>
      <Editor  
        height="94.52vh" 
        defaultLanguage="javascript" 
        defaultValue="// some comment" 
        onMount={handleEditorMount} // Apply the theme on mount
        options={{
          minimap: { enabled: true }, // Enable minimap
          scrollbar: { 
            vertical: 'hidden',  // Hide vertical scrollbar
            horizontal: 'hidden' // Hide horizontal scrollbar
          },
          scrollBeyondLastLine: false, // Prevent scrolling past the last line
          lineNumbers: 'on', // Show line numbers
          fontSize: 18, // Adjust font size
          fontWeight: 'bold', // Set font weight
          wordWrap: 'on', // Enable word wrap
          fontFamily: 'MonoLisa, Menlo, Monaco, Courier New , monospace' // Set the font family
        }}
      />
    </div>
  );
}
