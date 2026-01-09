import { Box, Group, Divider, Container, Text } from '@mantine/core';
import { useHeader } from './useHeader';
import { SearchBar } from './search/SearchBar';
import { SearchModal } from './search/SearchModal';
import { ThemeToggle } from '././theme/ThemeToggle';
import { NetworkStatus } from './theme/NetworkStatus';
// import { NotificationMenu } from './notifications/NotificationMenu';
import { UserMenu } from './UserMenu';
import { NotificationMenu } from './notifications/NotificationMenu';

// Mobile Active Status Badge Component
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
}

export function DashboardHeader(_props: HeaderProps) {
  const {
    // State
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

    // Colors
    bgColor,
    borderColor,
    textColor,
    searchBgColor,
    searchBgHover,
    inputBgColor,
    inputBgFocus,
    cardBgColor,
    hoverBgColor,

    // Handlers
    toggleColorScheme,
    handleLogout,
    openSearch,
    closeSearch,
    handleSearchChange,
    navigateToItem,
    getItemByTitle,
    getIconByTitle,
  } = useHeader();

  // Untuk mobile, render simple tanpa wrapper Box
  if (isMobile) {
    return (
      <>
        <Group gap={8} align="center" justify="flex-end" style={{ height: '100%', width: '100%' }}>
          {/* Left side icons */}
          <Group gap={6} align="center" style={{ flex: 1 }}>
            <SearchBar
              onClick={openSearch}
              searchBgColor={searchBgColor}
              searchBgHover={searchBgHover}
              borderColor={borderColor}
              textColor={textColor}
              isMobile={isMobile}
            />

            <ThemeToggle
              dark={dark}
              textColor={textColor}
              onToggle={toggleColorScheme}
            />

            <NetworkStatus
              dark={dark}
              textColor={textColor}
            />

            <NotificationMenu
              textColor={textColor}
              bgColor={bgColor}
            />
          </Group>

          {/* Status Badge - visible on mobile */}
          <MobileStatusBadge />

          {/* User Menu - pojok kanan */}
          <UserMenu
            userName={userName}
            userEmail={userEmail}
            userLevel={userLevel}
            userRole={userRole}
            onLogout={handleLogout}
            isMobile={isMobile}
            textColor={textColor}
          />
        </Group>

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
            bgColor,
            borderColor,
            textColor,
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
          backgroundColor: bgColor,
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
            {/* Left - Search Bar */}
            <SearchBar
              onClick={openSearch}
              searchBgColor={searchBgColor}
              searchBgHover={searchBgHover}
              borderColor={borderColor}
              textColor={textColor}
              isMobile={isMobile}
            />

            {/* Right Side - Actions */}
            <Group gap={8} align="center">
              {/* Theme Toggle */}
              <ThemeToggle
                dark={dark}
                textColor={textColor}
                onToggle={toggleColorScheme}
              />

              {/* Network Status */}
              <NetworkStatus
                dark={dark}
                textColor={textColor}
              />

              {/* Notifications */}
              <NotificationMenu
                textColor={textColor}
                bgColor={bgColor}
              />

              <Divider orientation="vertical" style={{ height: 20 }} />

              {/* User Menu */}
              <UserMenu
                userName={userName}
                userEmail={userEmail}
                userLevel={userLevel}
                userRole={userRole}
                onLogout={handleLogout}
                isMobile={isMobile}
                textColor={textColor}
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
          bgColor,
          borderColor,
          textColor,
          inputBgColor,
          inputBgFocus,
          cardBgColor,
          hoverBgColor,
        }}
      />
    </>
  );
}