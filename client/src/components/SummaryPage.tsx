import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const dummyChat = [
  {
    id: 1,
    question: "Can you explain useEffect in React?",
    answer: "useEffect is a React Hook that lets you perform side effects in function components...",
    improvedAnswer: "useEffect runs after every render unless you provide a dependency array. It's commonly used for data fetching, subscriptions, or manual DOM manipulation."
  },
  {
    id: 2,
    question: "What is closure in JavaScript?",
    answer: "Closures are functions that remember the variables from their lexical scope...",
    improvedAnswer: "A closure gives you access to an outer function’s scope from an inner function even after the outer function has returned."
  }
];

export default function SummaryPage() {
  const [visibleImproved, setVisibleImproved] = useState<Record<number, boolean>>({});

  const toggleImproved = (id: number) => {
    setVisibleImproved((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Interview Summary</h1>
      <div className="space-y-6">
        {dummyChat.map((chat) => (
          <Card key={chat.id} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Interviewer</CardTitle>
              <p className="text-muted-foreground ml-2 mt-1">{chat.question}</p>
            </CardHeader>
            <CardContent>
              <div className="pl-6 border-l-2 border-primary mb-3">
                <p className="text-sm text-gray-800 font-medium">Interviewee</p>
                <p className="text-muted-foreground mt-1">{chat.answer}</p>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:underline mt-2"
                  onClick={() => toggleImproved(chat.id)}
                >
                  {visibleImproved[chat.id] ? "Hide improved reply" : "Ask for a better reply"}
                </Button>
                <AnimatePresence>
                  {visibleImproved[chat.id] && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-2 p-3 border rounded bg-muted/50"
                    >
                      <p className="text-sm text-muted-foreground">{chat.improvedAnswer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}