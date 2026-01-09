import { useEffect } from 'react'
import { useMantineColorScheme } from '@mantine/core'

export function ColorSchemeSync() {
  const { colorScheme } = useMantineColorScheme()

  useEffect(() => {
    localStorage.setItem('colorScheme', colorScheme)
    document.documentElement.setAttribute('data-theme', colorScheme === 'dark' ? 'dark' : 'light')
  }, [colorScheme])

  return null
}
