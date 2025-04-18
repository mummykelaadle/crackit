import React from 'react';

const InterviewerSection = () => {
  return (
    <div className="flex-1 bg-gray-700 text-white p-4">
      <h2 className="text-lg font-bold">Interviewer</h2>
      <video className="w-full h-64 bg-black" controls>
        <source src="../../public/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default InterviewerSection;
