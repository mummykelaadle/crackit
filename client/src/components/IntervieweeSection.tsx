import React, { useRef, useEffect, useState } from 'react';

const IntervieweeSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error('Error accessing camera:', err));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraOn]);

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
  };

  return (
    <div className="flex-1 bg-gray-700 text-white p-4">
      <h2 className="text-lg font-bold">Interviewee</h2>
      <video ref={videoRef} autoPlay className="w-full h-64 bg-black" />
      <button
        onClick={toggleCamera}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
      </button>
    </div>
  );
};

export default IntervieweeSection;