import { createTheme } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Arial, Helvetica, sans-serif',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        loaderPosition: 'right',
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
      },
    },
    Paper: {
      defaultProps: {
        p: 'md',
      },
    },
  },
})

export const getInitialColorScheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('colorScheme') as 'light' | 'dark' | null
  return saved || 'light'
}
