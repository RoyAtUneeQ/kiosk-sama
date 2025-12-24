import './Suggestions.scss';
import React, { useState, useCallback, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import { useSession } from '@/contexts/SessionContext';
import { MessageFactory } from '@/factories';
import { useTranslation, useDynamicIcons } from '@/hooks';
  

interface SuggestionsProps {
  disabled?: boolean;
  onClose?: () => void;
  autoHideOnSelect?: boolean;
}

const Suggestions: React.FC<SuggestionsProps> = ({ disabled, onClose, autoHideOnSelect = true }) => {
  const { actions } = useSession();
  const { t } = useTranslation();
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());
  
  // Get internationalized suggestions with error handling
  const suggestionsData = React.useMemo(() => {
    try {
      const data = t('suggestions.items', { returnObjects: true });
      return Array.isArray(data) ? data as Array<{
        label: string;
        text: string;
        icon: string;
      }> : [];
    } catch (error) {
      console.error('Error loading suggestions data:', error);
      return [];
    }
  }, [t]);
  
  // Extract icon names for dynamic loading
  const iconNames = React.useMemo(() => 
    suggestionsData.map(item => item.icon), 
    [suggestionsData]
  );
  const { getIconComponent } = useDynamicIcons(iconNames);
  
  const items = React.useMemo(() => 
    suggestionsData.map(item => ({
      label: item.label,
      text: item.text,
      iconName: item.icon
    })), 
    [suggestionsData]
  );

  const [fading, setFading] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [hideRow, setHideRow] = useState(false);

  React.useEffect(() => {
    if (dismissed.size === items.length && items.length > 0) {
      // Use setTimeout to prevent blocking the UI thread
      const timeoutId = setTimeout(() => {
        onClose?.();
      }, 0);
      timeoutRefs.current.add(timeoutId);
      return () => {
        clearTimeout(timeoutId);
        timeoutRefs.current.delete(timeoutId);
      };
    }
  }, [dismissed.size, items.length, onClose]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, []);

  // Optimize click handler to prevent blocking
  const handleSuggestionClick = useCallback((label: string, text: string) => {
    // Prevent multiple rapid clicks
    if (fading[label] || dismissed.has(label)) {
      return;
    }

    // Use setTimeout to defer heavy operations and prevent blocking
    const timeoutId = setTimeout(() => {
      try {
        actions.addMessageToHistory(
          MessageFactory.createUserMessage(text, true)
        );
        
        if (autoHideOnSelect) {
          setFading(prev => ({ ...prev, [label]: true }));
          const dismissTimeoutId = setTimeout(() => {
            setDismissed(prev => {
              const next = new Set(prev);
              next.add(label);
              return next;
            });
            timeoutRefs.current.delete(dismissTimeoutId);
          }, 220);
          timeoutRefs.current.add(dismissTimeoutId);
        }
      } catch (error) {
        console.error('Error handling suggestion click:', error);
      }
      timeoutRefs.current.delete(timeoutId);
    }, 0);
    timeoutRefs.current.add(timeoutId);
  }, [actions, autoHideOnSelect, fading, dismissed]);

  return (
    <div className="suggestions-block" aria-label="Suggestions block">
      <div className="suggestions-actions">
        <button
          type="button"
          className="close-suggestions"
          aria-label="Hide suggestions"
          title="Hide suggestions"
          onClick={() => {
            // Prevent multiple rapid clicks
            if (hideRow) return;
            
            setHideRow(true);
            const timeoutId = setTimeout(() => {
              try {
                onClose?.();
              } catch (error) {
                console.error('Error closing suggestions:', error);
              }
              timeoutRefs.current.delete(timeoutId);
            }, 220);
            timeoutRefs.current.add(timeoutId);
          }}
        >
          <FiX size={14} />
          {t('suggestions.hideButton')}
        </button>
      </div>
      <div className={`suggestions${hideRow ? ' fade-row-out' : ''}`} aria-label="Suggestions">
      {items
        .filter(({ label }) => !dismissed.has(label))
        .map(({ label, text, iconName }) => (
          <button
            key={label}
            className={`suggestion-card${fading[label] ? ' fade-out' : ''}`}
            onClick={() => handleSuggestionClick(label, text)}
            disabled={disabled}
          >
            <div className="card-icon" aria-hidden="true">
              {React.cloneElement(getIconComponent(iconName) as React.ReactElement, { size: 18 })}
            </div>
            <div className="card-text">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;

