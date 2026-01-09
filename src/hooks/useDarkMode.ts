import { useMantineColorScheme } from '@mantine/core';
import { COLORS_LIGHT, COLORS_DARK, type ColorPalette } from '../types/colors';

export function useDarkMode() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const COLORS: ColorPalette = isDark ? COLORS_DARK : COLORS_LIGHT;

  return {
    isDark,
    colorScheme,
    COLORS,
    bgColor: COLORS.bg.primary,
    textColor: COLORS.text.primary,
    borderColor: COLORS.border,
  };
}
