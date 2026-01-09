import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useApprovalStore,
  selectCommissions,
  selectIsLoading,
  selectError,
  selectSuccessMessage,
  selectPagination,
  selectSearch,
  selectSelectedIds,
  selectSelectAll,
  selectModals,
  selectFormState,
  selectLoadingStates,
  selectPendingStats,
  selectApprovedStats,
  selectRejectedStats,
  selectSelectedTotalAmount,
  formatCurrency,
  formatDate,
  getLevelColor,
} from "../../../features/commission";

export type { Commission, CommissionStats, StatsData, GroupedAffiliate, GroupedSummary } from "../../../features/commission";

export const useApproval = () => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commissions = useApprovalStore(selectCommissions);
  const groupedAffiliates = useApprovalStore((state) => state.groupedAffiliates);
  const groupedSummary = useApprovalStore((state) => state.groupedSummary);
  const isLoading = useApprovalStore(selectIsLoading);
  const error = useApprovalStore(selectError);
  const successMessage = useApprovalStore(selectSuccessMessage);
  const pagination = useApprovalStore(useShallow(selectPagination));
  const search = useApprovalStore(selectSearch);
  const selectedIds = useApprovalStore(selectSelectedIds);
  const selectAll = useApprovalStore(selectSelectAll);
  const modals = useApprovalStore(useShallow(selectModals));
  const formState = useApprovalStore(useShallow(selectFormState));
  const loadingStates = useApprovalStore(useShallow(selectLoadingStates));
  const pendingStats = useApprovalStore(useShallow(selectPendingStats));
  const approvedStats = useApprovalStore(useShallow(selectApprovedStats));
  const rejectedStats = useApprovalStore(useShallow(selectRejectedStats));
  const selectedTotalAmount = useApprovalStore(selectSelectedTotalAmount);

  const {
    fetchCommissions,
    setPage,
    setSearch: setSearchAction,
    setSearchDebounced,
    toggleSelection,
    setSelectAll,
    openApproveModal,
    closeApproveModal,
    openRejectModal,
    closeRejectModal,
    openBatchApproveModal,
    closeBatchApproveModal,
    setRejectReason,
    setAdminNotes,
    handleApprove,
    approveById,
    handleReject,
    handleBatchApprove,
    clearError,
    clearSuccessMessage,
  } = useApprovalStore();

  useEffect(() => {
    const { lastFetchTime, commissions } = useApprovalStore.getState();

    const isStale = !lastFetchTime || Date.now() - lastFetchTime > 5 * 60 * 1000;

    if (commissions.length === 0 || isStale) {
      fetchCommissions();
    }
  }, [fetchCommissions]);

  const setSearch = (value: string) => {
    setSearchAction(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setSearchDebounced(value);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    commissions,
    groupedAffiliates,
    groupedSummary,
    isLoading,
    error,
    successMessage,
    page: pagination.page,
    setPage,
    totalPages: pagination.totalPages,
    total: pagination.total,
    search,
    setSearch,
    selectedIds,
    selectAll,
    setSelectAll,
    toggleSelection,
    approveModalOpen: modals.approveModalOpen,
    setApproveModalOpen: (open: boolean) => (open ? null : closeApproveModal()),
    rejectModalOpen: modals.rejectModalOpen,
    setRejectModalOpen: (open: boolean) => (open ? null : closeRejectModal()),
    batchApproveModalOpen: modals.batchApproveModalOpen,
    setBatchApproveModalOpen: (open: boolean) =>
      open ? openBatchApproveModal() : closeBatchApproveModal(),
    selectedCommission: modals.selectedCommission,
    rejectReason: formState.rejectReason,
    setRejectReason,
    adminNotes: formState.adminNotes,
    setAdminNotes,
    isApproving: loadingStates.isApproving,
    isRejecting: loadingStates.isRejecting,
    isBatchApproving: loadingStates.isBatchApproving,
    handleRefresh: fetchCommissions,
    openApproveModal,
    openRejectModal,
    handleApprove,
    approveById,
    handleReject,
    handleBatchApprove,
    clearError,
    clearSuccessMessage,
    pendingStats,
    approvedStats,
    rejectedStats,
    formatCurrency,
    formatDate,
    getLevelColor,
    getSelectedTotalAmount: () => selectedTotalAmount,
  };
};
