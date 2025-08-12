import type { StreamClient } from "@/types/transport/StreamClient";
import DeepgramStreamClient from "@/services/DeepgramStreamClient";
import { SpeechToTextProviders } from "@/types/providers/SpeechToTextProviders";

export function createStreamClient(provider: SpeechToTextProviders, options: any): StreamClient | null {
  switch (provider) {
    case SpeechToTextProviders.DEEPGRAM:
        return new DeepgramStreamClient(options);
    default:
      return null;
    }
}           