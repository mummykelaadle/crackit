import React,{ useState, useEffect, useRef } from "react"
import { Button } from "./components/ui/button"
import { Card } from "./components/ui/card"
import CodeEditor from "./components/code-editor"
import VideoFeeds from "./components/video-feeds"
import QuestionDisplay from "./components/question-display"
import CodeOutput from "./components/code-output"
import AudioRecorder from "./components/audio-recorder"

function App() {
  const [question, setQuestion] = useState<{
    id: string
    title: string
    description: string
    examples: { input: string; output: string; explanation?: string }[]
    constraints: string[]
  } | null>(null)
  const [code, setCode] = useState("# Write your code here\n\n")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)

  // Use a ref to access the current code value from other components
  const codeRef = useRef(code);
  
  useEffect(() => {
    // Update ref whenever code changes
    codeRef.current = code;
  }, [code]);

  // Function to get the current code - can be accessed by other components
  const getCurrentCode = () => codeRef.current;
  
  // Function to get the current question - can be accessed by other components
  const getCurrentQuestion = () => question ? 
    `${question.title}: ${question.description}` : 
    'No question loaded';

  useEffect(() => {
    // Fetch a coding problem when the component mounts
    fetchQuestion()
  }, [])

  const fetchQuestion = async () => {
    try {
      // In a real app, this would be an API call to your backend
      // For demo purposes, we'll use a mock question
      setQuestion({
        id: "1",
        title: "Two Sum",
        description:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
          },
          {
            input: "nums = [3,2,4], target = 6",
            output: "[1,2]",
          },
        ],
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists.",
        ],
      })
    } catch (error) {
      console.error("Error fetching question:", error)
    }
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput("Running code...")

    try {
      // Send the code to our backend API for execution
      const response = await fetch("http://localhost:3000/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "python",  // Hardcoded as python for now
          version: "3.10",     // Hardcoded version 3.11
          content: code,
          stdin: "",           // Empty stdin for now
          args: []            // No command line args
        }),
      })

      console.log(response)
      const data = await response.json()
      
      if (data.success) {
        // Format the output with stdout, stderr if available
        let outputText = ""
        
        if (data.result.run.stdout) {
          outputText += `Output:\n${data.result.run.stdout}\n`
        }
        
        if (data.result.run.stderr) {
          outputText += `\nErrors:\n${data.result.run.stderr}`
        }
        
        // Add execution info
        // outputText += `\n\nExecution Time: ${data.result.run.wall_time}ms`
        // outputText += `\nMemory Used: ${(data.result.run.memory / (1024 * 1024)).toFixed(2)}MB`
        
        setOutput(outputText)
      } else {
        // Handle execution failures
        if (data.status === 'TLE') {
          setOutput("Time Limit Exceeded - Your code took too long to execute.")
        } else if (data.status === 'MLE') {
          setOutput("Memory Limit Exceeded - Your code used too much memory.")
        } else {
          setOutput(`Execution Error: ${data.message || 'Unknown error occurred'}`)
        }
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Failed to execute code. Please try again."}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col h-dvh max-h-dvh overflow-hidden bg-gray-900 text-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-60px)] overflow-hidden">
        <div className="flex flex-col gap-4">
          <Card className="p-4 bg-gray-800 border-gray-700 flex-grow overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold mb-4">Questions</h2>
            <QuestionDisplay question={question} />
          </Card>

          <Card className="p-4 bg-gray-800 border-gray-700">
            <VideoFeeds />
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4 bg-gray-800 border-gray-700 flex-grow">
            <h2 className="text-xl font-bold mb-4">Code Editor</h2>
            <CodeEditor value={code} onChange={setCode} language="python" />
          </Card>

          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Output</h2>
              <Button onClick={runCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
                {isRunning ? "Running..." : "Run Code"}
              </Button>
            </div>
            <CodeOutput output={output} />
          </Card>
        </div>
      </div>

      <AudioRecorder getCurrentCode={getCurrentCode} getCurrentQuestion={getCurrentQuestion} />

      <div className="flex justify-center h-[50px] mt-2">
        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-900 hover:text-white">
          End Interview
        </Button>
      </div>
    </div>
  )
}

export default App
