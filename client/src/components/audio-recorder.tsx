import React, { useEffect, useRef, useState } from 'react';

const FeedbackDisplay: React.FC<{ feedback: string }> = ({ feedback }) => {
  return (
    <div className="feedback-display">
      <h3>Feedback</h3>
      <p>{feedback}</p>
    </div>
  ) as JSX.Element;
};

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = async (event) => {
      setAudioChunks((prev) => [...prev, event.data]);
      console.log('Audio Blob:', event.data);
      playAudio(event.data);
      const serverFeedback = await sendAudioToServer(event.data);
      setFeedback(serverFeedback);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const sendAudioToServer = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('code', getCurrentCode());
    formData.append('question', getCurrentQuestion());

    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.feedback || 'No feedback received';
  };

  const getCurrentCode = (): string => {
    return 'import java.util.HashMap;import java.util.Map;public class TwoSum {       public static void main(String[] args) {        int[] result1 = twoSum(new int[] {2, 7, 11, 15}, 9);        int[] result2 = twoSum(new int[] {3, 2, 4}, 6);        System.out.println("Result 1: [" + result1[0] + ", " + result1[1] + "]");        System.out.println("Result 2: [" + result2[0] + ", " + result2[1] + "]");    }}';
  };

  const getCurrentQuestion = (): string => {
    return 'Two SumGiven an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.';
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
      <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
      <FeedbackDisplay feedback={feedback} />
    </div>
  );
};

export default AudioRecorder;