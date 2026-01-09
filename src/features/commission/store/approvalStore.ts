import { create } from 'zustand';
import {
  approveCommission,
  batchApproveCommissions,
  rejectCommission,
  getPendingCommissionsGrouped,
} from '../api/commissionApi';

const fetchWithTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );
  return Promise.race([promise, timeout]);
};

export interface Commission {
  id: string;
  transactionId: string;
  affiliateCode: string;
  affiliateName: string;
  receiverName: string;
  receiverEmail: string;
  amount: number;
  level: number;
  status: string;
  buyerName: string;
  productName: string;
  sourceType: string;
  createdAt: string;
}

export interface GroupedAffiliate {
  affiliateId: string;
  affiliateCode: string;
  affiliateName: string;
  affiliateEmail: string;
  totalPending: number;
  totalAmount: number;
  commissions: Commission[];
}

export interface GroupedSummary {
  totalAffiliates: number;
  totalPendingCount: number;
  totalPendingAmount: number;
}

export interface CommissionStats {
  count: number;
  amount: number;
}

export interface StatsData {
  byStatus?: {
    pending?: CommissionStats;
    approved?: CommissionStats;
    rejected?: CommissionStats;
  };
  pending?: CommissionStats;
  approved?: CommissionStats;
  rejected?: CommissionStats;
}

interface ApprovalState {
  commissions: Commission[];
  groupedAffiliates: GroupedAffiliate[];
  groupedSummary: GroupedSummary | null;
  stats: StatsData | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  page: number;
  limit: number;
  total: number;
  search: string;
  searchDebounced: string;
  selectedIds: string[];
  selectAll: boolean;
  approveModalOpen: boolean;
  rejectModalOpen: boolean;
  batchApproveModalOpen: boolean;
  selectedCommission: Commission | null;
  rejectReason: string;
  adminNotes: string;
  isApproving: boolean;
  isRejecting: boolean;
  isBatchApproving: boolean;
  lastFetchTime: number | null;
}

interface ApprovalActions {
  fetchCommissions: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setSearchDebounced: (search: string) => void;
  toggleSelection: (id: string) => void;
  setSelectAll: (selectAll: boolean) => void;
  clearSelection: () => void;
  openApproveModal: (commission: Commission) => void;
  closeApproveModal: () => void;
  openRejectModal: (commission: Commission) => void;
  closeRejectModal: () => void;
  openBatchApproveModal: () => void;
  closeBatchApproveModal: () => void;
  setRejectReason: (reason: string) => void;
  setAdminNotes: (notes: string) => void;
  handleApprove: () => Promise<void>;
  approveById: (commissionId: string) => Promise<void>;
  handleReject: () => Promise<void>;
  handleBatchApprove: () => Promise<void>;
  clearError: () => void;
  clearSuccessMessage: () => void;
  reset: () => void;
}

type ApprovalStore = ApprovalState & ApprovalActions;

const initialState: ApprovalState = {
  commissions: [],
  groupedAffiliates: [],
  groupedSummary: null,
  stats: null,
  isLoading: false,
  error: null,
  successMessage: null,
  page: 1,
  limit: 20,
  total: 0,
  search: '',
  searchDebounced: '',
  selectedIds: [],
  selectAll: false,
  approveModalOpen: false,
  rejectModalOpen: false,
  batchApproveModalOpen: false,
  selectedCommission: null,
  rejectReason: '',
  adminNotes: '',
  isApproving: false,
  isRejecting: false,
  isBatchApproving: false,
  lastFetchTime: null,
};

