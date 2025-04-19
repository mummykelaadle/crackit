import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import CodeEditor from "./code-editor"
import VideoFeeds from "./video-feeds"
import QuestionDisplay from "./question-display"
import CodeOutput from "./code-output"
import AudioRecorder from "./audio-recorder"
import { useParams, useNavigate } from "react-router-dom"

interface CodingPageProps {
  problemId?: string
}

interface TestCase {
  input: Record<string, any>
  expectedOutput: any
}

interface Problem {
  id: string
  title: string
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  constraints: string[]
  testCases?: Record<string, TestCase>
  difficulty?: string
  tags?: string[]
}

const CodingPage: React.FC<CodingPageProps> = ({ problemId: propProblemId }) => {
  const { id: routeId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [question, setQuestion] = useState<Problem | null>(null)
  const [code, setCode] = useState("# Write your code here\n\n")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Use problemId from props, route params, or default to the sample
  const activeProblemId = propProblemId || routeId || "6802cff382aab64098bd479c" // Two Sum problem

  useEffect(() => {
    fetchQuestion()
  }, [activeProblemId])

  const fetchQuestion = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/problem/${activeProblemId}`)
      const data = await response.json()
      
      if (data.success && data.problem) {
        // Format the problem data for display
        const examples = data.problem.examples || []
        
        // If there are testCases but no examples, generate examples from the first few test cases
        if ((!examples || examples.length === 0) && data.problem.testCases) {
          const testCasesArray = Object.values(data.problem.testCases) as TestCase[]
          const generatedExamples = testCasesArray.slice(0, 3).map((tc) => {
            return {
              input: JSON.stringify(tc.input),
              output: JSON.stringify(tc.expectedOutput)
            }
          })
          
          setQuestion({
            id: data.problem._id,
            title: data.problem.title,
            description: data.problem.description,
            examples: generatedExamples,
            constraints: data.problem.constraints || [],
            testCases: data.problem.testCases,
            difficulty: data.problem.difficulty,
            tags: data.problem.tags
          })
        } else {
          setQuestion({
            id: data.problem._id,
            title: data.problem.title,
            description: data.problem.description,
            examples: data.problem.examples || [],
            constraints: data.problem.constraints || [],
            testCases: data.problem.testCases,
            difficulty: data.problem.difficulty,
            tags: data.problem.tags
          })
        }
      } else {
        console.error("Error fetching problem:", data.message)
        // Fallback to default problem if API fails
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
      }
    } catch (error) {
      console.error("Error fetching question:", error)
      // Fallback to default problem if API fails
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
    } finally {
      setIsLoading(false)
    }
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput("Running code...")

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "python",
          version: "3.10",
          content: code,
          stdin: "",
          args: [],
        }),
      })

      const data = await response.json()

      if (data.success) {
        let outputText = ""

        if (data.result.run.stdout) {
          outputText += `Output:\n${data.result.run.stdout}\n`
        }

        if (data.result.run.stderr) {
          outputText += `\nErrors:\n${data.result.run.stderr}`
        }

        setOutput(outputText)
      } else {
        if (data.status === "TLE") {
          setOutput("Time Limit Exceeded - Your code took too long to execute.")
        } else if (data.status === "MLE") {
          setOutput("Memory Limit Exceeded - Your code used too much memory.")
        } else {
          setOutput(`Execution Error: ${data.message || "Unknown error occurred"}`)
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

      <AudioRecorder />

      <div className="flex justify-center h-[50px] mt-2">
        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-900 hover:text-white">
          End Interview
        </Button>
      </div>
    </div>
  )
}

export default CodingPage
