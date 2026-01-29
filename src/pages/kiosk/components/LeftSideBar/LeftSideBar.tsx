import './LeftSideBar.scss';
import { useSession } from '@/contexts';
import { CircleButton, Tooltip } from '@/components';
import { getAllTriggers, useIconFactory, MessageFactory } from '@/factories';
// Available for customization: import type { TriggerItem } from '@/factories';
import { useMemo } from 'react';  
import type { Trigger } from '@/triggers/types/Trigger';

const LeftSideBar: React.FC = () => {
  const { state, actions } = useSession();
  
  // Get all registered triggers from the factory - memoized to prevent re-renders
  const triggerInstances = useMemo(() => getAllTriggers(), []);

  // Sort triggers by ID for consistent ordering
  const sortedTriggers = useMemo(() => {
    return [...triggerInstances].sort((a, b) => a.instance.id - b.instance.id);
  }, [triggerInstances]);

  const iconNames = useMemo(() => 
    sortedTriggers
      .map(trigger => trigger.instance.icon)
      .filter(Boolean),
    [sortedTriggers]
  );

  const handleTriggerClick = async (trigger: Trigger) => {
    // Generate a message from the trigger and add it to the history ortherwise just execute the trigger
    const message = await trigger.execute({state, actions});
    message && actions.addMessageToHistory(MessageFactory.createUserMessage(message.content));
  };

  const { getIconComponent } = useIconFactory(iconNames);

  return (
    <div className="left-side-bar-buttons-container">
      {/* Generate buttons from auto-discovered trigger instances */}
      {sortedTriggers
        .map(trigger => {
          const iconComponent = trigger.instance.icon ? getIconComponent(trigger.instance.icon) : null;
          
          return (
            <Tooltip
              key={trigger.key}
              content={trigger.instance.description || `Execute ${trigger.key} trigger`}
              position="right"
              special={trigger.instance.special || false}
              showDelay={200}
              hideDelay={100}
            >
              <CircleButton 
                icon={iconComponent}
                draggable={false}   
                onClick={() => handleTriggerClick(trigger.instance)}
                className={trigger.instance.special ? 'special' : ''}
              />
            </Tooltip>
          );
        })
        .filter(Boolean)}
    </div>
  );
};

export default LeftSideBar; 