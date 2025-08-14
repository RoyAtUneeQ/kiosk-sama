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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './i18n/LanguageProvider'

import { ConfigLoader } from './components/configLoader/ConfigLoader'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ConfigLoader fallback={<div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px' 
    }}>Loading application...</div>}>
      <LanguageProvider>
          <BrowserRouter>
            <Routes> 
              <Route path="/" element={<KioskPage />} />
              <Route path="/remote/:kioskConnectionId" element={<RemotePage />} />
            </Routes>
          </BrowserRouter>
      </LanguageProvider>
    </ConfigLoader>
  </QueryClientProvider>
)