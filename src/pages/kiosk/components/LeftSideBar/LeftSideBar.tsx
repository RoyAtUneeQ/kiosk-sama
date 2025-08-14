import './LeftSideBar.scss';
import { useSession } from '@/contexts';
import { CircleButton } from '@/components';
import { BsHourglassSplit } from "react-icons/bs";
import { getAllTriggers, useIconFactory, type TriggerItem } from '@/factories';
import { MessageSender } from '@/types';
import { useMemo } from 'react';

const LeftSideBar: React.FC = () => {
  const { state, actions } = useSession();
  
  // Get all registered triggers from the factory
  const triggerInstances = useMemo(() => getAllTriggers(), []);
  
  // Load icons for all triggers dynamically
  const iconNames = triggerInstances.map(trigger => trigger.instance.icon).filter(Boolean);
  const { getIconComponent } = useIconFactory(iconNames);

  /**
   * Execute a trigger when its button is clicked
   * Generates the prompt and potentially sends it to the digital human
   */
  const handleTriggerClick = async (trigger: TriggerItem) => {
    try {
      // Generate the trigger prompt
      const prompt = trigger.instance.generate({});
      
      // This should probably send the prompt to the digital human or update session state
      console.log(`Executing trigger "${trigger.key}":`, prompt);
      
      actions.addMessageToHistory({
        id: crypto.randomUUID(),
        content: prompt,
        timestamp: new Date(),
        sender: MessageSender.System,
      });
      
    } catch (error) {
      console.error(`Failed to execute trigger "${trigger.key}":`, error);
    }
  };

  return (
    <div className="left-side-bar-buttons-container">
      {/* Display awaiting prompt response indicator */}
      <CircleButton 
        className="highlight"
        style={{ visibility: state.awaitingPromptResponse ? "visible" : "hidden" }}
        icon={<BsHourglassSplit />}  
        draggable={false}
      />
      {/* Generate buttons from auto-discovered trigger instances */}
      {triggerInstances
        .map(trigger => {
          const iconComponent = trigger.instance.icon ? getIconComponent(trigger.instance.icon) : null;
          
          return (
            <CircleButton 
              key={trigger.key}
              icon={iconComponent}
              draggable={false}   
              onClick={() => handleTriggerClick(trigger)}
              title={`Execute ${trigger.key} trigger`}
            />
          );
        })
        .filter(Boolean)}
    </div>
  );
};

export default LeftSideBar; 