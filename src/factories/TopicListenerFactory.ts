import type { TopicListener } from '@/listeners/types';
import * as listeners from '@/listeners/topics';

const topicListenerRegistry = new Map<string, TopicListener>();

export function registerTopicListener<T extends TopicListener>(
  ListenerClass: new () => T
) {
  const instance = new ListenerClass();
  topicListenerRegistry.set(instance.topicId, instance);
}

// Auto-register all listeners exported from listeners/topics
Object.values(listeners).forEach((ListenerClass: any) => {
  try {
    console.log('registering topic listener', ListenerClass.name);
    registerTopicListener(ListenerClass as any);
  } catch {}
});

export const TopicListenerFactory = (topicId: string): TopicListener | null => {
  if (!topicId) return null;
  const listener = topicListenerRegistry.get(topicId);
  if (listener) return listener;
  console.warn(`No topic handler found for topic: ${topicId}`);
  return null;
};

export const getAllTopicIds = (): string[] => {
  return Array.from(topicListenerRegistry.keys());
};
