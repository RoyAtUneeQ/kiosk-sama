import "./SettingsPanel.scss";
import React, { useCallback, useState } from 'react';
import { useTranslation } from '@/hooks';

export interface SettingsOption {
  id: string;
  label: string;
  options: Array<{
    value: string | boolean;
    label: string;
    active: boolean;
  }>;
  onSelect: (value: string | boolean) => void;
}

export interface SettingsPanelProps {
  /** Array of settings options to display */
  settings: SettingsOption[];
  /** Whether the panel is initially open */
  defaultOpen?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom toggle button content */
  toggleContent?: React.ReactNode;
  /** Whether to show the settings toggle button */
  showToggle?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  defaultOpen = false,
  className = '',
  toggleContent,
  showToggle = true,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, onSelect: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  }, []);

  return (
    <div className={`settings-panel-wrapper ${className}`}>
      {/* Settings Toggle Button */}
      {showToggle && (
        <div className="settings-toggle-container">
          <button
            className="settings-toggle"
            onClick={togglePanel}
            aria-expanded={isOpen}
            aria-label={t('settings.toggleLabel', 'Toggle settings panel')}
            title={isOpen ? t('settings.hideSettings', 'Hide settings') : t('settings.showSettings', 'Show settings')}
          >
            {toggleContent || (
              <div className="settings-trigger">
                <div className={`settings-dots ${isOpen ? 'active' : ''}`}>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Collapsible Settings Panel */}
      <div 
        className={`settings-panel ${isOpen ? 'expanded' : 'collapsed'}`}
        aria-hidden={!isOpen}
      >
        <div className="settings-content">
          {settings.map((setting) => (
            <div key={setting.id} className="setting-group">
              <div className="setting-label">{setting.label}:</div>
              <div className="setting-options">
                {setting.options.map((option, index) => (
                  <div 
                    key={`${setting.id}-${index}`}
                    className={`setting-option ${option.active ? 'active' : ''}`}
                    onClick={() => setting.onSelect(option.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, () => setting.onSelect(option.value))}
                    aria-pressed={option.active}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
