import { BrowserRouter as Router } from 'react-router-dom'
import { ColorSchemeSync } from './components/ColorSchemeSync'
import { AppRoutes } from './routes/AppRoutes'
import { SidebarProvider } from './contexts/SidebarContext'
import { useSidebarReset } from './hooks/useSidebarReset'

function App() {
  useSidebarReset()

  return (
    <>
      <ColorSchemeSync />
      <SidebarProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SidebarProvider>
    </>
  )
}

export default App