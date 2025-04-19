import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

interface Interview {
  id: string
  title: string
  preview: string
  author: string
  date: string
  isYours: boolean
}

export default function InterviewHub() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const dummyInterviews: Interview[] = [
        {
          id: "1",
          title: "Frontend Developer at Tech Giant",
          preview: "I was asked about React hooks, state management, and had to solve a UI challenge...",
          author: "Jane Doe",
          date: "2023-04-15",
          isYours: true,
        },
        {
          id: "2",
          title: "Senior React Developer Interview",
          preview: "The interview focused on advanced React patterns, performance optimization...",
          author: "John Smith",
          date: "2023-03-22",
          isYours: false,
        },
        {
          id: "3",
          title: "Full Stack Developer at Startup",
          preview: "I had to design a system architecture and explain my choices for backend and frontend...",
          author: "Alex Johnson",
          date: "2023-05-10",
          isYours: false,
        },
        {
          id: "4",
          title: "UI/UX Developer Technical Interview",
          preview: "The interview included questions about design systems, accessibility, and component architecture...",
          author: "Sam Wilson",
          date: "2023-04-28",
          isYours: true,
        },
        {
          id: "5",
          title: "React Native Developer Interview",
          preview: "I was asked about mobile-specific challenges, navigation patterns, and state management...",
          author: "Taylor Brown",
          date: "2023-05-05",
          isYours: false,
        },
      ]

      setInterviews(dummyInterviews)
      setLoading(false)
    }

    fetchInterviews()
  }, [])

  const filteredInterviews = interviews.filter(
    (interview) => activeTab === "all" || (activeTab === "yours" && interview.isYours),
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Interview Experiences Hub</h1>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="all">All Interviews</TabsTrigger>
          <TabsTrigger value="yours">Your Interviews</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="all" className="mt-0">
              {loading ? <LoadingState /> : <InterviewGrid interviews={filteredInterviews} />}
            </TabsContent>

            <TabsContent value="yours" className="mt-0">
              {loading ? (
                <LoadingState />
              ) : filteredInterviews.length > 0 ? (
                <InterviewGrid interviews={filteredInterviews} />
              ) : (
                <EmptyState isYours={activeTab === "yours"} />
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}

function InterviewGrid({ interviews }: { interviews: Interview[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {interviews.map((interview) => (
          <InterviewCard key={interview.id} interview={interview} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function InterviewCard({ interview }: { interview: Interview }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>{interview.title}</CardTitle>
          <CardDescription>
            By {interview.author} •{" "}
            {new Date(interview.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground">{interview.preview}</p>
        </CardContent>
        <CardFooter>
          <Link to={`/interviews/${interview.id}`} className="w-full">
            <Button variant="default" className="w-full">
              Read Full Interview
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function EmptyState({ isYours }: { isYours: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg bg-muted/30">
      <div className="text-center max-w-md">
        <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
        <p className="text-muted-foreground mb-6">
          {isYours
            ? "You haven't shared any interview experiences yet. Share your experience to help others prepare!"
            : "There are no interviews to display right now."}
        </p>
        {isYours && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Interview Experience
          </Button>
        )}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Loading interviews...</span>
    </div>
  )
}
