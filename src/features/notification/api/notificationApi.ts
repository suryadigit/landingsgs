import axiosClient from "../../../shared/api/axios";

const BASE_URL = "/v1/notifications";

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
  total?: number;
  totalPages?: number;
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface GetNotificationsResponse {
  total?: number;
  message: string;
  notifications: Notification[];
  unreadCount: number;
  pendingCount?: number;
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  cursor?: string | null;
  type?: NotificationType;
}

export const getMyNotifications = async (params?: NotificationParams): Promise<GetNotificationsResponse> => {
  const response = await axiosClient.get(BASE_URL, {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      unreadOnly: params?.unreadOnly || false,
      ...(params?.cursor && { cursor: params.cursor }),
      ...(params?.type && { type: params.type }),
    },
  });
  return response.data;
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await axiosClient.get(`${BASE_URL}/unread-count`);
  return response.data;
};

export const markAsRead = async (notificationId: string): Promise<{ message: string }> => {
  const response = await axiosClient.patch(`${BASE_URL}/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async (): Promise<{ message: string }> => {
  const response = await axiosClient.patch(`${BASE_URL}/read-all`);
  return response.data;
};

export const getNotificationById = async (notificationId: string): Promise<{ message: string; notification: Notification }> => {
  const response = await axiosClient.get(`${BASE_URL}/${notificationId}`);
  return response.data;
};

export const deleteNotification = async (notificationId: string): Promise<{ message: string }> => {
  const response = await axiosClient.delete(`${BASE_URL}/${notificationId}`);
  return response.data;
};

export const getAllNotifications = async (params?: NotificationParams): Promise<GetNotificationsResponse> => {
  const response = await axiosClient.get(`${BASE_URL}/admin/all`, {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 50,
      ...(params?.type && { type: params.type }),
    },
  });
  return response.data;
};

export const getAdminNotifications = async (params?: NotificationParams & { showProcessed?: boolean }): Promise<GetNotificationsResponse> => {
  const response = await axiosClient.get(`${BASE_URL}/admin/inbox`, {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      pendingOnly: params?.showProcessed ? "false" : "true",
      ...(params?.cursor && { cursor: params.cursor }),
      ...(params?.type && { type: params.type }),
    },
  });
  return response.data;
};

export const sendNotificationToUser = async (data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}): Promise<{ message: string; notification: Notification }> => {
  const response = await axiosClient.post(`${BASE_URL}/admin/send`, data);
  return response.data;
};

export const sendBroadcastNotification = async (data: {
  title: string;
  message: string;
  data?: Record<string, any>;
}): Promise<{ message: string; count: number }> => {
  const response = await axiosClient.post(`${BASE_URL}/admin/broadcast`, data);
  return response.data;
};
