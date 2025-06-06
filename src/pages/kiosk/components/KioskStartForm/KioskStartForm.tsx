import "./KioskStartForm.scss";
import React, { useState } from 'react';
import Button from "@/components/button/Button";
import Panel from "@/components/panel/Panel";
import leftSideImage from "@/assets/telekon.jpg";

const KioskStartForm: React.FC<{ sessionId: string, scriptReady: boolean, webSocketConnected: boolean, onStartExperience: () => void }> = ({ 
  sessionId,
  scriptReady,
  webSocketConnected,
  onStartExperience
 }) => {
  const [language, setLanguage] = useState('en'); 
  const [renderMode, setRenderMode] = useState('Cloud');
  
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'ar', label: 'العربية' },
  ];
  
  const renderModeOptions = [
    { value: 'Cloud', label: 'Cloud' },
    { value: 'MiniPrem', label: 'MiniPrem' },
  ];

  return (
    <div className="kiosk-component">
      <Panel 
        imageUrl={leftSideImage}
        imageAltText="Airplane in the sky at sunset"
        formSlot={
          <div className="kiosk-form-slot"> 
            <div className="kiosk-language-selector">
              {languageOptions.map(option => (
                <button
                  key={option.value}
                  className={`language-option ${language === option.value ? 'active' : ''}`}
                  onClick={() => setLanguage(option.value)}
                >
                  {option.value.toUpperCase()}
                </button>
              ))}
            </div>
              
            <div className="kiosk-content">
              <div className="kiosk-header">
                <h1 className="kiosk-welcome-message">Welcome Aboard!</h1>
                <p className="kiosk-description">
                  Your digital experience is about to begin.
                </p>
              </div>
              
              <div className="kiosk-actions">
                <Button onClick={onStartExperience} className="kiosk-start-button" disabled={!scriptReady || !webSocketConnected || sessionId === "-"}>
                  Start Experience</Button>
              </div>
            </div>

            
            <div className="kiosk-connection-statuses">
              <div className="render-mode-selector">
                <div className="render-mode-label">Render Mode:</div>
                <div className="render-mode-options">
                  {renderModeOptions.map(option => (
                    <div 
                      key={option.value}
                      className={`render-mode-option ${renderMode === option.value ? 'active' : ''}`}
                      onClick={() => setRenderMode(option.value)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>
              <br />
              <div className="kiosk-connection-status-row">
                <span className="kiosk-status-label">WebSocket: &nbsp;</span>
                <span className={`status-${webSocketConnected ? 'ready' : 'not-ready'}`}>
                  {webSocketConnected ? 'Connected' : 'Disconnected'}
                </span>
                &nbsp; | &nbsp; 
                <span className="kiosk-status-label">Uneeq Script: &nbsp;</span>
                <span className={`status-${scriptReady ? 'ready' : 'not-ready'}`}>
                  {scriptReady ? 'Ready' : 'Not Ready'}
                </span>
              </div>
              <div className="kiosk-connection-status-row">
                <a href={`/remote/${sessionId}`} target="_blank" rel="noopener noreferrer"> 
                  <span className="kiosk-status-label">Session ID: &nbsp;</span>
                  <span className="kiosk-status-value kiosk-connection-id">{sessionId}</span>
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