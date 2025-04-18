interface CodeOutputProps {
  output: string
}

export default function CodeOutput({ output }: CodeOutputProps) {
  return (
    <div className="bg-gray-900 p-3 rounded-md font-mono text-sm overflow-auto h-[150px]">
      {output ? (
        <pre className="whitespace-pre-wrap">{output}</pre>
      ) : (
        <div className="text-gray-500">Run your code to see output here</div>
      )}
    </div>
  )
}
