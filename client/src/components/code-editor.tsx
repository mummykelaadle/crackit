"use client"

import React, { useState } from "react"
import MonacoEditor from "react-monaco-editor"

interface CodeEditorProps {
  onExplain: (code: string) => void
  aiResponse: string | null
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onExplain, aiResponse }) => {
  const [code, setCode] = useState("// Write your code here...")

  const handleExplainClick = () => {
    onExplain(code)
  }

  return (
    <div className="code-editor border border-gray-700 rounded-md p-4 bg-[#1e1e1e]">
      <MonacoEditor
        width="100%"
        height="400px"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={(newCode) => setCode(newCode)}
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
          fontSize: 14,
          wordWrap: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
      <button
        onClick={handleExplainClick}
        className="mt-4 bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-2 rounded"
      >
        Explain This
      </button>
      {aiResponse && (
        <div className="mt-4 p-4 border rounded bg-gray-100 text-black">
          <h3 className="font-bold mb-2">AI Response:</h3>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  )
}

export default CodeEditor
