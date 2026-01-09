export interface CommissionData {
  id?: string;
  level?: number;
  amount: number;
  date?: string;
  status?: string;
}

export interface CommissionFromReferral {
  total: number;
  pending: number;
  approved: number;
  transactions: number;
}

export interface RawReferralData {
  id: string;
  name: string;
  code: string;
  level?: number | string;
  status: string;
  joinDate?: string;
  registeredAt?: string;
  totalEarnings?: number;
  email?: string;
  pendingEarnings?: number;
  approvedEarnings?: number;
  subReferrals?: RawReferralData[];
  subReferralCount?: number;
  referrals?: RawReferralData[];
  commissions?: CommissionData[];
  commissionFromThisReferral?: CommissionFromReferral;
}

export interface TransformedReferral {
  id: string;
  name: string;
  code: string;
  level: string;
  status: 'Active' | 'Pending';
  earnings: string;
  totalEarnings: number;
  registered: string;
  subReferrals: number;
  subReferralsList: RawReferralData[];
  commissions: CommissionData[];
  commissionFromThisReferral?: CommissionFromReferral;
}

export interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  activeCount: number;
  pendingCount: number;
}

export interface UseReferralReturn {
  referrals: TransformedReferral[];
  filteredReferrals: TransformedReferral[];
  paginatedReferrals: TransformedReferral[];
  levelOptions: Array<{ value: string; label: string }>;
  loading: boolean;
  error: string | null;
  searchValue: string;
  statusFilter: string | null;
  levelFilter: string | null;
  expandedRows: string[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setSearchValue: (value: string) => void;
  setStatusFilter: (value: string | null) => void;
  setLevelFilter: (value: string | null) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  toggleRow: (id: string) => void;
  stats: ReferralStats;
}

export interface StatusColorConfig {
  color: string;
  bgColor: string;
}
