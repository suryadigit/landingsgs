import React, { useEffect, useRef, useCallback } from "react";
import {
  Box,
  Container,
  Group,
  Text,
  Title,
  Stack,
  Grid,
  Skeleton,
  useMantineColorScheme,
  Loader,
  Center,
  Button,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";
import { DashboardLayout } from "../../../components/dashboardlayout/dashboard.layout";
import { COLORS } from "../../../shared/types";
import { useNotificationPage } from "../hooks/useNotificationPage";
import {
  NotificationCard,
  NotificationFilters,
  NotificationStats,
  EmptyState,
  ErrorState,
} from "../components/NotificationComponents";
import { ErrorBoundary } from "../../../components/core";

const NotificationsPage: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    stats,
    isLoading,
    error,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isFetchingNextPage,
    hasNextPage,
    statusFilter,
    typeFilter,
    searchValue,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleRefresh,
    handleLoadMore,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleSearchChange,
  } = useNotificationPage();

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        handleLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, handleLoadMore]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const content = (
    <Box
      style={{
        backgroundColor: dark ? "#0d0d0d" : "#ffffff",
        minHeight: "100vh",
        paddingInlineStart: '10px',
      }}
    >
      <Container size="xl">
      <Box style={{ minHeight: isMobile ? 56 : 72, marginBottom: isMobile ? 12 : 16, paddingTop: isLoading ? (isMobile ? 12 : 24) : 0 }}>
        {isLoading ? (
          <Stack gap="xs" justify="center" style={{ height: '100%' }}>
            <Skeleton height={28} width={220} radius="sm" />
            <Skeleton height={14} width={300} radius="sm" />
          </Stack>
        ) : (
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title
                order={1}
                style={{
                  color: dark ? "#ffffff" : COLORS.text.dark,
                  fontSize: isMobile ? 20 : isTablet ? 20 : 22,
                  fontWeight: 700,
                }}
              >
                Notifikasi
              </Title>
              <Text
                style={{
                  color: dark ? "#a1a1a1" : COLORS.text.tertiary,
                  fontSize: isMobile ? 12 : 14,
                  marginTop: 2,
                }}
              >
                {`${notifications.length} notifikasi ditemukan`}
              </Text>
            </Box>
          </Group>
        )}
      </Box>

      {!isLoading && !error && (
        <NotificationStats
          total={stats.total}
          unread={stats.unread}
          read={stats.read}
          dark={dark}
        />
      )}

      {!isLoading && (
        <NotificationFilters
          searchValue={searchValue}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterChange}
          onTypeFilterChange={handleTypeFilterChange}
          onRefresh={handleRefresh}
          onMarkAllAsRead={handleMarkAllAsRead}
          unreadCount={stats.unread}
          isMarkingAllAsRead={isMarkingAllAsRead}
          dark={dark}
          isMobile={isMobile ?? false}
        />
      )}

      {isLoading && (
        <>
          <Grid gutter="lg" mb={24}>
            <Grid.Col span={{ base: 12, sm: 4 }}><Skeleton height={110} radius="md" /></Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}><Skeleton height={110} radius="md" /></Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}><Skeleton height={110} radius="md" /></Grid.Col>
          </Grid>

          <Box
            style={{
              backgroundColor: dark ? "#1a1a1a" : "#ffffff",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <Group grow>
              <Skeleton height={42} radius="md" />
              <Skeleton height={42} radius="md" />
              <Skeleton height={42} radius="md" />
            </Group>
          </Box>

          <Box
            style={{
              backgroundColor: dark ? "#1a1a1a" : "#ffffff",
              borderRadius: 12,
              border: `1px solid ${COLORS.border}`,
              padding: 20,
              minHeight: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack align="center" gap={8} style={{ width: '100%' }}>
              <Skeleton height={64} width={64} radius="lg" />
              <Skeleton height={18} width={220} radius="sm" />
              <Skeleton height={14} width={300} radius="sm" />
            </Stack>
          </Box>
        </>
      )}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={handleRefresh} dark={dark} />
      )}

      {!isLoading && !error && notifications.length === 0 && (
        <EmptyState dark={dark} />
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <>
          <Stack gap="md">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                isMarkingAsRead={isMarkingAsRead}
                dark={dark}
              />
            ))}
          </Stack>

          <div ref={loadMoreRef} style={{ height: 1 }} />

          {isFetchingNextPage && (
            <Center py="lg">
              <Loader size="sm" />
              <Text ml="sm" size="sm" c="dimmed">Memuat lebih banyak...</Text>
            </Center>
          )}

          {hasNextPage && !isFetchingNextPage && (
            <Center py="lg">
              <Button
                variant="subtle"
                leftSection={<IconChevronDown size={16} />}
                onClick={handleLoadMore}
              >
                Muat lebih banyak
              </Button>
            </Center>
          )}

          {!hasNextPage && notifications.length > 10 && (
            <Center py="lg">
              <Text size="sm" c="dimmed">Semua notifikasi sudah ditampilkan</Text>
            </Center>
          )}
        </>
      )}
      </Container>
    </Box>
  );

  return (
    <ErrorBoundary>
      <DashboardLayout>{content}</DashboardLayout>
    </ErrorBoundary>
  );
};

export default NotificationsPage;
