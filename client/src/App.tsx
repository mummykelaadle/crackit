import QuestionSection from './components/QuestionSection';
import InterviewerSection from './components/InterviewerSection';
import IntervieweeSection from './components/IntervieweeSection';
import CodeEditor from './components/CodeEditor';

function App() {
  return (
    <div className="h-screen p-4 bg-black text-white">
      <div className="flex h-full space-x-4">
        {/* Left Side: Questions + Interviewer/Interviewee */}
        <div className="w-1/2 flex flex-col space-y-4">
          {/* Top Left - Question Section */}
          <div className="flex-1 border border-white rounded p-2">
            <QuestionSection />
          </div>

          {/* Bottom Left - Interviewer & Interviewee */}
          <div className="flex-1 flex space-x-4">
            <div className="w-1/2 border border-white rounded p-2">
              <InterviewerSection />
            </div>
            <div className="w-1/2 border border-white rounded p-2">
              <IntervieweeSection />
            </div>
          </div>
        </div>

        {/* Right Side: Code Editor */}
        <div className="w-1/2 border border-white rounded p-2 flex flex-col">
          <CodeEditor
            onExplain={(code: string) => {
              console.log('Code submitted:', code);
            }}
            aiResponse={null}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
