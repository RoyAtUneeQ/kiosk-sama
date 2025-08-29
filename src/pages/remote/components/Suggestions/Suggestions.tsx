import './Suggestions.scss';
import React, { useState } from 'react';
import { FiX, FiFeather, FiImage, FiHelpCircle, FiPower } from 'react-icons/fi';
import { useSession } from '@/contexts/SessionContext';
import { MessageFactory } from '@/factories';
  

interface SuggestionsProps {
  disabled?: boolean;
  onClose?: () => void;
  autoHideOnSelect?: boolean;
}

const Suggestions: React.FC<SuggestionsProps> = ({ disabled, onClose, autoHideOnSelect = true }) => {
  const { actions } = useSession();
  const items = [
    { label: 'Unique and Fun Birthday Surprise Ideas', text: 'Unique and Fun Birthday Surprise Ideas', Icon: FiFeather },
    { label: 'Create an image', text: 'Please create an image of a sunny beach at golden hour', Icon: FiImage },
    { label: 'How can you help me?', text: 'How can you help me?', Icon: FiHelpCircle },
    { label: 'End session', text: 'End session', Icon: FiPower },
  ];

  const [fading, setFading] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [hideRow, setHideRow] = useState(false);

  React.useEffect(() => {
    if (dismissed.size === items.length) {
      onClose?.();
    }
  }, [dismissed.size]);

  return (
    <div className="suggestions-block" aria-label="Suggestions block">
      <div className="suggestions-actions">
        <button
          type="button"
          className="close-suggestions"
          aria-label="Hide suggestions"
          title="Hide suggestions"
          onClick={() => {
            setHideRow(true);
            window.setTimeout(() => onClose?.(), 220);
          }}
        >
          <FiX size={14} />
          Hide
        </button>
      </div>
      <div className={`suggestions${hideRow ? ' fade-row-out' : ''}`} aria-label="Suggestions">
      {items
        .filter(({ label }) => !dismissed.has(label))
        .map(({ label, text, Icon }) => (
          <button
            key={label}
            className={`suggestion-card${fading[label] ? ' fade-out' : ''}`}
            onClick={() => {
              actions.addMessageToHistory(
                MessageFactory.createUserMessage(text, true)
              );
              if (autoHideOnSelect) {
                setFading(prev => ({ ...prev, [label]: true }));
                window.setTimeout(() => {
                  setDismissed(prev => {
                    const next = new Set(prev);
                    next.add(label);
                    // Do not collapse grid; keep width fixed via CSS
                    return next;
                  });
                }, 220);
              }
            }}
            disabled={disabled}
          >
            <div className="card-icon" aria-hidden="true"><Icon size={18} /></div>
            <div className="card-text">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;

