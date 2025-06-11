import { useCallback } from 'react';

export const useDeepgram = (apiKey: string, language: string) => {
  const transcribe = useCallback(async (audioData: Blob): Promise<string> => {
    // Don't attempt transcription if API key is not available
    if (!apiKey || apiKey.trim() === '') {
      console.warn('Deepgram API key not available, skipping transcription');
      return '';
    }

    try {
      const formData = new FormData();
      formData.append('audio', audioData, 'audio.wav');

      const response = await fetch(`https://api.deepgram.com/v1/listen?language=${language}&model=nova-2&smart_format=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        console.error(`Deepgram API error: ${response.status} ${response.statusText}`);
        return '';
      }

      const result = await response.json();
      
      if (result.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
        return result.results.channels[0].alternatives[0].transcript;
      } else {
        console.warn('No transcript found in Deepgram response');
        return '';
      }
    } catch (error) {
      console.error('Error transcribing audio with Deepgram:', error);
      return '';
    }
  }, [apiKey, language]);

  return { transcribe };
}; 