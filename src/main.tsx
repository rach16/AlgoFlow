import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// The /animate route pulls in the whole animation subsystem and its 254 per-problem configs,
// and is only ever reached by opening a separate tab — so it should not be in the bundle the
// main app pays for.
const AnimationPage = lazy(() => import('./pages/AnimationPage.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/animate/:algorithmId"
          element={
            <Suspense fallback={null}>
              <AnimationPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
