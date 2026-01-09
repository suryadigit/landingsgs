/**
 * Notifications Page - Halaman untuk melihat semua notifikasi
 */

import React from "react";
import {
  Box,
  Container,
  Group,
  Text,
  Title,
  Stack,
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { DashboardLayout } from "../../components/dashboardlayout/dashboard.layout";
import { COLORS } from "../../types/colors";
import { Pagination } from "../../components/common";
import { useNotificationPage } from "./useNotificationPage";
import {
  NotificationCard,
  NotificationFilters,
  NotificationStats,
  EmptyState,
  LoadingState,
  ErrorState,
} from "./notificationComponents";
import ErrorBoundary from "../../components/ErrorBoundary";

const NotificationsPage: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const {
    notifications,
    stats,
    isLoading,
    error,
    isMarkingAsRead,
    isMarkingAllAsRead,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    statusFilter,
    typeFilter,
    searchValue,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleRefresh,
    handlePageChange,
    handleItemsPerPageChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleSearchChange,
  } = useNotificationPage();

  const content = (
    <Box
      style={{
        backgroundColor: dark ? "#1a1a1a" : "#f8f9fa",
        minHeight: "100vh",
        padding: isMobile ? "16px 0" : "40px 0",
      }}
    >
      <Container size="lg" px={isMobile ? "sm" : "md"}>
        {/* Header Section */}
        <Group justify="space-between" align="flex-start" mb={isMobile ? 16 : 32}>
          <Box>
            <Title
              order={1}
              style={{
                color: dark ? "#ffffff" : COLORS.text.dark,
                fontSize: isMobile ? 20 : isTablet ? 24 : 32,
                fontWeight: 700,
              }}
            >
              Notifikasi
            </Title>
            <Text
              style={{
                color: dark ? "#a1a1a1" : COLORS.text.tertiary,
                fontSize: isMobile ? 12 : 14,
                marginTop: 4,
              }}
            >
              {isLoading
                ? "Memuat..."
                : `${totalItems} notifikasi ditemukan`}
            </Text>
          </Box>
        </Group>

        {/* Stats */}
        {!isLoading && !error && (
          <NotificationStats
            total={stats.total}
            unread={stats.unread}
            read={stats.read}
            dark={dark}
          />
        )}

        {/* Filters */}
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

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorState message={error} onRetry={handleRefresh} dark={dark} />
        )}

        {/* Empty State */}
        {!isLoading && !error && notifications.length === 0 && (
          <EmptyState dark={dark} />
        )}

        {/* Notifications List */}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Box mt="xl">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </Box>
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
