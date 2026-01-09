import { Box, Group, Divider, Container, Text } from '@mantine/core';
import { useHeader } from './useHeader';
import { SearchBar } from './search/SearchBar';
import { SearchModal } from './search/SearchModal';
import { ThemeToggle } from '././theme/ThemeToggle';
import { NetworkStatus } from './theme/NetworkStatus';
import { UserMenu } from './UserMenu';
import { NotificationMenu } from './notifications/NotificationMenu';

const MobileStatusBadge = () => (
  <Box
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      padding: '4px 10px',
      borderRadius: 12,
      border: '1px solid rgba(16, 185, 129, 0.3)',
    }}
  >
    <Box
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: '#10b981',
        animation: 'pulse-glow 2s infinite',
      }}
    />
    <Text
      style={{
        color: '#10b981',
        fontWeight: 600,
        fontSize: 12,
      }}
    >
      ACTIVE
    </Text>
    <style>
      {`
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            opacity: 1;
          }
          50% {
            box-shadow: 0 0 8px 4px rgba(16, 185, 129, 0.4);
            opacity: 0.6;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            opacity: 1;
          }
        }
      `}
    </style>
  </Box>
);

interface HeaderProps {
  onMenuToggle?: (opened: boolean) => void;
  bgOverride?: string;
}

export function DashboardHeader(props: HeaderProps) {
  const {
    isMobile,
    searchOpen,
    searchValue,
    dark,
    userName,
    userEmail,
    userLevel,
    userRole,
    searchItems,
    filteredResults,
    bgColor,
    borderColor,
    textColor,
    searchBgColor,
    searchBgHover,
    inputBgColor,
    inputBgFocus,
    cardBgColor,
    hoverBgColor,
    toggleColorScheme,
    handleLogout,
    openSearch,
    closeSearch,
    handleSearchChange,
    navigateToItem,
    getItemByTitle,
    getIconByTitle,
  } = useHeader();

  const { bgOverride } = props;
  const bgColorFinal = bgOverride || bgColor;
  const textColorFinal = bgOverride ? '#ffffff' : textColor;
  const borderColorFinal = bgOverride ? 'rgba(255,255,255,0.06)' : borderColor;

  if (isMobile) {
    return (
      <>
        <Box style={{ backgroundColor: bgColorFinal, padding: '8px 0', borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}>
          <Group gap={8} align="center" justify="flex-end" style={{ height: '100%', width: '100%' }}>
            {/* Left side icons */}
            <Group gap={6} align="center" style={{ flex: 1 }}>
              <SearchBar
                onClick={openSearch}
                searchBgColor={searchBgColor}
                searchBgHover={searchBgHover}
                borderColor={borderColorFinal}
                textColor={textColorFinal}
                isMobile={isMobile}
              />

              <ThemeToggle
                dark={dark}
                textColor={textColorFinal}
                onToggle={toggleColorScheme}
              />

              <NetworkStatus
                dark={dark}
                textColor={textColorFinal}
              />

              <NotificationMenu
                textColor={textColorFinal}
                bgColor={bgColorFinal}
              />
            </Group>

            <MobileStatusBadge />
            <UserMenu
              userName={userName}
              userEmail={userEmail}
              userLevel={userLevel}
              userRole={userRole}
              onLogout={handleLogout}
              isMobile={isMobile}
              textColor={textColorFinal}
            />
          </Group>
        </Box>

        {/* Search Modal */}
        <SearchModal
          opened={searchOpen}
          onClose={closeSearch}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          filteredResults={filteredResults}
          searchItems={searchItems}
          onNavigate={navigateToItem}
          getItemByTitle={getItemByTitle}
          getIconByTitle={getIconByTitle}
          isMobile={isMobile}
          dark={dark}
          colors={{
            bgColor: bgColorFinal,
            borderColor: borderColorFinal,
            textColor: textColorFinal,
            inputBgColor,
            inputBgFocus,
            cardBgColor,
            hoverBgColor,
          }}
        />
      </>
    );
  }

  // Desktop layout
  return (
    <>
      <Box
        style={{
          backgroundColor: bgColorFinal,
          padding: '10px 0',
          width: '100%',
          transition: 'all 0.3s ease',
        }}
      >
        <Container 
          size="xl" 
          style={{ 
            paddingRight: 24, 
            paddingLeft: 24,
          }}
        >
          <Group justify="space-between" align="center" gap={8} style={{ width: '100%' }}>
            <SearchBar
              onClick={openSearch}
              searchBgColor={searchBgColor}
              searchBgHover={searchBgHover}
              borderColor={borderColorFinal}
              textColor={textColorFinal}
              isMobile={isMobile}
            />

            <Group gap={8} align="center">
              <ThemeToggle
                dark={dark}
                textColor={textColorFinal}
                onToggle={toggleColorScheme}
              />

              <NetworkStatus
                dark={dark}
                textColor={textColorFinal}
              />

              <NotificationMenu
                textColor={textColorFinal}
                bgColor={bgColorFinal}
              />

              <Divider orientation="vertical" style={{ height: 20 }} />

              <UserMenu
                userName={userName}
                userEmail={userEmail}
                userLevel={userLevel}
                userRole={userRole}
                onLogout={handleLogout}
                isMobile={isMobile}
                textColor={textColorFinal}
              />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Search Modal */}
        <SearchModal
        opened={searchOpen}
        onClose={closeSearch}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        filteredResults={filteredResults}
        searchItems={searchItems}
        onNavigate={navigateToItem}
        getItemByTitle={getItemByTitle}
        getIconByTitle={getIconByTitle}
        isMobile={isMobile}
        dark={dark}
        colors={{
            bgColor: bgColorFinal,
            borderColor: borderColorFinal,
            textColor: textColorFinal,
          inputBgColor,
          inputBgFocus,
          cardBgColor,
          hoverBgColor,
        }}
      />
    </>
  );
}