import { useEffect } from 'react'

export function useSidebarReset() {
  useEffect(() => {
    localStorage.setItem('sidebar_state', JSON.stringify(true))
  }, [])
}
