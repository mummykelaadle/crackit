import React, { useEffect, useRef, useState } from 'react';

interface LiveTranscriptionProps {
  finalTranscript: string;
  interimTranscript: string;
}

interface AudioRecorderProps {
  getCurrentCode?: () => string;
  getCurrentQuestion?: () => string;
}

const LiveTranscription: React.FC<LiveTranscriptionProps> = ({ finalTranscript, interimTranscript }) => {
  return (
    <div className="mt-2 p-3 bg-gray-700 rounded-lg max-h-32 overflow-y-auto">
      <h3 className="text-sm text-gray-300 mb-1">Live Transcription</h3>
      <div className="text-white">
        {finalTranscript}
        <span className="text-gray-400">{interimTranscript}</span>
        {!finalTranscript && !interimTranscript && <span className="text-gray-400">Listening...</span>}
      </div>
    </div>
  );
};

interface FeedbackDisplayProps {
  feedback: string;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback }) => {
  if (!feedback) return null;
  
  return (
    <div className="mt-2 p-3 bg-gray-700 rounded-lg">
      <h3 className="text-sm text-gray-300 mb-1">AI Feedback</h3>
      <p className="text-white">{feedback}</p>
    </div>
  );
};

const AudioRecorder: React.FC<AudioRecorderProps> = ({ getCurrentCode, getCurrentQuestion }) => {
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  
  // References
  const recognitionRef = useRef<any>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const pauseDetectionIdRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const currentTranscriptRef = useRef<string>(''); // Add a ref to track current speech segment
  
  const PAUSE_THRESHOLD = 2000; // 2 seconds of silence to trigger a pause

  // Initialize sessionId when component mounts
  useEffect(() => {
    // Get sessionId from localStorage or create a new one if it doesn't exist
    let id = localStorage.getItem('interviewSessionId');
    if (!id) {
      id = generateSessionId();
      localStorage.setItem('interviewSessionId', id);
    }
    setSessionId(id);
  }, []);

  // Generate a random session ID
  const generateSessionId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    // Define the SpeechRecognition object (with browser prefixes)
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!window.SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return false;
    }
    
    const recognition = new window.SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let currentInterimTranscript = '';
      
      // Update last speech time whenever we receive results
      lastSpeechTimeRef.current = Date.now();
      
      // Set speaking flag to true
      if (!isSpeakingRef.current) {
        isSpeakingRef.current = true;
        console.log('Speech detected, recording...');
      }
      
      // Process all results from the current event
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // For final results, append to our current transcript ref
          currentTranscriptRef.current += ' ' + transcript;
          // Trim leading/trailing spaces
          currentTranscriptRef.current = currentTranscriptRef.current.trim();
          console.log(`Updated current transcript: "${currentTranscriptRef.current}"`);
          
          // Also update the state for display purposes
          setFinalTranscript(currentTranscriptRef.current);
        } else {
          // For interim results, just display them
          currentInterimTranscript += transcript;
        }
      }
      
      setInterimTranscript(currentInterimTranscript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      // Attempt to restart recognition on error
      if (isListening && event.error !== 'aborted') {
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.warn('Could not restart recognition after error:', e);
            }
          }
        }, 1000);
      }
    };
    
    // Handle end of speech recognition
    recognition.onend = () => {
      console.log('Speech recognition ended');
      // Restart recognition if still listening
      if (isListening) {
        try {
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              recognitionRef.current.start();
              console.log('Restarted speech recognition');
            }
          }, 100);
        } catch (e) {
          console.error('Error restarting speech recognition:', e);
        }
      }
    };
    
    recognitionRef.current = recognition;
    return true;
  };

  // Start pause detection
  const startPauseDetection = () => {
    // Clear any existing pause detection interval
    if (pauseDetectionIdRef.current) {
      clearInterval(pauseDetectionIdRef.current);
    }
    
    pauseDetectionIdRef.current = window.setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastSpeech = currentTime - lastSpeechTimeRef.current;
      
      // If we've been speaking and now detected a significant pause
      if (isSpeakingRef.current && timeSinceLastSpeech > PAUSE_THRESHOLD) {
        // Pause detected
        isSpeakingRef.current = false;
        console.log('Pause detected. Processing transcription...');
        
        // Get the current transcript from our ref
        const transcriptToSend = currentTranscriptRef.current.trim();
        
        // Send the transcription to the server only if there's something to send
        if (transcriptToSend) {
          console.log(`Sending transcript on pause: "${transcriptToSend.substring(0, 50)}${transcriptToSend.length > 50 ? '...' : ''}"`);
          sendTranscriptionToServer(transcriptToSend);
          
          // Reset the current transcript ref after sending
          currentTranscriptRef.current = '';
          setFinalTranscript(''); // Also clear the UI display
        } else {
          console.log('No transcript to send on pause');
        }
      }
    }, 500); // Check for pauses every 500ms
  };

  // Send transcription to server
  const sendTranscriptionToServer = async (transcript: string) => {
    try {
      // Always get the latest code and question when sending transcription
      const code = getCurrentCode ? getCurrentCode() : '';
      const question = getCurrentQuestion ? getCurrentQuestion() : '';
      
      console.log(`Sending transcript: "${transcript.substring(0, 30)}${transcript.length > 30 ? '...' : ''}"`);
      console.log('Code length:', code.length);
      console.log('Using session ID:', sessionId);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          transcript,
          code,
          question,
        }),
      });
      
      const data = await response.json();
      console.log('Server response received');
      
      if (data.status && data.content) {
        setFeedback(data.content);
      } else if (data.content) {
        setFeedback(data.content);
        console.warn('Evaluation returned with status false');
      } else {
        console.warn('No content in evaluation response');
      }
    } catch (error) {
      console.error('Error sending transcription to server:', error);
    }
  };

  // Start listening for speech
  const startListening = () => {
    if (!isListening) {
      const initialized = initSpeechRecognition();
      
      if (initialized && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          lastSpeechTimeRef.current = Date.now();
          startPauseDetection();
          console.log('Started speech recognition');
        } catch (error) {
          console.error('Error starting speech recognition:', error);
        }
      } else {
        console.error('Could not initialize speech recognition');
      }
    }
  };

  // Stop listening for speech
  const stopListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
      
      if (pauseDetectionIdRef.current) {
        clearInterval(pauseDetectionIdRef.current);
        pauseDetectionIdRef.current = null;
      }
      
      setIsListening(false);
      isSpeakingRef.current = false;
      
      // Send any remaining transcript
      const finalTranscriptToSend = currentTranscriptRef.current.trim();
      if (finalTranscriptToSend) {
        sendTranscriptionToServer(finalTranscriptToSend);
        currentTranscriptRef.current = '';
        setFinalTranscript('');
      }
      
      console.log('Stopped speech recognition');
    }
  };

  // Start listening automatically when component mounts
  useEffect(() => {
    startListening();
    
    // Clean up when component unmounts
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping recognition during cleanup:', e);
        }
      }
      
      if (pauseDetectionIdRef.current) {
        clearInterval(pauseDetectionIdRef.current);
      }
    };
  }, []);

  return (
    <div className="p-3 bg-gray-800 border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Interview Assistant</h2>
        <div className="flex gap-2">
          <button
            onClick={startListening}
            disabled={isListening}
            className={`px-3 py-1 rounded text-sm ${isListening ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            Start Listening
          </button>
          <button
            onClick={stopListening}
            disabled={!isListening}
            className={`px-3 py-1 rounded text-sm ${!isListening ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            Stop Listening
          </button>
        </div>
      </div>
      
      {isListening && (
        <div className="flex items-center mt-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${isSpeakingRef.current ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
          <span className="text-sm text-gray-300">
            {isSpeakingRef.current ? 'Listening (speech detected)' : 'Listening (waiting for speech)'}
          </span>
        </div>
      )}
      
      <LiveTranscription finalTranscript={finalTranscript} interimTranscript={interimTranscript} />
      
      <FeedbackDisplay feedback={feedback} />
    </div>
  );
};

export default AudioRecorder;