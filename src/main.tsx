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
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Lazy load pages to reduce initial bundle size
const KioskPage = lazy(() => import('./pages/kiosk/KioskPage'))
const RemotePage = lazy(() => import('./pages/remote/RemotePage'))
import './styles/reset.scss'
import './styles/base.scss'
import './i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './i18n/LanguageProvider'

import { ConfigLoader } from './components/shared/configLoader/ConfigLoader'
import { ErrorBoundary } from './components/shared/errorBoundary/ErrorBoundary'
import { LoadingFallback } from './components/shared/loadingFallback/LoadingFallback'
import { PerformanceMonitor } from './services'

// Performance monitoring will be initialized by ConfigLoader after config is loaded
// Start initial app timing and web vitals tracking
PerformanceMonitor.startTiming('app-initialization');
PerformanceMonitor.trackWebVitals();

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
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ConfigLoader fallback={<LoadingFallback message="Loading application..." size="large" className="loading-fallback--fullscreen" />}>
        <LanguageProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback message="Loading page..." size="large" className="loading-fallback--fullscreen" />}>
              <Routes> 
                <Route path="/" element={<KioskPage />} />
                <Route path="/remote/:kioskConnectionId" element={<RemotePage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </LanguageProvider>
      </ConfigLoader>
    </QueryClientProvider>
  </ErrorBoundary>
)