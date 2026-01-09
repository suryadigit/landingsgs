import { useEffect } from 'react'
import { useMantineColorScheme } from '@mantine/core'

export function ColorSchemeSync() {
  const { colorScheme } = useMantineColorScheme()

  useEffect(() => {
    const root = document.documentElement
    localStorage.setItem('colorScheme', colorScheme)
    localStorage.setItem('theme', colorScheme)
    root.setAttribute('data-theme', colorScheme === 'dark' ? 'dark' : 'light')
    
    if (colorScheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [colorScheme])

  return null
}
