// Uneeq's speech markup is parsed server-side, so `speak()` needs the tag intact
// while anything rendered to screen must not show it.
const CUSTOM_EVENT_TAG = /<uneeq:custom_event\b[^>]*?\/?>/gi;

export const hasSpeechMarkup = (text: string): boolean =>
  /<uneeq:custom_event\b/i.test(text);

export const stripSpeechMarkup = (text: string): string =>
  text.replace(CUSTOM_EVENT_TAG, ' ').replace(/\s{2,}/g, ' ').trim();
