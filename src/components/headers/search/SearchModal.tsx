import {
  Box,
  Group,
  Text,
  Modal,
  TextInput,
  Stack,
  Badge,
  Center,
  ScrollArea,
} from '@mantine/core';
import { IconChevronDown, IconSearch, IconX } from '@tabler/icons-react';
import { COLORS } from '../../../types/colors';
import type { SearchItem } from '../search/useHeaderSearch';
import { POPULAR_SEARCHES, QUICK_NAV_ITEMS } from '../search/useHeaderSearch';

interface SearchModalProps {
  opened: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filteredResults: SearchItem[];
  searchItems: SearchItem[];
  onNavigate: (path: string) => void;
  getItemByTitle: (title: string) => SearchItem | undefined;
  getIconByTitle: (title: string) => string;
  isMobile: boolean | undefined;
  dark: boolean;
  colors: {
    bgColor: string;
    borderColor: string;
    textColor: string;
    inputBgColor: string;
    inputBgFocus: string;
    cardBgColor: string;
    hoverBgColor: string;
  };
}

export function SearchModal({
  opened,
  onClose,
  searchValue,
  onSearchChange,
  filteredResults,
  searchItems,
  onNavigate,
  getItemByTitle,
  getIconByTitle,
  isMobile,
  dark,
  colors,
}: SearchModalProps) {
  const { borderColor, textColor, inputBgColor, inputBgFocus, cardBgColor, hoverBgColor } = colors;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      centered
      size={isMobile ? 'full' : 'lg'}
      styles={{
        content: {
          borderRadius: 16,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          backgroundColor: dark ? '#0d0d0d' : '#ffffff',
        },
        header: {
          display: 'none',
        },
        body: {
          padding: isMobile ? 20 : 32,
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
      }}
    >
      <Stack gap={24}>
        {/* Header dengan Close Button */}
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text fw={700} size="xl" style={{ color: textColor }}>
              Cari di SGS affiliate
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Temukan menu, fitur, atau pengaturan yang Anda butuhkan
            </Text>
          </Box>
          <Box
            onClick={onClose}
            style={{
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
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
            <IconX size={24} color={COLORS.text.tertiary} />
          </Box>
        </Group>

        {/* Search Input */}
        <TextInput
          placeholder="Ketik untuk mencari..."
          leftSection={<IconSearch size={22} />}
          leftSectionWidth={50}
          value={searchValue}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          autoFocus
          size="lg"
          radius="lg"
          styles={{
            input: {
              backgroundColor: inputBgColor,
              border: `2px solid ${borderColor}`,
              color: textColor,
              fontSize: 16,
              fontWeight: 500,
              paddingLeft: '60px',
              paddingRight: '18px',
              paddingTop: '16px',
              paddingBottom: '16px',
              letterSpacing: 0.3,
              transition: 'all 0.3s ease',
              '&::placeholder': {
                color: COLORS.text.tertiary,
                fontWeight: 400,
              },
              '&:focus': {
                borderColor: COLORS.accent.primary,
                backgroundColor: inputBgFocus,
                boxShadow: `0 0 0 6px rgba(59, 130, 246, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.05)`,
                outline: 'none',
              },
              '&:hover:not(:focus)': {
                borderColor: COLORS.accent.primary,
                backgroundColor: dark ? '#1a1a1a' : '#fafbfc',
              },
            },
          }}
        />

        {/* Results or Suggestions */}
        <ScrollArea style={{ maxHeight: 450 }}>
          {searchValue.length > 0 ? (
            <SearchResults
              filteredResults={filteredResults}
              onNavigate={onNavigate}
              borderColor={borderColor}
              textColor={textColor}
              cardBgColor={cardBgColor}
              hoverBgColor={hoverBgColor}
            />
          ) : (
            <SearchSuggestions
              searchItems={searchItems}
              onSearchChange={onSearchChange}
              onNavigate={onNavigate}
              getItemByTitle={getItemByTitle}
              getIconByTitle={getIconByTitle}
              dark={dark}
              borderColor={borderColor}
              textColor={textColor}
              cardBgColor={cardBgColor}
              hoverBgColor={hoverBgColor}
            />
          )}
        </ScrollArea>
      </Stack>
    </Modal>
  );
}

// Sub-component: Search Results
interface SearchResultsProps {
  filteredResults: SearchItem[];
  onNavigate: (path: string) => void;
  borderColor: string;
  textColor: string;
  cardBgColor: string;
  hoverBgColor: string;
}

function SearchResults({
  filteredResults,
  onNavigate,
  borderColor,
  textColor,
  cardBgColor,
  hoverBgColor,
}: SearchResultsProps) {
  if (filteredResults.length === 0) {
    return (
      <Center style={{ padding: '60px 20px' }}>
        <Stack gap={12} align="center">
          <Text size="lg" style={{ fontSize: 48 }}>
            🔍
          </Text>
          <Text fw={600} size="sm" style={{ color: textColor }}>
            Tidak ada hasil
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            Coba dengan kata kunci yang berbeda atau gunakan saran di bawah
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap={16} pr={16}>
      <Box>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={12}>
          Hasil Pencarian ({filteredResults.length})
        </Text>
        <Stack gap={10}>
          {filteredResults.map((result) => (
            <SearchResultItem
              key={result.id}
              result={result}
              onNavigate={onNavigate}
              borderColor={borderColor}
              textColor={textColor}
              cardBgColor={cardBgColor}
              hoverBgColor={hoverBgColor}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

// Sub-component: Search Result Item
interface SearchResultItemProps {
  result: SearchItem;
  onNavigate: (path: string) => void;
  borderColor: string;
  textColor: string;
  cardBgColor: string;
  hoverBgColor: string;
}

function SearchResultItem({
  result,
  onNavigate,
  borderColor,
  textColor,
  cardBgColor,
  hoverBgColor,
}: SearchResultItemProps) {
  return (
    <Box
      onClick={() => onNavigate(result.path)}
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        border: `1.5px solid ${borderColor}`,
        backgroundColor: cardBgColor,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverBgColor;
        e.currentTarget.style.borderColor = COLORS.accent.primary;
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = cardBgColor;
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <Group gap={12}>
        <Text size="xl">{result.icon}</Text>
        <Box>
          <Text fw={600} size="sm" style={{ color: textColor }}>
            {result.title}
          </Text>
          <Text size="xs" c="dimmed">
            {result.category}
          </Text>
        </Box>
      </Group>
      <IconChevronDown
        size={18}
        color={COLORS.text.tertiary}
        style={{ transform: 'rotate(-90deg)' }}
      />
    </Box>
  );
}

// Sub-component: Search Suggestions
interface SearchSuggestionsProps {
  searchItems: SearchItem[];
  onSearchChange: (value: string) => void;
  onNavigate: (path: string) => void;
  getItemByTitle: (title: string) => SearchItem | undefined;
  getIconByTitle: (title: string) => string;
  dark: boolean;
  borderColor: string;
  textColor: string;
  cardBgColor: string;
  hoverBgColor: string;
}

function SearchSuggestions({
  onSearchChange,
  onNavigate,
  getItemByTitle,
  getIconByTitle,
  dark,
  borderColor,
  textColor,
  cardBgColor,
  hoverBgColor,
}: SearchSuggestionsProps) {
  return (
    <Stack gap={20} pr={16}>
      {/* Popular Searches */}
      <Box>
        <Group justify="space-between" mb={12}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            ⭐ Pencarian Populer
          </Text>
        </Group>
        <Group gap={8}>
          {POPULAR_SEARCHES.map((title) => (
            <Badge
              key={title}
              variant="light"
              size="lg"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: '8px 14px',
                backgroundColor: dark
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(59, 130, 246, 0.1)',
                color: COLORS.accent.primary,
              }}
              onClick={() => onSearchChange(title)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = dark
                  ? 'rgba(59, 130, 246, 0.3)'
                  : 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = dark
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {title}
            </Badge>
          ))}
        </Group>
      </Box>

      {/* Quick Navigation */}
      <Box>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={12}>
          🚀 Navigasi Cepat
        </Text>
        <Stack gap={10}>
          {QUICK_NAV_ITEMS.map((title) => {
            const item = getItemByTitle(title);
            return (
              <Box
                key={title}
                onClick={() => {
                  if (item) onNavigate(item.path);
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `1.5px solid ${borderColor}`,
                  backgroundColor: cardBgColor,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hoverBgColor;
                  e.currentTarget.style.borderColor = COLORS.accent.primary;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = cardBgColor;
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <Text fw={700} size="lg">
                  {getIconByTitle(title)}
                </Text>
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="sm" style={{ color: textColor }}>
                    {title}
                  </Text>
                </Box>
                <IconChevronDown
                  size={18}
                  color={COLORS.text.tertiary}
                  style={{ transform: 'rotate(-90deg)' }}
                />
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}
