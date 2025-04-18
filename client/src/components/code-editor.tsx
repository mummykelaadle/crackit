"use client"

import { useRef, useEffect, useState } from "react"
import { Editor } from "@monaco-editor/react"
import type * as monaco from "monaco-editor"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
}

export default function CodeEditor({ value, onChange, language = "javascript" }: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [containerHeight, setContainerHeight] = useState("100%")

  // Fix for ResizeObserver loop error
  useEffect(() => {
    // Handle ResizeObserver errors
    const errorHandler = (event: ErrorEvent) => {
      if (event.message.includes("ResizeObserver") || event.error?.message.includes("ResizeObserver")) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason?.message?.includes("ResizeObserver")) {
        event.preventDefault()
      }
    })

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", (event) => {
        if (event.reason?.message?.includes("ResizeObserver")) {
          event.preventDefault()
        }
      })
    }
  }, [])

  // Calculate and set container height
  useEffect(() => {
    if (!containerRef.current) return

    // Use ResizeObserver with debounce to avoid rapid updates
    let timeoutId: number | null = null
    const resizeObserver = new ResizeObserver((entries) => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        for (const entry of entries) {
          if (entry.target === containerRef.current) {
            // Set a fixed height instead of a percentage
            const height = entry.contentRect.height
            if (height > 0) {
              setContainerHeight(`${height}px`)
            }
          }
        }
      }, 100) // 100ms debounce
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      resizeObserver.disconnect()
    }
  }, [])

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    setIsEditorReady(true)

    // Set editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 2,
      wordWrap: "on",
      automaticLayout: true,
    })
  }

  return (
    <div ref={containerRef} className="h-full border border-gray-700 rounded-md overflow-hidden">
      {/* Only render the editor when we have a stable container height */}
      <Editor
        height={containerHeight}
        language={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          readOnly: false,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          wordWrap: "on",
          automaticLayout: true,
        }}
        loading={<div className="flex items-center justify-center h-full">Loading editor...</div>}
      />
    </div>
  )
}
