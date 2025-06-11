import "./KioskStartForm.scss";
import React, { useEffect, useState } from 'react';
import Button from "@/components/button/Button";
import Panel from "@/components/panel/Panel";
import leftSideImage from "@/assets/telekon.jpg";
import { useTranslation } from "@/hooks";
import { useConfig } from "@/hooks/useConfig";

const KioskStartForm: React.FC<{ sessionId: string, scriptReady: boolean, webSocketConnected: boolean, onStartExperience: () => void, onRenderModeChange: (mode: string) => void, onLanguageChange: (language: string) => void }> = ({ 
  sessionId,
  scriptReady,
  webSocketConnected,
  onStartExperience,
  onRenderModeChange,
  onLanguageChange, 
 }) => {
  const { t, getAvailableLanguages, getCurrentLanguage, changeLanguage } = useTranslation();
  const [renderMode, setRenderMode] = useState<string>("cloud");
  const { config, getSupportedLanguages } = useConfig();
  const supportedLanguages = getSupportedLanguages();
  const languageOptions = getAvailableLanguages().filter(code => supportedLanguages.includes(code));
  const currentLanguage = getCurrentLanguage();

  // Check if current render mode is available for the selected language
  useEffect(() => {
    if (config.personas[currentLanguage]) {
      const availableModes = Object.keys(config.personas[currentLanguage]);
      
      // If current render mode doesn't exist for this language, switch to first available mode
      if (!availableModes.includes(renderMode)) {
        const fallbackMode = availableModes.includes('cloud') ? 'cloud' : availableModes[0];
        console.log(`Render mode '${renderMode}' not available for language '${currentLanguage}', switching to '${fallbackMode}'`);
        setRenderMode(fallbackMode);
      }
    }
  }, [currentLanguage, renderMode, config.personas]);

  useEffect(() => {
    setRenderMode("miniprem");
    changeLanguage("en");
  }, []);

  useEffect(() => {
    console.log("renderMode", renderMode);
    onRenderModeChange(renderMode);
  }, [renderMode, onRenderModeChange]);

  useEffect(() => {
    onLanguageChange(currentLanguage);
  }, [currentLanguage, onLanguageChange]);
  
  // Filter render mode options to only show available modes for current language
  const getAvailableRenderModes = () => {
    if (!config.personas?.[currentLanguage]) return [];
    
    const availableModes = Object.keys(config.personas[currentLanguage]);
    const allModeOptions = [
      { value: 'cloud', label: t('renderMode.cloud') },
      { value: 'miniprem', label: t('renderMode.miniPrem') },
    ];
    
    return allModeOptions.filter(option => availableModes.includes(option.value));
  };

  const renderModeOptions = getAvailableRenderModes();

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
                  key={option}
                  className={`language-option ${currentLanguage === option ? 'active' : ''}`}
                  onClick={() => changeLanguage(option)}
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
                <Button onClick={onStartExperience} className="kiosk-start-button" disabled={!scriptReady || !webSocketConnected || sessionId === "-"}>
                  {t('actions.startExperience')}
                </Button>
              </div>
            </div>

            
            <div className="kiosk-connection-statuses">
              {renderModeOptions.length > 1 && (
                <div className="render-mode-selector">
                  <div className="render-mode-label">{t('renderMode.label')}:</div>
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
              )}
              {renderModeOptions.length > 1 && <br />}
              <div className="kiosk-connection-status-row">
                <span className="kiosk-status-label">{t('status.webSocket')}: &nbsp;</span>
                <span className={`status-${webSocketConnected ? 'ready' : 'not-ready'}`}>
                  {webSocketConnected ? t('status.connected') : t('status.disconnected')}
                </span>
                &nbsp; | &nbsp; 
                <span className="kiosk-status-label">{t('status.uneeqScript')}: &nbsp;</span>
                <span className={`status-${scriptReady ? 'ready' : 'not-ready'}`}>
                  {scriptReady ? t('status.ready') : t('status.notReady')}
                </span>
              </div>
              <div className="kiosk-connection-status-row">
                <a href={`/remote/${sessionId}`} target="_blank" rel="noopener noreferrer"> 
                  <span className="kiosk-status-label">{t('status.sessionId')}: &nbsp;</span>
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