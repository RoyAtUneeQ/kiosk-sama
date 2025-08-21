import './LeftSideBar.scss';
import { useSession } from '@/contexts';
import { CircleButton } from '@/components';
import { BsHourglassSplit } from "react-icons/bs";
import { getAllTriggers, useIconFactory, type TriggerItem } from '@/factories';
import { useMemo } from 'react';  

const LeftSideBar: React.FC = () => {
  const { state, actions } = useSession();
  
  // Get all registered triggers from the factory - memoized to prevent re-renders
  const triggerInstances = useMemo(() => getAllTriggers(), []);
  
  // Memoize icon names to prevent useDynamicIcons from re-running constantly
  const iconNames = useMemo(() => 
    triggerInstances.map(trigger => trigger.instance.icon).filter(Boolean),
    [triggerInstances]
  );
  const { getIconComponent } = useIconFactory(iconNames);

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
              onClick={() => actions.addMessageToHistory(trigger.instance.generate({state, actions}))}
              title={`Execute ${trigger.key} trigger`}
            />
          );
        })
        .filter(Boolean)}
    </div>
  );
};

export default LeftSideBar; 