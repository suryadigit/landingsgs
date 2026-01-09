import { ActionIcon } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

interface ThemeToggleProps {
  dark: boolean;
  textColor: string;
  onToggle: () => void;
}

export function ThemeToggle({ dark, textColor, onToggle }: ThemeToggleProps) {
  return (
    <ActionIcon
      onClick={onToggle}
      variant="subtle"
      color="gray"
      size="lg"
      style={{
        padding: 6,
        borderRadius: 6,
        transition: 'all 0.2s ease',
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = dark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(59, 130, 246, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {dark ? (
        <IconSun size={18} color={textColor} />
      ) : (
        <IconMoon size={18} color={textColor} />
      )}
    </ActionIcon>
  );
}
