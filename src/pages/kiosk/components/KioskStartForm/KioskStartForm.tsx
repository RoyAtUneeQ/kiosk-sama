import "./KioskStartForm.scss";
import React, { useCallback, useEffect, useMemo } from 'react';
import Button from "@/components/button/Button";
import Panel from "@/components/panel/Panel";
import { SettingsPanel, StatusPanel } from "@/components";
import type { SettingsOption, StatusItem } from "@/components";
import splashImage from "@/assets/splash.png";
import { useConfig, useTranslation } from "@/hooks";  
import { useSession } from "@/contexts/SessionContext";
import { WebsocketStatus } from "@/types";
import { SessionStatus } from '@/contexts/types';
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

const KioskStartForm: React.FC = () => { 
  const { actions, state } = useSession();
  const { getSupportedLanguages, getRenderByLanguage } = useConfig();
  const { t, changeLanguage } = useTranslation();
  
  // Performance monitoring for experience startup
  const { startTiming, endTiming } = usePerformanceMonitor('KioskStartForm');

  // Configure settings options
  const settingsOptions = useMemo<SettingsOption[]>(() => {
    const options: SettingsOption[] = [];
    
    // Add render mode options if multiple are available
    if (getRenderByLanguage(state.language).length > 1) {
      options.push({
        id: 'renderMode',
        label: t('renderMode.label'),
        options: getRenderByLanguage(state.language).map(option => ({
          value: option,
          label: option,
          active: state.renderMode === option
        })),
        onSelect: (value) => actions.setRenderMode(value as "cloud" | "miniprem")
      });
    }
    
    // Add captions options
    options.push({
      id: 'captions',
      label: t('captions.label'),
      options: [
        {
          value: true,
          label: t('captions.on'),
          active: state.showClosedCaptions
        },
        {
          value: false,
          label: t('captions.off'),
          active: !state.showClosedCaptions
        }
      ],
      onSelect: (value) => actions.setShowClosedCaptions(value as boolean)
    });
    
    return options;
  }, [state.language, state.renderMode, state.showClosedCaptions, getRenderByLanguage, t, actions]);

  // Configure status items
  const statusItems = useMemo<StatusItem[]>(() => [
    {
      id: 'webSocket',
      label: t('status.webSocket'),
      value: state.webSocketState === WebsocketStatus.CONNECTED ? t('status.connected') : t('status.disconnected'),
      status: state.webSocketState === WebsocketStatus.CONNECTED ? 'ready' : 'not-ready'
    },
    {
      id: 'uneeqScript',
      label: t('status.uneeqScript'),
      value: state.uneeq === null ? t('status.notReady') : t('status.ready'),
      status: state.uneeq === null ? 'not-ready' : 'ready'
    },
    {
      id: 'sessionId',
      label: t('status.sessionId'),
      value: state.connectionId || 'Not available',
      status: 'info',
      target: '_blank',
      className: 'connection-id'
    }
  ], [state.webSocketState, state.uneeq, state.connectionId, t]);

  // Start the experience when the user clicks the start button
  const startExperience = useCallback(() => {
    startTiming('experience-startup');
    actions.setSessionStatus(SessionStatus.LOADING, () => {
      state.uneeq?.init();
      state.uneeq?.startSession();
    });
  }, [state.uneeq, startTiming]);

  // Track when experience startup completes (LOADING -> LIVE)
  useEffect(() => {
    if (state.status === SessionStatus.LIVE) {
      endTiming('experience-startup');
    }
  }, [state.status, endTiming]);

  return (
    <div className="kiosk-component">
      <Panel 
        mediaUrl={splashImage}
        mediaAltText="Uneeq - Digital Human"
        formSlot={
          <div className="kiosk-form-slot"> 
            {/* Language Selector */}
            <div className="kiosk-language-selector">
              {getSupportedLanguages().map(option => (
                <button
                  key={option}
                  className={`language-option ${state.language === option ? 'active' : ''}`}
                  onClick={() => 
                    {
                      changeLanguage(option)
                      actions.setLanguage(option)
                    }
                  }
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
              
            <div className="kiosk-content">
              {/* Welcome Message */}
              <div className="kiosk-header">
                <h1 className="kiosk-welcome-message">{t('welcome.title')}</h1>
                <p className="kiosk-description">
                  {t('welcome.description')}
                </p>
              </div>
              {/* Start Experience Button */}
              <div className="kiosk-actions">
                <Button onClick={startExperience} className="kiosk-start-button" disabled={state.uneeq === null || state.webSocketState === WebsocketStatus.DISCONNECTED}>
                  {t('actions.startExperience')}
                </Button>
              </div>
            </div>

            {/* Floating Settings Panel */}
            <SettingsPanel 
              settings={settingsOptions}
              className="kiosk-settings"
            />

            {/* Connection Status Panel */}
            <StatusPanel 
              items={statusItems}
              orientation="horizontal"
              className="kiosk-status-panel"
            />
          </div>
        }
      />
    </div>      
  );
};

export default KioskStartForm;