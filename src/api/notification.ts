import axiosClient from "./apis";

const NOTIFICATION_BASE_URL = "/v1/notifications";

// ==================== TYPES ====================

export type NotificationType =
  | "WITHDRAWAL_REQUEST"
  | "ACTIVATION_REQUEST"
  | "SUPPORT_REQUEST"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_REJECTED"
  | "COMMISSION_APPROVED"
  | "COMMISSION_PAID"
  | "ACCOUNT_ACTIVATED"
  | "SYSTEM_ANNOUNCEMENT"
  | "NEW_REFERRAL"
  | "NEW_COMMISSION";

export interface NotificationUser {
  id: string;
  fullName: string | null;
  email: string;
  role?: string;
}

export interface Notification {
  id: string;
  userId: string;
  fromUserId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any> | null;
  isRead: boolean;
  readAt: string | null;
  isProcessed: boolean;
  processedAt: string | null;
  createdAt: string;
  fromUser?: NotificationUser | null;
  user?: NotificationUser;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetNotificationsResponse {
  message: string;
  notifications: Notification[];
  unreadCount: number;
  pendingCount?: number; // For admin - count of unprocessed request notifications
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// ==================== USER ENDPOINTS ====================

/**
 * Get my notifications
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - unreadOnly: Filter unread only (default: false)
 */
export const getMyNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<GetNotificationsResponse> => {
  try {
    const response = await axiosClient.get(NOTIFICATION_BASE_URL, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        unreadOnly: params?.unreadOnly || false,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get unread notification count (for badge)
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  try {
    const response = await axiosClient.get(
      `${NOTIFICATION_BASE_URL}/unread-count`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark single notification as read
 */
export const markAsRead = async (
  notificationId: string
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.patch(
      `${NOTIFICATION_BASE_URL}/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.patch(
      `${NOTIFICATION_BASE_URL}/read-all`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  notificationId: string
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.delete(
      `${NOTIFICATION_BASE_URL}/${notificationId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all notifications (admin view)
 */
export const getAllNotifications = async (params?: {
  page?: number;
  limit?: number;
  type?: NotificationType;
}): Promise<GetNotificationsResponse> => {
  try {
    const response = await axiosClient.get(`${NOTIFICATION_BASE_URL}/admin/all`, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 50,
        ...(params?.type && { type: params.type }),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
/**
 * Get admin inbox notifications (requests from users)
 * 
 * @param showProcessed - If true, includes already processed notifications (approved/rejected)
 */
export const getAdminNotifications = async (params?: {
  page?: number;
  limit?: number;
  showProcessed?: boolean;
}): Promise<GetNotificationsResponse> => {
  try {
    const response = await axiosClient.get(
      `${NOTIFICATION_BASE_URL}/admin/inbox`,
      {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          showProcessed: params?.showProcessed ? "true" : "false",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send notification to specific user (admin)
 */
export const sendNotificationToUser = async (data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}): Promise<{ message: string; notification: Notification }> => {
  try {
    const response = await axiosClient.post(
      `${NOTIFICATION_BASE_URL}/admin/send`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Broadcast notification to all users (admin)
 */
export const sendBroadcastNotification = async (data: {
  title: string;
  message: string;
  data?: Record<string, any>;
}): Promise<{ message: string; count: number }> => {
  try {
    const response = await axiosClient.post(
      `${NOTIFICATION_BASE_URL}/admin/broadcast`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
