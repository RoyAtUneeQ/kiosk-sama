import './LeftSideBar.scss';
import { useSession } from '@/contexts/SessionContext';
import { CircleButton } from '@/components/button/Button';
import { BsHourglassSplit } from "react-icons/bs";
import { instructions } from '@/instructions/outgoing';
import type { ReactNode } from 'react';
import * as BsIcons from 'react-icons/bs';
import type { OutgoingInstruction } from '@/types';
import type { IconType } from 'react-icons';

const LeftSideBar: React.FC = () => {
  const { state, actions } = useSession();

  const getIconComponent = (iconName: string | undefined): ReactNode => {
    if (!iconName) return <BsHourglassSplit />;
    
    // Find the icon in BsIcons
    const IconComponent = (BsIcons as Record<string, IconType>)[iconName];
    return IconComponent ? <IconComponent /> : <BsHourglassSplit />;
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
      {/* Generate buttons from outgoing instructions */}
      {Object.entries(instructions).filter(([_key, instruction]) => instruction.icon !== undefined).map(([key, instruction]) => (
        <CircleButton 
          key={key}
          className={state.outgoingInstruction && state.outgoingInstruction.icon === instruction.icon ? "highlight" : ""} 
          icon={getIconComponent(instruction.icon)}
          draggable={false}   
          onClick={() => actions.setOutgoingInstruction(instruction as unknown as OutgoingInstruction)}
        />
      ))}
    </div>
  );
};

export default LeftSideBar; 