export const useApprovalStore = create<ApprovalStore>((set, get) => ({
  ...initialState,

  fetchCommissions: async () => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const response = await fetchWithTimeout(getPendingCommissionsGrouped(), 10000);

      const affiliates: GroupedAffiliate[] = response?.affiliates || [];
      const summary: GroupedSummary = response?.summary || {
        totalAffiliates: affiliates.length,
        totalPendingCount: 0,
        totalPendingAmount: 0,
      };

      const allCommissions: Commission[] = affiliates.flatMap((affiliate: GroupedAffiliate) =>
        affiliate.commissions.map((comm: any) => ({
          ...comm,
          affiliateCode: affiliate.affiliateCode,
          affiliateName: affiliate.affiliateName,
          receiverEmail: affiliate.affiliateEmail,
          receiverName: affiliate.affiliateName,
          status: 'PENDING',
        }))
      );

      const statsData: StatsData = {
        byStatus: {
          pending: {
            count: summary.totalPendingCount,
            amount: summary.totalPendingAmount
          },
          approved: { count: 0, amount: 0 },
          rejected: { count: 0, amount: 0 },
        }
      };

      set({
        groupedAffiliates: affiliates,
        groupedSummary: summary,
        stats: statsData,
        commissions: allCommissions,
        total: summary.totalPendingCount,
        isLoading: false,
        lastFetchTime: Date.now(),
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || err.message || 'Failed to fetch commissions',
        commissions: [],
        groupedAffiliates: [],
        isLoading: false,
      });
    }
  },

  setPage: (page) => {
    set({ page });
    get().fetchCommissions();
  },

  setSearch: (search) => {
    set({ search });
  },

  setSearchDebounced: (searchDebounced) => {
    set({ searchDebounced, page: 1 });
    get().fetchCommissions();
  },

  toggleSelection: (id) => {
    const { selectedIds } = get();
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    set({ selectedIds: newSelectedIds, selectAll: false });
  },

  setSelectAll: (selectAll) => {
    const { commissions } = get();
    set({
      selectAll,
      selectedIds: selectAll ? commissions.map((c) => c.id) : [],
    });
  },

  clearSelection: () => {
    set({ selectedIds: [], selectAll: false });
  },

  openApproveModal: (commission) => {
    set({
      selectedCommission: commission,
      adminNotes: '',
      approveModalOpen: true,
    });
  },

  closeApproveModal: () => {
    set({
      approveModalOpen: false,
      selectedCommission: null,
      adminNotes: '',
    });
  },

  openRejectModal: (commission) => {
    set({
      selectedCommission: commission,
      rejectReason: '',
      rejectModalOpen: true,
    });
  },

  closeRejectModal: () => {
    set({
      rejectModalOpen: false,
      selectedCommission: null,
      rejectReason: '',
    });
  },

  openBatchApproveModal: () => {
    set({ batchApproveModalOpen: true });
  },

  closeBatchApproveModal: () => {
    set({ batchApproveModalOpen: false });
  },

  setRejectReason: (rejectReason) => set({ rejectReason }),
  setAdminNotes: (adminNotes) => set({ adminNotes }),

  handleApprove: async () => {
    const { selectedCommission } = get();
    if (!selectedCommission) return;

    set({ isApproving: true });

    try {
      await approveCommission(selectedCommission.id);
      set({
        successMessage: `✅ Komisi untuk ${selectedCommission.receiverName} berhasil di-approve!`,
        approveModalOpen: false,
        selectedCommission: null,
        isApproving: false,
      });

      get().fetchCommissions();
      setTimeout(() => set({ successMessage: null }), 5000);
    } catch (err: any) {
      set({
        error: err.response?.data?.error || err.message || 'Failed to approve commission',
        isApproving: false,
      });
    }
  },

  approveById: async (commissionId: string, adminNotes?: string) => {
    await approveCommission(commissionId, adminNotes || 'Approved by admin');
  },

  handleReject: async () => {
    const { selectedCommission, rejectReason } = get();
    if (!selectedCommission || !rejectReason.trim()) return;

    set({ isRejecting: true });

    try {
      await rejectCommission(selectedCommission.id, rejectReason);
      set({
        successMessage: `❌ Komisi untuk ${selectedCommission.receiverName} telah di-reject`,
        rejectModalOpen: false,
        selectedCommission: null,
        rejectReason: '',
        isRejecting: false,
      });

      get().fetchCommissions();
      setTimeout(() => set({ successMessage: null }), 5000);
    } catch (err: any) {
      set({
        error: err.response?.data?.error || err.message || 'Failed to reject commission',
        isRejecting: false,
      });
    }
  },

  handleBatchApprove: async () => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;

    set({ isBatchApproving: true });

    try {
      const response = await batchApproveCommissions(selectedIds);
      set({
        successMessage: `✅ Batch approval selesai: ${response.summary?.approved || selectedIds.length} komisi di-approve`,
        batchApproveModalOpen: false,
        selectedIds: [],
        selectAll: false,
        isBatchApproving: false,
      });

      get().fetchCommissions();
      setTimeout(() => set({ successMessage: null }), 5000);
    } catch (err: any) {
      set({
        error: err.response?.data?.error || err.message || 'Failed to batch approve',
        isBatchApproving: false,
      });
    }
  },

  clearError: () => set({ error: null }),
  clearSuccessMessage: () => set({ successMessage: null }),
  reset: () => set(initialState),
}));

export const selectCommissions = (state: ApprovalStore) => state.commissions;
export const selectStats = (state: ApprovalStore) => state.stats;
export const selectIsLoading = (state: ApprovalStore) => state.isLoading;
export const selectError = (state: ApprovalStore) => state.error;
export const selectSuccessMessage = (state: ApprovalStore) => state.successMessage;
export const selectPagination = (state: ApprovalStore) => ({
  page: state.page,
  limit: state.limit,
  total: state.total,
  totalPages: Math.ceil(state.total / state.limit),
});
export const selectSearch = (state: ApprovalStore) => state.search;
export const selectSelectedIds = (state: ApprovalStore) => state.selectedIds;
export const selectSelectAll = (state: ApprovalStore) => state.selectAll;
export const selectModals = (state: ApprovalStore) => ({
  approveModalOpen: state.approveModalOpen,
  rejectModalOpen: state.rejectModalOpen,
  batchApproveModalOpen: state.batchApproveModalOpen,
  selectedCommission: state.selectedCommission,
});
export const selectFormState = (state: ApprovalStore) => ({
  rejectReason: state.rejectReason,
  adminNotes: state.adminNotes,
});
export const selectLoadingStates = (state: ApprovalStore) => ({
  isApproving: state.isApproving,
  isRejecting: state.isRejecting,
  isBatchApproving: state.isBatchApproving,
});

export const selectPendingStats = (state: ApprovalStore) => {
  const stats = state.stats;
  return stats?.byStatus?.pending ||
         stats?.pending ||
         { count: state.commissions.length, amount: state.commissions.reduce((s, c) => s + c.amount, 0) };
};

export const selectApprovedStats = (state: ApprovalStore) => {
  const stats = state.stats;
  return stats?.byStatus?.approved || stats?.approved || { count: 0, amount: 0 };
};

export const selectRejectedStats = (state: ApprovalStore) => {
  const stats = state.stats;
  return stats?.byStatus?.rejected || stats?.rejected || { count: 0, amount: 0 };
};

export const selectSelectedTotalAmount = (state: ApprovalStore) =>
  state.commissions
    .filter((c) => state.selectedIds.includes(c.id))
    .reduce((sum, c) => sum + c.amount, 0);

export const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getLevelColor = (level: number) => {
  const colors = ['blue', 'green', 'orange', 'pink', 'grape', 'cyan', 'teal', 'indigo', 'violet', 'lime'];
  return colors[(level - 1) % colors.length];
};
