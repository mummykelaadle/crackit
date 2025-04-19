import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Loader2, MessageSquare, ThumbsUp, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface InterviewDetail {
  id: string
  title: string
  author: string
  date: string
  company: string
  position: string
  difficulty: "Easy" | "Medium" | "Hard"
  questions: {
    id: string
    question: string
    answer: string
  }[]
  tips: string[]
}

export default function InterviewDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState<InterviewDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInterviewDetail = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const dummyInterview: InterviewDetail = {
        id: id as string,
        title: "Frontend Developer at Tech Giant",
        author: "Jane Doe",
        date: "2023-04-15",
        company: "Tech Giant Inc.",
        position: "Senior Frontend Developer",
        difficulty: "Medium",
        questions: [
          {
            id: "q1",
            question: "Can you explain how React's virtual DOM works and why it's beneficial?",
            answer:
              "React's virtual DOM is an in-memory representation of the real DOM. When state changes in a React component, React creates a new virtual DOM tree and compares it with the previous one (diffing). It then updates only the parts of the real DOM that have changed, rather than re-rendering the entire DOM tree. This approach is beneficial because DOM operations are expensive, and minimizing them improves performance significantly.",
          },
          {
            id: "q2",
            question: "How would you optimize the performance of a React application?",
            answer:
              "To optimize a React application, I would: 1) Use React.memo for component memoization, 2) Implement useCallback for memoizing functions, 3) Utilize useMemo for expensive calculations, 4) Lazy load components with React.lazy and Suspense, 5) Use windowing or virtualization for long lists, 6) Optimize images and assets, 7) Implement code splitting, and 8) Use production builds with proper bundling and minification.",
          },
          {
            id: "q3",
            question: "Describe a challenging UI problem you've solved and how you approached it.",
            answer:
              "I once had to implement a complex drag-and-drop interface with nested sortable items that maintained their state. I approached this by first breaking down the problem into smaller components, then used a library like react-beautiful-dnd for the core functionality. I implemented a recursive component structure to handle the nesting, and used context API to manage the state across the component tree. For performance, I added memoization to prevent unnecessary re-renders during drag operations.",
          },
          {
            id: "q4",
            question: "How do you handle state management in large applications?",
            answer:
              "For large applications, I prefer a layered approach to state management. Local component state with useState for UI-specific state, React Context for sharing state across related components, and a global state management solution like Redux or Zustand for application-wide state. I organize the global state into logical slices, implement proper normalization of data, and use selectors to derive computed state. I also ensure proper separation of concerns between UI state and business logic.",
          },
        ],
        tips: [
          "Prepare examples of complex UI challenges you've solved",
          "Be ready to code on a whiteboard or in a shared editor",
          "Review fundamentals of JavaScript and React hooks",
          "Practice explaining your thought process clearly",
        ],
      }

      setInterview(dummyInterview)
      setLoading(false)
    }

    if (id) {
      fetchInterviewDetail()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading interview details...</span>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Interview not found</h2>
        <p className="mb-6">The interview you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Interviews
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Interviews
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl">{interview.title}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{interview.company}</Badge>
                  <Badge variant="outline">{interview.position}</Badge>
                  <Badge
                    variant={
                      interview.difficulty === "Easy"
                        ? "secondary"
                        : interview.difficulty === "Medium"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {interview.difficulty} Difficulty
                  </Badge>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <Avatar>
              <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{interview.author}</p>
              <p className="text-sm text-muted-foreground">Shared on {new Date(interview.date).toLocaleDateString()}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Interview Questions & Answers</h3>
              <div className="space-y-6">
                {interview.questions.map((qa, index) => (
                  <div key={qa.id} className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">
                      <span className="text-primary mr-2">Q{index + 1}:</span>
                      {qa.question}
                    </h4>
                    <p className="text-muted-foreground">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Tips for Similar Interviews</h3>
              <ul className="list-disc pl-5 space-y-2">
                {interview.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" size="sm">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Helpful
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Comment
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
