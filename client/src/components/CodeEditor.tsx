import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';

const CodeEditor = ({ onExplain, aiResponse }: { onExplain: (code: string) => void; aiResponse: string | null }) => {
  const [code, setCode] = useState('// Write your code here...');

  const handleExplainClick = () => {
    onExplain(code);
  };

  return (
    <div className="h-full flex flex-col">
      <MonacoEditor
        height="300px"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={(newCode) => setCode(newCode)}
      />
      <button
        onClick={handleExplainClick}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded self-start"
      >
        Explain This
      </button>
      {aiResponse && (
        <div className="mt-4 p-4 border rounded bg-gray-100 text-black">
          <h3 className="font-bold">AI Response:</h3>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
