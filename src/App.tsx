import { BrowserRouter as Router } from 'react-router-dom'
import { ColorSchemeSync } from './components/core'
import { AppRoutes } from './routes/AppRoutes'
import { SidebarProvider } from './contexts/SidebarContext'
import { useSidebarReset } from './hooks/useSidebarReset'
import FriendlyErrorBanner from './shared/components/FriendlyErrorBanner'

function App() {
  useSidebarReset()

  return (
    <>
      <ColorSchemeSync/>
      <FriendlyErrorBanner/>
      <SidebarProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SidebarProvider>
    </>
  )
}

export default App