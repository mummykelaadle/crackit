interface Question {
  id: string
  title: string
  description: string
  examples: {
    input: string
    output: string
    explanation?: string
  }[]
  constraints: string[]
}

interface QuestionDisplayProps {
  question: Question | null
}

export default function QuestionDisplay({ question }: QuestionDisplayProps) {
  if (!question) {
    return <div className="text-gray-400">Loading question...</div>
  }

  return (
    <div className="overflow-y-auto h-full">
      <h3 className="text-xl font-bold mb-2">{question.title}</h3>
      <p className="mb-4 text-gray-300">{question.description}</p>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Examples:</h4>
        {question.examples.map((example, index) => (
          <div key={index} className="mb-3 bg-gray-900 p-3 rounded-md">
            <div className="mb-1">
              <span className="font-medium text-gray-400">Input:</span> {example.input}
            </div>
            <div className="mb-1">
              <span className="font-medium text-gray-400">Output:</span> {example.output}
            </div>
            {example.explanation && (
              <div>
                <span className="font-medium text-gray-400">Explanation:</span> {example.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-semibold mb-2">Constraints:</h4>
        <ul className="list-disc list-inside text-gray-300">
          {question.constraints.map((constraint, index) => (
            <li key={index}>{constraint}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
