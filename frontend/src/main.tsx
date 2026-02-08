import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <App />
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '8px' },
          }}
        />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
