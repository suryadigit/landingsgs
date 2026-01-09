import { useState, useCallback, useMemo } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
} from "../api";
import { notificationKeys, useRole } from "../../../shared/hooks";
import type { NotificationFilter, NotificationTypeFilter } from "../types/notificationPageTypes";
import { ITEMS_PER_PAGE } from "../constants/notificationConstants";

export const useNotificationPage = () => {
  const { isAdmin } = useRole();

  const [statusFilter, setStatusFilter] = useState<NotificationFilter>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("ALL");
  const [searchValue, setSearchValue] = useState("");

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: isAdmin 
      ? ["notifications", "admin-infinite", { statusFilter, typeFilter }]
      : ["notifications", "user-infinite", { statusFilter, typeFilter }],
    queryFn: async ({ pageParam }) => {
      const params = {
        limit: ITEMS_PER_PAGE,
        ...(pageParam && { cursor: pageParam }),
        ...(isAdmin && { showProcessed: true }),
        ...(typeFilter !== "ALL" && { type: typeFilter }),
      };
      
      const result = isAdmin
        ? await getAdminNotifications(params)
        : await getMyNotifications(params);
      
      return {
        notifications: result.notifications,
        nextCursor: result.pagination?.nextCursor || null,
        hasMore: result.pagination?.hasMore || false,
        unreadCount: result.unreadCount,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && lastPage.nextCursor) {
        return lastPage.nextCursor;
      }
      return undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000,
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

  const allNotifications = useMemo(() => {
    return data?.pages.flatMap((page) => page.notifications) ?? [];
  }, [data]);

  const filteredNotifications = useMemo(() => {
    let result = [...allNotifications];

    if (statusFilter === "unread") {
      result = result.filter((n) => !n.isRead);
    } else if (statusFilter === "read") {
      result = result.filter((n) => n.isRead);
    }

    if (typeFilter !== "ALL") {
      result = result.filter((n) => n.type === typeFilter);
    }

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

  const stats = useMemo(() => {
    return {
      total: allNotifications.length,
      unread: allNotifications.filter((n) => !n.isRead).length,
      read: allNotifications.filter((n) => n.isRead).length,
    };
  }, [allNotifications]);

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
    queryClient.resetQueries({ queryKey: ["notifications"] });
    refetch();
  }, [refetch, queryClient]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleStatusFilterChange = useCallback((value: NotificationFilter) => {
    setStatusFilter(value);
  }, []);

  const handleTypeFilterChange = useCallback((value: NotificationTypeFilter) => {
    setTypeFilter(value);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return {
    notifications: filteredNotifications,
    stats,
    isLoading,
    error: error?.message ?? null,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
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
  };
};
