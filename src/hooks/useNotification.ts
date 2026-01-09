import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getAdminNotifications,
  sendNotificationToUser,
  sendBroadcastNotification,
} from "../api/notification";
import type { NotificationType } from "../api/notification";

// ==================== QUERY KEYS ====================

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    [...notificationKeys.all, "list", params] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
  adminInbox: (params?: { page?: number; limit?: number; showProcessed?: boolean }) =>
    [...notificationKeys.all, "adminInbox", params] as const,
};

// ==================== USER HOOKS ====================

/**
 * Hook untuk mengambil notifikasi user
 */
export const useNotifications = (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: notificationKeys.list(queryParams),
    queryFn: () => getMyNotifications(queryParams),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 1 minute
  });
};

/**
 * Hook untuk mengambil unread count (untuk badge)
 */
export const useUnreadCount = (enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    enabled,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time feel
  });
};

/**
 * Hook untuk mark notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Hook untuk mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// ==================== COMBINED HOOK FOR HEADER ====================

/**
 * Hook utama untuk NotificationMenu di header
 * Menggabungkan semua functionality yang dibutuhkan
 */
export const useNotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  // State untuk menyimpan ID notifikasi yang disembunyikan (hanya di UI, tidak hapus dari DB)
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState<Set<string>>(new Set());

  // Fetch unread count untuk badge
  const {
    data: unreadData,
    isLoading: isLoadingCount,
    refetch: refetchCount,
  } = useUnreadCount();

  // Fetch notifications ketika menu dibuka
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
  } = useNotifications({
    page: 1,
    limit: 10,
    enabled: isOpen, // Only fetch when menu is open
  });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Filter notifikasi yang tidak disembunyikan
  const visibleNotifications = (notificationsData?.notifications ?? []).filter(
    (notification) => !hiddenNotificationIds.has(notification.id)
  );

  // Handle menu open
  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Handle menu close
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsReadMutation.mutateAsync(notificationId);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [markAsReadMutation]
  );

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [markAllAsReadMutation]);

  // Handle hide notification (hanya sembunyikan dari UI, tidak hapus dari DB)
  const handleHide = useCallback((notificationId: string) => {
    setHiddenNotificationIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      return newSet;
    });
  }, []);

  // Refresh all data dan reset hidden notifications
  const refresh = useCallback(() => {
    setHiddenNotificationIds(new Set()); // Reset hidden saat refresh
    refetchCount();
    if (isOpen) {
      refetchNotifications();
    }
  }, [refetchCount, refetchNotifications, isOpen]);

  return {
    // Data
    unreadCount: unreadData?.unreadCount ?? 0,
    notifications: visibleNotifications,
    pagination: notificationsData?.pagination,

    // Loading states
    isLoadingCount,
    isLoadingNotifications,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isHiding: false, // Tidak ada loading karena hanya update state lokal

    // Menu state
    isOpen,
    handleOpen,
    handleClose,

    // Actions
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleHide,
    refresh,
  };
};

// ==================== ADMIN HOOKS ====================

/**
 * Hook untuk admin inbox notifications
 * @param showProcessed - If true, includes already processed notifications (approved/rejected)
 */
export const useAdminNotifications = (params?: {
  page?: number;
  limit?: number;
  showProcessed?: boolean;
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: notificationKeys.adminInbox(queryParams),
    queryFn: () => getAdminNotifications(queryParams),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

/**
 * Hook untuk send notification to user (admin)
 */
export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendNotificationToUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Hook untuk broadcast notification (admin)
 */
export const useBroadcastNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendBroadcastNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    WITHDRAWAL_REQUEST: "💰",
    ACTIVATION_REQUEST: "🔓",
    SUPPORT_REQUEST: "🆘",
    WITHDRAWAL_APPROVED: "✅",
    WITHDRAWAL_REJECTED: "❌",
    COMMISSION_APPROVED: "💵",
    COMMISSION_PAID: "🎉",
    ACCOUNT_ACTIVATED: "🚀",
    SYSTEM_ANNOUNCEMENT: "📢",
    NEW_REFERRAL: "👥",
    NEW_COMMISSION: "💎",
  };
  return icons[type] || "🔔";
};

/**
 * Get notification color based on type
 */
export const getNotificationColor = (
  type: NotificationType
): "green" | "red" | "blue" | "yellow" | "gray" => {
  const colors: Record<
    NotificationType,
    "green" | "red" | "blue" | "yellow" | "gray"
  > = {
    WITHDRAWAL_REQUEST: "yellow",
    ACTIVATION_REQUEST: "blue",
    SUPPORT_REQUEST: "yellow",
    WITHDRAWAL_APPROVED: "green",
    WITHDRAWAL_REJECTED: "red",
    COMMISSION_APPROVED: "green",
    COMMISSION_PAID: "green",
    ACCOUNT_ACTIVATED: "green",
    SYSTEM_ANNOUNCEMENT: "blue",
    NEW_REFERRAL: "blue",
    NEW_COMMISSION: "green",
  };
  return colors[type] || "gray";
};

/**
 * Format relative time for notification
 */
export const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Baru saja";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} menit yang lalu`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} jam yang lalu`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} hari yang lalu`;
  } else {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
};

/**
 * Check if notification type is a request (for admin inbox)
 */
export const isRequestNotification = (type: NotificationType): boolean => {
  return ["WITHDRAWAL_REQUEST", "ACTIVATION_REQUEST", "SUPPORT_REQUEST"].includes(type);
};

/**
 * Get notification type label in Indonesian
 */
export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    WITHDRAWAL_REQUEST: "Permintaan Pencairan",
    ACTIVATION_REQUEST: "Permintaan Aktivasi",
    SUPPORT_REQUEST: "Permintaan Bantuan",
    WITHDRAWAL_APPROVED: "Pencairan Disetujui",
    WITHDRAWAL_REJECTED: "Pencairan Ditolak",
    COMMISSION_APPROVED: "Komisi Disetujui",
    COMMISSION_PAID: "Komisi Dibayar",
    ACCOUNT_ACTIVATED: "Akun Diaktifkan",
    SYSTEM_ANNOUNCEMENT: "Pengumuman Sistem",
    NEW_REFERRAL: "Referral Baru",
    NEW_COMMISSION: "Komisi Baru",
  };
  return labels[type] || type;
};
