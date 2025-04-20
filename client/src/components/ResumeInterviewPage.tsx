import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import ResumeDropzone from "./resume-dropzone";
import VideoFeeds from "./video-feeds";
import AudioRecorder from "./audio-recorder";

// Function to generate random session ID if not present
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem("interviewSessionId");
  if (!sessionId) {
    sessionId = Math.floor(Math.random() * 1000000).toString();
    localStorage.setItem("interviewSessionId", sessionId);
  }
  return sessionId;
};

const ResumeInterviewPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewerFeedback, setInterviewerFeedback] = useState("Please upload your resume to begin the interview.");
  const [userTranscript, setUserTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const sessionId = useRef(getOrCreateSessionId());
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTranscriptRef = useRef<string>("");
  const navigate = useNavigate();

  // Load PDF.js from CDN
  useEffect(() => {
    // Add PDF.js script to document
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  // Function to extract text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Wait for PDF.js to load if needed
      if (!(window as any).pdfjsLib) {
        return "PDF.js library not loaded yet. Please try again.";
      }

      const pdfjsLib = (window as any).pdfjsLib;
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document using pdf.js
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDocument = await loadingTask.promise;
      
      // Extract text from all pages
      let extractedText = '';
      
      // Process each page
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text from the page
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
          
        extractedText += pageText + ' ';
      }
      
      return extractedText.trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      return "Error extracting text from PDF";
    }
  };

  // Handler for file upload
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const resumeText = await extractTextFromPDF(file);
      console.log("Extracted Resume Text:", resumeText);
      
      // Make API request to save resume
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/interviewResume/uploadResume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId.current,
          resume: resumeText,
        }),
      });

      const data = await response.json();
      
      if (data.status) {
        setUploadComplete(true);
        setInterviewStarted(true);
        setInterviewerFeedback("Thank you for uploading your resume. Let's begin the interview. Please introduce yourself.");
      } else {
        console.error("Error uploading resume:", data.content);
        setInterviewerFeedback("There was an error uploading your resume. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setInterviewerFeedback("There was an error processing your resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Send transcript to the backend when there's a pause in speaking
  const handleTranscriptUpdate = (newTranscript: string, isFinal: boolean) => {
    if (isFinal) {
      currentTranscriptRef.current = newTranscript.trim();
      setFinalTranscript(newTranscript);
      
      // Clear any existing timeout
      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current);
      }
      
      // Set a new timeout to send the transcript after a pause
      transcriptionTimeoutRef.current = setTimeout(() => {
        sendTranscriptToServer(currentTranscriptRef.current);
        // Clear the current transcript for the next interaction
        currentTranscriptRef.current = "";
        setFinalTranscript("");
      }, 2000); // 2 second pause
    } else {
      setInterimTranscript(newTranscript);
    }
  };

  // Function to send transcript to the server
  const sendTranscriptToServer = async (transcript: string) => {
    if (!transcript.trim() || !interviewStarted) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/interviewResume/evaluateResume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId.current,
          transcript: transcript,
        }),
      });
      
      const data = await response.json();
      
      if (data.status) {
        setInterviewerFeedback(data.content);
        // Speak the response using the browser's speech synthesis
        speakText(data.content);
      } else {
        console.error("Error evaluating response:", data.content);
      }
    } catch (error) {
      console.error("Error sending transcript to server:", error);
    }
  };

  // Function to handle text-to-speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      // Set speaking state to true when synthesis starts
      utterance.onstart = () => {
        console.log('ResumeInterviewPage: AI started speaking feedback');
        setIsSpeaking(true);
      };
      
      // Reset speaking state when synthesis ends
      utterance.onend = () => {
        console.log('ResumeInterviewPage: AI finished speaking feedback');
        setIsSpeaking(false);
      };
      
      // Handle errors
      utterance.onerror = (event) => {
        console.error('ResumeInterviewPage: Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  };

  // End the interview
  const handleEndInterview = () => {
    navigate('/');
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-dvh max-h-dvh overflow-hidden bg-gray-900 text-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-60px)] overflow-hidden">
        {!uploadComplete ? (
          <div className="col-span-2 flex justify-center items-center">
            <Card className="p-8 bg-gray-800 border-gray-700 max-w-lg w-full">
              <h2 className="text-xl font-bold mb-6 text-center">Upload Your Resume</h2>
              <p className="mb-6 text-gray-300 text-center">
                Please upload your resume in PDF format. We'll use it to personalize your interview experience.
              </p>
              <ResumeDropzone onFileUpload={handleFileUpload} />
              {isUploading && (
                <p className="mt-4 text-center text-blue-400">Processing your resume...</p>
              )}
            </Card>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <Card className="p-4 bg-gray-800 border-gray-700">
                <h2 className="text-xl font-bold mb-4">Interviewer</h2>
                <div className="rounded-lg bg-gray-700 p-4 h-[200px] overflow-y-auto">
                  <p>{interviewerFeedback}</p>
                </div>
              </Card>

              <Card className="p-4 bg-gray-800 border-gray-700">
                <VideoFeeds isSpeaking={isSpeaking} />
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="p-4 bg-gray-800 border-gray-700">
                <h2 className="text-xl font-bold mb-4">You</h2>
                <div className="rounded-lg bg-gray-700 p-4 h-[200px] overflow-y-auto">
                  <p>{finalTranscript || interimTranscript || "Waiting for your response..."}</p>
                </div>
              </Card>

              <Card className="p-4 bg-gray-800 border-gray-700">
                <h2 className="text-xl font-bold mb-2">Your Audio</h2>
                <AudioRecorder 
                  onSpeakingChange={setIsSpeaking} 
                  onTranscriptChange={handleTranscriptUpdate}
                  disableSpeechSynthesis={true}
                />
              </Card>
            </div>
          </>
        )}
      </div>

      {uploadComplete && (
        <div className="mt-4">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h2 className="text-lg font-bold mb-2">Real-time Transcription</h2>
            <div className="bg-gray-700 p-3 rounded-lg text-lg">
              {finalTranscript || interimTranscript || "Waiting for you to speak..."}
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-end h-[50px] mt-4">
        <Button 
          variant="outline" 
          className="border-red-500 text-red-500 hover:bg-red-900 hover:text-white"
          onClick={handleEndInterview}
        >
          End Interview
        </Button>
      </div>
    </div>
  );
};

export default ResumeInterviewPage;