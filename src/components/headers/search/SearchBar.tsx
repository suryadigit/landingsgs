import { Box, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { COLORS } from '../../../shared/types';

interface SearchBarProps {
  onClick: () => void;
  searchBgColor: string;
  searchBgHover: string;
  borderColor: string;
  textColor: string;
  isMobile: boolean | undefined;
}

export function SearchBar({
  onClick,
  searchBgColor,
  searchBgHover,
  borderColor,
  textColor,
  isMobile,
}: SearchBarProps) {
  if (isMobile) {
    return (
      <Box
        onClick={onClick}
        style={{
          cursor: 'pointer',
          padding: 6,
          borderRadius: 6,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <IconSearch size={18} color={textColor} />
      </Box>
    );
  }

  return (
    <Box style={{ flex: 1, minWidth: 0, maxWidth: 380 }}>
      <Box
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: searchBgColor,
          borderRadius: 8,
          padding: '8px 14px',
          border: `1px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = searchBgHover;
          e.currentTarget.style.borderColor = COLORS.accent.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = searchBgColor;
          e.currentTarget.style.borderColor = borderColor;
        }}
      >
        <IconSearch size={16} color={textColor} />
        <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          Search...
        </Text>
      </Box>
    </Box>
  );
}
