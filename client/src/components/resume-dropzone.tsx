import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ResumeDropzoneProps {
  onFileUpload: (file: File) => void;
}

const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-2xl p-8 cursor-pointer hover:border-blue-500 transition-colors"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-500">Drop your resume here...</p>
      ) : (
        <p className="text-gray-600">
          Drag & drop your resume here, or click to upload (PDF, DOC, DOCX)
        </p>
      )}
    </div>
  );
};

export default ResumeDropzone;
