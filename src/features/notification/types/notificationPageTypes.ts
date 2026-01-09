export type NotificationFilter = "all" | "unread" | "read";
export type NotificationTypeFilter = 
  | "ALL"
  | "WITHDRAWAL_REQUEST"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_REJECTED"
  | "COMMISSION_APPROVED"
  | "COMMISSION_PAID"
  | "ACCOUNT_ACTIVATED"
  | "SYSTEM_ANNOUNCEMENT"
  | "NEW_REFERRAL"
  | "NEW_COMMISSION";

export interface NotificationStatsData {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationTypeOption {
  value: NotificationTypeFilter;
  label: string;
}

export interface StatusFilterOption {
  value: NotificationFilter;
  label: string;
}
