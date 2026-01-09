import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  type NotificationType,
  type Notification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../features/notification";
import { useAuth } from '../../features/auth';

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

export const useNotificationMenu = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { token } = useAuth();

  const { data: countData, isLoading: isLoadingCount } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    enabled: !!token,
  });

  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: notificationKeys.list({ limit: 10 }),
    queryFn: () => getMyNotifications({ limit: 10 }),
    enabled: isOpen && !!token,
    staleTime: 30 * 1000,
  });

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

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);
  
  const handleMarkAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  return {
    unreadCount: countData?.unreadCount ?? 0,
    notifications: (notificationsData?.notifications ?? []) as Notification[],
    isLoadingCount,
    isLoadingNotifications,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isOpen,
    handleOpen,
    handleClose,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
};

export const getNotificationColor = (type: NotificationType): string => {
  const colors: Record<NotificationType, string> = {
    WITHDRAWAL_REQUEST: "#f59e0b",
    ACTIVATION_REQUEST: "#3b82f6",
    SUPPORT_REQUEST: "#8b5cf6",
    WITHDRAWAL_APPROVED: "#10b981",
    WITHDRAWAL_REJECTED: "#ef4444",
    COMMISSION_APPROVED: "#10b981",
    COMMISSION_PAID: "#10b981",
    ACCOUNT_ACTIVATED: "#10b981",
    SYSTEM_ANNOUNCEMENT: "#6b7280",
    NEW_REFERRAL: "#3b82f6",
    NEW_COMMISSION: "#f59e0b",
  };
  return colors[type] || "#6b7280";
};

export const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID");
};
