// Integration hooks - Wrap external SDKs/APIs providing clean interface
export { useUneeq, useUneeqSdkLifecycle, useUneeqMessageQueue, useUneeqControls, useUneeqEvents } from './integration/uneeq';
export { useWebSocketAdapter } from './integration/useWebSocketAdapter';
export { useSpeechAdapter } from './integration/useSpeechAdapter';

// State hooks - Complex state coordination

// UI hooks - Simple presentational helpers
export { useViewport } from './ui/useViewport';
export { useAnimatedText } from './ui/useAnimatedText';

// Data hooks - Configuration and content loading
export { useConfiguration } from './data/useConfiguration';
export { useDynamicIcons } from './data/useDynamicIcons';
export { useLanguagePreference } from './data/useLanguagePreference';
export { useTranslation } from './data/useTranslation';

// Backward compatibility exports (deprecated - use new names)
export { useUneeq as useUneeqAdapter } from './integration/uneeq';
export { useWebSocketAdapter as useWebSocket } from './integration/useWebSocketAdapter';
export { useSpeechAdapter as useSpeechServices } from './integration/useSpeechAdapter';
export { useUneeqEvents as useUneeqEventsAdapter } from './integration/uneeq';
export { useConfiguration as useConfig } from './data/useConfiguration';
export { useLanguagePreference as useLanguagePersist } from './data/useLanguagePreference';
export { useStateManager } from './state/useStateManager';
