import "./KioskStartForm.scss";
import React, { useCallback, useEffect } from 'react';
import Button from "@/components/button/Button";
import Panel from "@/components/panel/Panel";
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
              <div className="kiosk-header">
                <h1 className="kiosk-welcome-message">{t('welcome.title')}</h1>
                <p className="kiosk-description">
                  {t('welcome.description')}
                </p>
              </div>
              
              <div className="kiosk-actions">
                <Button onClick={startExperience} className="kiosk-start-button" disabled={state.uneeq === null || state.webSocketState === WebsocketStatus.DISCONNECTED}>
                  {t('actions.startExperience')}
                </Button>
              </div>
            </div>

            <div className="kiosk-connection-statuses">
              {getRenderByLanguage(state.language).length > 1 && (
                <div className="render-mode-selector">
                  <div className="render-mode-label">{t('renderMode.label')}:</div>
                  <div className="render-mode-options">
                    {getRenderByLanguage(state.language).map(option => (
                      <div 
                          key={option}
                        className={`render-mode-option ${state.renderMode === option ? 'active' : ''}`}
                        onClick={() => actions.setRenderMode(option as "cloud" | "miniprem")}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {getRenderByLanguage(state.language).length > 1 && <br />}
              <div className="kiosk-connection-status-row">
                <span className="kiosk-status-label">{t('status.webSocket')}: &nbsp;</span>
                <span className={`status-${state.webSocketState === WebsocketStatus.CONNECTED ? 'ready' : 'not-ready'}`}>
                  {state.webSocketState === WebsocketStatus.CONNECTED ? t('status.connected') : t('status.disconnected')}
                </span>
                &nbsp; | &nbsp; 
                <span className="kiosk-status-label">{t('status.uneeqScript')}: &nbsp;</span>
                <span className={`status-${state.uneeq === null ? 'not-ready' : 'ready'}`}>
                  {state.uneeq === null ? t('status.notReady') : t('status.ready')}
                </span>
              </div>
              <div className="kiosk-connection-status-row">
                <a href={`/remote/${state.connectionId}`} target="_blank" rel="noopener noreferrer"> 
                  <span className="kiosk-status-label">{t('status.sessionId')}: &nbsp;</span>
                  <span className="kiosk-status-value kiosk-connection-id">{state.connectionId}</span>
                </a>
              </div>
            </div>
          </div>
        }
      />
    </div>      
  );
};

export default KioskStartForm;