import { v4 as uuidv4 } from 'uuid';

// Polyfill crypto.randomUUID for older browsers
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  console.log("Polyfilling crypto.randomUUID");
  // Define randomUUID on the global crypto object
  Object.defineProperty(crypto, 'randomUUID', {
    value: uuidv4,
    writable: false, // Prevent reassignment
    configurable: true // Allow deletion or redefinition later if needed
  });
}

import { createRoot } from 'react-dom/client'
import KioskPage from './pages/kiosk/KioskPage'
import RemotePage from './pages/remote/RemotePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/reset.scss'
import './styles/base.scss'
import './i18n'
import { LanguageProvider } from './i18n/LanguageProvider'
import { ConfigProvider } from './hooks/useConfig'

createRoot(document.getElementById('root')!).render(
  <ConfigProvider fallback={<div>Loading application...</div>}>
    <LanguageProvider>
      <BrowserRouter>
        <Routes> 
          <Route path="/" element={<KioskPage />} />
          <Route path="/remote/:sessionId" element={<RemotePage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </ConfigProvider>
)