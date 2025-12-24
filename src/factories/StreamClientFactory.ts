import type { StreamClient } from "@/types/transport/StreamClient";
import { DeepgramStreamService } from "@/services";
import { SpeechToTextProviders } from "@/types/providers/SpeechToTextProviders";

export function createStreamClient(provider: SpeechToTextProviders, options: any): StreamClient | null {
  switch (provider) {
    case SpeechToTextProviders.DEEPGRAM:
        return new DeepgramStreamService(options);
    default:
      return null;
    }
}           