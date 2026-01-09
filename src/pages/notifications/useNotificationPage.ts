import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
} from "../../api/notification";
import type { NotificationType } from "../../api/notification";
import { notificationKeys } from "../../hooks/useNotification";
import { useRole } from "../../hooks/useRole";

export type NotificationFilter = "all" | "unread" | "read";
export type NotificationTypeFilter = NotificationType | "ALL";

/**
 * Hook untuk halaman notifikasi
 */
export const useNotificationPage = () => {
  // Check if admin
  const { isAdmin } = useRole();
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk filter
  const [statusFilter, setStatusFilter] = useState<NotificationFilter>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("ALL");
  const [searchValue, setSearchValue] = useState("");

  const queryClient = useQueryClient();

  // Fetch ALL notifications untuk history
  // Admin: use getAdminNotifications with showProcessed=true to include approved/rejected
  // User: use getMyNotifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: isAdmin 
      ? notificationKeys.adminInbox({ page: 1, limit: 1000, showProcessed: true })
      : notificationKeys.list({ page: 1, limit: 1000 }),
    queryFn: () => isAdmin
      ? getAdminNotifications({ page: 1, limit: 1000, showProcessed: true })
      : getMyNotifications({ page: 1, limit: 1000 }),
    staleTime: 30 * 1000,
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // Get all notifications
  const allNotifications = notificationsData?.notifications ?? [];

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let result = [...allNotifications];

    // Filter by status
    if (statusFilter === "unread") {
      result = result.filter((n) => !n.isRead);
    } else if (statusFilter === "read") {
      result = result.filter((n) => n.isRead);
    }

    // Filter by type
    if (typeFilter !== "ALL") {
      result = result.filter((n) => n.type === typeFilter);
    }

    // Filter by search
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.message.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [allNotifications, statusFilter, typeFilter, searchValue]);

  // Paginate
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: allNotifications.length,
      unread: allNotifications.filter((n) => !n.isRead).length,
      read: allNotifications.filter((n) => n.isRead).length,
    };
  }, [allNotifications]);

  // Handlers
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsReadMutation.mutateAsync(notificationId);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    },
    [markAsReadMutation]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, [markAllAsReadMutation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: NotificationFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleTypeFilterChange = useCallback((value: NotificationTypeFilter) => {
    setTypeFilter(value);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  return {
    // Data
    notifications: paginatedNotifications,
    filteredNotifications,
    stats,

    // Loading states
    isLoading,
    error: error?.message ?? null,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,

    // Pagination
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: filteredNotifications.length,

    // Filters
    statusFilter,
    typeFilter,
    searchValue,

    // Handlers
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleRefresh,
    handlePageChange,
    handleItemsPerPageChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleSearchChange,
  };
};

// Notification type options untuk filter
export const notificationTypeOptions: { value: NotificationTypeFilter; label: string }[] = [
  { value: "ALL", label: "Semua Tipe" },
  { value: "WITHDRAWAL_REQUEST", label: "Permintaan Pencairan" },
  { value: "WITHDRAWAL_APPROVED", label: "Pencairan Disetujui" },
  { value: "WITHDRAWAL_REJECTED", label: "Pencairan Ditolak" },
  { value: "COMMISSION_APPROVED", label: "Komisi Disetujui" },
  { value: "COMMISSION_PAID", label: "Komisi Dibayar" },
  { value: "ACCOUNT_ACTIVATED", label: "Akun Diaktifkan" },
  { value: "SYSTEM_ANNOUNCEMENT", label: "Pengumuman Sistem" },
  { value: "NEW_REFERRAL", label: "Referral Baru" },
  { value: "NEW_COMMISSION", label: "Komisi Baru" },
];

export const statusFilterOptions: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "unread", label: "Belum Dibaca" },
  { value: "read", label: "Sudah Dibaca" },
];
