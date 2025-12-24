import type { Trigger } from '@/triggers';
import * as triggers from '@/triggers';

export interface TriggerItem {
  key: string;
  instance: Trigger;
}

// Trigger registry using reflection - maps keys to trigger instances
const triggerRegistry = new Map<string, Trigger>();

// Cache for getAllTriggers to prevent unnecessary re-renders
let cachedTriggerItems: TriggerItem[] | null = null;

export function registerTrigger<T extends Trigger>(TriggerClass: new () => T, className: string) {
  try {
    const instance = new TriggerClass();
    
    // Verify it implements the Trigger interface
    if (instance && typeof instance.execute === 'function') {
      // Generate key from class name (convert PascalCase to camelCase, remove "Trigger" suffix)
      const key = className
        .replace('Trigger', '')
        .charAt(0).toLowerCase() + className.replace('Trigger', '').slice(1);
      
      triggerRegistry.set(key, instance);
      // Invalidate cache when registry changes
      cachedTriggerItems = null;
      console.log(`TriggerFactory: Registered trigger "${key}" from ${className}`);
    }
  } catch (error) {
    console.warn(`TriggerFactory: Failed to instantiate trigger class ${className}:`, error);
  }
}

// Auto-register all available trigger classes
Object.entries(triggers).forEach(([className, TriggerClass]: [string, any]) => {
  // Skip non-constructor exports (like types, interfaces, etc.)
  if (typeof TriggerClass === 'function' && className.endsWith('Trigger')) {
    registerTrigger(TriggerClass as any, className);
  }
});

export const getAllTriggers = (): TriggerItem[] => {
  // Return cached version if available
  if (cachedTriggerItems) {
    return cachedTriggerItems;
  }
  
  const triggerItems: TriggerItem[] = [];
  
  triggerRegistry.forEach((instance, key) => {
    triggerItems.push({
      key,
      instance
    });
  });
  
  // Cache the result
  cachedTriggerItems = triggerItems;
  return triggerItems;
};

export const getTrigger = (key: string): Trigger | null => {
  const trigger = triggerRegistry.get(key);
  if (!trigger) {
    console.warn(`TriggerFactory: No trigger found for key: ${key}`);
    return null;
  }
  return trigger;
};

export const getTriggerKeys = (): string[] => {
  return Array.from(triggerRegistry.keys());
};
