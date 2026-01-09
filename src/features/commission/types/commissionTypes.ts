export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface Commission {
  id: string;
  transactionId: string;
  from: string;
  level: number;
  amount: number;
  status: CommissionStatus;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
}

export interface CommissionSummary {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  withdrawn?: number; 
}

export interface CommissionPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CommissionResponse {
  transactions: Commission[];
  summary: CommissionSummary;
  pagination: CommissionPagination;
}

export interface StatusConfig {
  color: string;
  bg: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface UseCommissionReturn {
  commissions: Commission[];
  filteredCommissions: Commission[];
  summary: CommissionSummary | null;
  pagination: CommissionPagination | null;
  isLoading: boolean;
  error: string | null;
  searchValue: string;
  statusFilter: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  setSearchValue: (value: string) => void;
  setStatusFilter: (value: string | null) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  getStatusColor: (status: string) => string;
  getStatusBg: (status: string) => string;
  getStatusIcon: (status: string) => React.ComponentType<{ size?: number }> | null;
  pendingAmount: number;
  approvedAmount: number;
  refreshCommissions: () => Promise<void>;
}
