import { create } from "zustand";
import {
  approveCommission,
  batchApproveCommissions,
  rejectCommission,
  getPendingCommissionsGrouped,
} from "../api/commission";

// Helper: fetch with timeout
const fetchWithTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
  );
  return Promise.race([promise, timeout]);
};

// ============================================
// Types
// ============================================

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

// Grouped affiliate data from new API
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
  // Alternative flat structure
  pending?: CommissionStats;
  approved?: CommissionStats;
  rejected?: CommissionStats;
}

interface ApprovalState {
  // Data
  commissions: Commission[];
  groupedAffiliates: GroupedAffiliate[];
  groupedSummary: GroupedSummary | null;
  stats: StatsData | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Pagination
  page: number;
  limit: number;
  total: number;

  // Search
  search: string;
  searchDebounced: string;

  // Selection
  selectedIds: string[];
  selectAll: boolean;

  // Modal states
  approveModalOpen: boolean;
  rejectModalOpen: boolean;
  batchApproveModalOpen: boolean;
  selectedCommission: Commission | null;

  // Form states
  rejectReason: string;
  adminNotes: string;

  // Loading states
  isApproving: boolean;
  isRejecting: boolean;
  isBatchApproving: boolean;

  // Last fetch timestamp untuk caching
  lastFetchTime: number | null;
}

interface ApprovalActions {
  // Data actions
  fetchCommissions: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setSearchDebounced: (search: string) => void;

  // Selection actions
  toggleSelection: (id: string) => void;
  setSelectAll: (selectAll: boolean) => void;
  clearSelection: () => void;

  // Modal actions
  openApproveModal: (commission: Commission) => void;
  closeApproveModal: () => void;
  openRejectModal: (commission: Commission) => void;
  closeRejectModal: () => void;
  openBatchApproveModal: () => void;
  closeBatchApproveModal: () => void;

  // Form actions
  setRejectReason: (reason: string) => void;
  setAdminNotes: (notes: string) => void;

  // API actions
  handleApprove: () => Promise<void>;
  approveById: (commissionId: string) => Promise<void>;
  handleReject: () => Promise<void>;
  handleBatchApprove: () => Promise<void>;

  // Message actions
  clearError: () => void;
  clearSuccessMessage: () => void;

  // Reset
  reset: () => void;
}

type ApprovalStore = ApprovalState & ApprovalActions;

// ============================================
// Initial State
// ============================================

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

  search: "",
  searchDebounced: "",

  selectedIds: [],
  selectAll: false,

  approveModalOpen: false,
  rejectModalOpen: false,
  batchApproveModalOpen: false,
  selectedCommission: null,

  rejectReason: "",
  adminNotes: "",

  isApproving: false,
  isRejecting: false,
  isBatchApproving: false,

  lastFetchTime: null,
};

// ============================================
// Store
// ============================================

export const useApprovalStore = create<ApprovalStore>((set, get) => ({
  ...initialState,

  // ============================================
  // Data Actions
  // ============================================

  fetchCommissions: async () => {
    const { isLoading } = get();

    // Prevent duplicate fetches
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      // Gunakan endpoint baru yang sudah di-group per affiliate
      const response = await fetchWithTimeout(
        getPendingCommissionsGrouped(), 
        10000
      );

      // Debug: log full response structure
      console.log("🔍 Grouped API Response:", JSON.stringify(response, null, 2));

      // Parse response dari /api/v1/commissions/admin/pending-grouped
      const affiliates: GroupedAffiliate[] = response?.affiliates || [];
      const summary: GroupedSummary = response?.summary || {
        totalAffiliates: affiliates.length,
        totalPendingCount: 0,
        totalPendingAmount: 0,
      };

      // Flatten commissions untuk backward compatibility
      const allCommissions: Commission[] = affiliates.flatMap((affiliate: GroupedAffiliate) =>
        affiliate.commissions.map((comm: any) => ({
          ...comm,
          affiliateCode: affiliate.affiliateCode,
          affiliateName: affiliate.affiliateName,
          receiverEmail: affiliate.affiliateEmail,
          receiverName: affiliate.affiliateName,
          status: "PENDING",
        }))
      );

      // Build stats from summary
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

      console.log("✅ Grouped affiliates:", affiliates.length);
      console.log("✅ Total commissions:", allCommissions.length);
      console.log("✅ Summary:", summary);

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
      console.error("❌ Fetch pending commissions error:", err);
      set({
        error: err.response?.data?.error || err.message || "Failed to fetch commissions",
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

  // ============================================
  // Selection Actions
  // ============================================

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

  // ============================================
  // Modal Actions
  // ============================================

  openApproveModal: (commission) => {
    set({
      selectedCommission: commission,
      adminNotes: "",
      approveModalOpen: true,
    });
  },

  closeApproveModal: () => {
    set({
      approveModalOpen: false,
      selectedCommission: null,
      adminNotes: "",
    });
  },

  openRejectModal: (commission) => {
    set({
      selectedCommission: commission,
      rejectReason: "",
      rejectModalOpen: true,
    });
  },

  closeRejectModal: () => {
    set({
      rejectModalOpen: false,
      selectedCommission: null,
      rejectReason: "",
    });
  },

  openBatchApproveModal: () => {
    set({ batchApproveModalOpen: true });
  },

  closeBatchApproveModal: () => {
    set({ batchApproveModalOpen: false });
  },

  // ============================================
  // Form Actions
  // ============================================

  setRejectReason: (rejectReason) => set({ rejectReason }),
  setAdminNotes: (adminNotes) => set({ adminNotes }),

  // ============================================
  // API Actions
  // ============================================

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

      // Refresh data
      get().fetchCommissions();

      // Clear success message after 5 seconds
      setTimeout(() => set({ successMessage: null }), 5000);
    } catch (err: any) {
      set({
        error: err.response?.data?.error || err.message || "Failed to approve commission",
        isApproving: false,
      });
    }
  },

  // Approve by ID langsung tanpa modal
  approveById: async (commissionId: string, adminNotes?: string) => {
    try {
      await approveCommission(commissionId, adminNotes || "Approved by admin");
      // Tidak perlu set success message untuk setiap item (akan di-handle di caller)
    } catch (err: any) {
      throw err; // Re-throw untuk ditangani di caller
    }
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
        rejectReason: "",
        isRejecting: false,
      });

      get().fetchCommissions();
      setTimeout(() => set({ successMessage: null }), 5000);
    } catch (err: any) {
      set({
        error: err.response?.data?.error || err.message || "Failed to reject commission",
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
        error: err.response?.data?.error || err.message || "Failed to batch approve",
        isBatchApproving: false,
      });
    }
  },

  // ============================================
  // Message Actions
  // ============================================

  clearError: () => set({ error: null }),
  clearSuccessMessage: () => set({ successMessage: null }),

  // ============================================
  // Reset
  // ============================================

  reset: () => set(initialState),
}));

// ============================================
// Selectors (untuk optimasi re-render)
// ============================================

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

// Computed selectors - handle berbagai struktur response
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

// ============================================
// Utility Functions (di luar store)
// ============================================

export const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getLevelColor = (level: number) => {
  const colors = ["blue", "green", "orange", "pink", "grape", "cyan", "teal", "indigo", "violet", "lime"];
  return colors[(level - 1) % colors.length];
};
