import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"
import interviewerVideo from "../assets/interviewer.mp4"

interface VideoFeedsProps {
  isSpeaking: boolean;
}

export default function VideoFeeds({ isSpeaking }: VideoFeedsProps) {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const interviewerVideoRef = useRef<HTMLVideoElement>(null)
  const [isLocalStreamReady, setIsLocalStreamReady] = useState(false)

  useEffect(() => {
    // Initialize user's camera and microphone
    startLocalStream()

    return () => {
      // Clean up streams when component unmounts
      stopLocalStream()
    }
  }, [])

  useEffect(() => {
    // Control interviewer video playback based on speaking state
    if (interviewerVideoRef.current) {
      if (isSpeaking) {
        interviewerVideoRef.current.play()
      } else {
        interviewerVideoRef.current.pause()
      }
    }
  }, [isSpeaking])

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        setIsLocalStreamReady(true)
      }
    } catch (error) {
      console.error("Error accessing media devices:", error)
    }
  }

  const stopLocalStream = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()

      tracks.forEach((track) => {
        track.stop()
      })

      localVideoRef.current.srcObject = null
      setIsLocalStreamReady(false)
    }
  }

  const toggleMicrophone = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const audioTracks = stream.getAudioTracks()

      audioTracks.forEach((track) => {
        track.enabled = !isMicOn
      })

      setIsMicOn(!isMicOn)
    }
  }

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const videoTracks = stream.getVideoTracks()

      videoTracks.forEach((track) => {
        track.enabled = !isVideoOn
      })

      setIsVideoOn(!isVideoOn)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col">
        <div className="relative bg-gray-700 rounded-md overflow-hidden aspect-video flex items-center justify-center">
          <video
            ref={interviewerVideoRef}
            src={interviewerVideo}
            loop
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <div className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">Interviewer</div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="relative bg-gray-700 rounded-md overflow-hidden aspect-video flex items-center justify-center">
          <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          {!isLocalStreamReady && (
            <div className="absolute inset-0 flex items-center justify-center">Loading camera...</div>
          )}
          <div className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">You</div>
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
              onClick={toggleMicrophone}
            >
              {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
