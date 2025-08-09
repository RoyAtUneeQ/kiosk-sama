import './Suggestions.scss';
import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface SuggestionItem {
  label: string;
  text: string;
  Icon: React.ComponentType<{ size?: number }>;
}

interface SuggestionsProps {
  items: SuggestionItem[];
  onSelect: (text: string) => void;
  disabled?: boolean;
  onClose?: () => void;
  autoHideOnSelect?: boolean;
}

const Suggestions: React.FC<SuggestionsProps> = ({ items, onSelect, disabled, onClose, autoHideOnSelect = true }) => {
  if (!items?.length) return null;
  const [fading, setFading] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [hideRow, setHideRow] = useState(false);

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
              onSelect(text);
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

