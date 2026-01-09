export interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export interface WithdrawalFormData {
  amount: number | string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface WithdrawalConstants {
  MINIMUM_WITHDRAWAL: number;
  MAXIMUM_WITHDRAWAL: number;
  MINIMUM_BALANCE_REMAINING: number;
}

export interface BankOption {
  value: string;
  label: string;
  badge: string;
}
