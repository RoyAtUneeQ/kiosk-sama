# Memory System

A lightweight key-value store for sharing data between components when direct parameter passing through speech events is limited.

## Overview

The Memory system allows triggers to store data that can later be accessed by event listeners, avoiding the limitations of UneeQ custom speech event tags.

```typescript
// Store data in a Trigger
actions.setMemory("media", imageUrl);

// Retrieve in a CustomEventListener
const mediaUrl = session.state.memory["media"] as string;
```

## Why Use Memory

- **Speech Event Limitations**: Pass references instead of complex data
- **Decoupled Components**: Share data without direct dependencies
- **Performance**: Avoid redundant API calls

## Implementation

### 1. Store Data (Trigger)

```typescript
export class YourTrigger implements Trigger {
    async execute({actions}: SessionContextType): Promise<Message | void> {
        const data = await this.fetchData();
        actions.setMemory("your_key", data);
        
        return {
            id: crypto.randomUUID(),
            content: `Process this data <uneeq:custom_event name="process_data" />`,
            timestamp: new Date(),
            sender: MessageSender.System,
            prompt: true
        };
    }
}
```

### 2. Access Data (Listener)

```typescript
export class DataProcessorListener implements CustomEventListener {
    type = "process_data"; 
    
    async execute(_: any, session: SessionContextType): Promise<void> {
        const data = session.state.memory["your_key"];
        if (data) {
            // Use the data
        }
    }
}
```

### 3. Register Listener

```typescript
// In listeners/uneeq/speech_events/index.ts
export { DataProcessorListener } from './DataProcessorListener';
```

## Example: Image Display

### ImageTrigger.ts
```typescript
async execute({state, actions}: SessionContextType): Promise<Message | void> {
    // Get image from service
    const image = await pixabayService.getRandomImage();
    
    // Store URL in memory
    actions.setMemory("media", pixabayService.getBestQualityUrl(image));
    
    return {
        content: `Look at this image. <uneeq:custom_event name="media" />`,
        // Other message properties...
    };
}   
```

### MediaCustomListener.ts
```typescript
async execute(_: any, session: SessionContextType): Promise<void> {
    const imageUrl = session.state.memory["media"] as string;
    
    if (imageUrl) {
        session.actions.setMedia({
            type: 'image',
            url: imageUrl
        });
    }
}
```

## Best Practices

- **Use descriptive keys**: `product_details` not `data`
- **Add type safety**: `const imageUrl = session.state.memory["media"] as string`
- **Validate before use**: Check if data exists and has expected format
- **Clean up when done**: `actions.setMemory("temp_key", null)`

## Common Use Cases

- **Media Resources**: Store URLs for images/videos
- **API Results**: Cache responses to avoid duplicate calls
- **User Context**: Store conversation state and preferences
- **Multi-Stage Workflows**: Support processes spanning multiple interactions

## Limitations

- **Session-only**: Memory resets when session ends
- **Not persistent**: Use localStorage for cross-session data
- **Shared namespace**: Consider namespaced keys to avoid conflicts

## Implementation Pattern

1. **Store data**: `actions.setMemory(key, value)` in a trigger
2. **Trigger event**: Use `<uneeq:custom_event name="event_name" />`
3. **Retrieve data**: Access `session.state.memory[key]` in your listener
4. **Process data**: Use the retrieved data in your component