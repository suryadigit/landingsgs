import { useMantineColorScheme } from '@mantine/core';
import { COLORS } from '../../../types/colors';

export function useHeaderTheme() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  // Theme colors
  const bgColor = dark ? '#0d0d0d' : '#ffffff';
  const borderColor = dark ? '#373a40' : COLORS.border;
  const textColor = dark ? '#c1c2c5' : COLORS.text.dark;
  const searchBgColor = dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.05)';
  const searchBgHover = dark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.08)';
  const inputBgColor = dark ? '#1a1a1a' : '#f8fafc';
  const inputBgFocus = dark ? '#262626' : '#ffffff';
  const cardBgColor = dark ? '#1a1a1a' : '#ffffff';
  const hoverBgColor = dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)';

  return {
    dark,
    toggleColorScheme,
    colors: {
      bgColor,
      borderColor,
      textColor,
      searchBgColor,
      searchBgHover,
      inputBgColor,
      inputBgFocus,
      cardBgColor,
      hoverBgColor,
    },
  };
}
