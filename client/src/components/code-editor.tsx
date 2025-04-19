"use client"

import React from "react"
import MonacoEditor from "react-monaco-editor"

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  language: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language }) => {
  return (
    <div className="code-editor border border-gray-700 rounded-md p-4 bg-[#1e1e1e]">
      <MonacoEditor
        width="100%"
        height="400px"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
          fontSize: 14,
          wordWrap: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}

export default CodeEditor
