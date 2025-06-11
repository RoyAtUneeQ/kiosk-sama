import { useState, useRef } from 'react';

export const useMicrophone = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [started, setStarted] = useState(false);
  const [data, setData] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startMicrophone = async () => {
    try {
      setStarted(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          setData(event.data);
        }
      });
      
      mediaRecorder.start();
      setIsRecording(true);
      
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  };

  const stopMicrophone = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      setTimeout(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }, 500);
    }
    
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setStopped(true);
  };

  return {
    isRecording,
    startMicrophone,
    stopMicrophone,
    stopped,
    started,
    data
  };
};
