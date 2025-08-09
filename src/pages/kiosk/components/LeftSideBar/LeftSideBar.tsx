import './LeftSideBar.scss';
import { useSession } from '@/contexts/SessionContext';
import { CircleButton } from '@/components/button/Button';
import { BsHourglassSplit } from "react-icons/bs";
import type { OutgoingInstruction } from '@/types';
import { useDynamicIcons, createOutgoingInstruction } from '@/utils';

// Define interface for instruction items with their icon property
interface InstructionItem {
  key: string;
  instance: OutgoingInstruction & { icon?: string };
  factory: (payload: any) => OutgoingInstruction;
}

const LeftSideBar: React.FC = () => {
  const { state, actions } = useSession();
  
  // Dynamically discover all available instruction factories
  const instructionInstances: InstructionItem[] = Object.entries(createOutgoingInstruction)
    .map(([key, factory]) => {
      // Create an instance to check if it has an icon
      const instance = factory({}) as OutgoingInstruction & { icon?: string };
      return { key, instance, factory };
    })
    .filter(item => item.instance.icon); // Only keep instructions with icons
  
  // Extract all icon names from instruction instances
  const instructionIcons = instructionInstances
    .map(item => item.instance.icon)
    .filter(Boolean);
  
  // Use our dynamic icon loading hook
  const { getIconComponent } = useDynamicIcons(instructionIcons);

  return (
    <div className="left-side-bar-buttons-container">
      {/* Display awaiting prompt response indicator */}
      <CircleButton 
        className="highlight"
        style={{ visibility: state.awaitingPromptResponse ? "visible" : "hidden" }}
        icon={<BsHourglassSplit />}  
        draggable={false}
      />
      {/* Generate buttons from instruction instances */}
      {instructionInstances
        .map(item => {
          if (!item.instance.icon) return null;
          
          return (
            <CircleButton 
              key={item.key}
              className={state.outgoingInstruction && state.outgoingInstruction.icon === item.instance.icon ? "highlight" : ""} 
              icon={getIconComponent(item.instance.icon)}
              draggable={false}   
              onClick={() => actions.setOutgoingInstruction(item.factory({}))}
            />
          );
        })
        .filter(Boolean)}
    </div>
  );
};

export default LeftSideBar; 