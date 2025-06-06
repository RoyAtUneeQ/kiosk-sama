// TypeScript type definitions for browser SpeechRecognition API
// These are not included by default in TypeScript DOM lib
// Minimal types for our use case

type SpeechRecognition = any;
type SpeechRecognitionEvent = any;

let mediaStream: MediaStream | null = null;
let recognition: SpeechRecognition | null = null;

export const MicrophoneService = {
  async startCapture(onTranscript: (text: string, isFinal: boolean) => void) {
    // Start audio capture
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Setup SpeechRecognition
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) throw new Error('SpeechRecognition not supported');
    recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        onTranscript(result[0].transcript, result.isFinal);
      }
    };
    recognition.start();
    return mediaStream;
  },

  stopCapture() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
  }
};