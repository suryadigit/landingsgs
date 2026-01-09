import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css'
import 'animate.css'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './store/auth.context'
import { theme, getInitialColorScheme } from './config/theme'
import { queryClient } from './config/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme={getInitialColorScheme()}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
)