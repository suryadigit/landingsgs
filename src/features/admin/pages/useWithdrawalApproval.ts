import { useState, useEffect, useCallback } from "react";
import {
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  completeWithdrawal,
} from "../../../features/withdrawal";

export interface WithdrawalRequest {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountName?: string;
  fee?: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  createdAt: string;
  requestedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
  transferReference?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  affiliateCode?: string;
}

export interface WithdrawalStats {
  pending: { count: number; amount: number };
  approved: { count: number; amount: number };
  completed: { count: number; amount: number };
  rejected: { count: number; amount: number };
}

export const useWithdrawalApproval = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAllState] = useState(false);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);

  const [rejectReason, setRejectReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [transferReference, setTransferReference] = useState("");

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [stats, setStats] = useState<WithdrawalStats>({
    pending: { count: 0, amount: 0 },
    approved: { count: 0, amount: 0 },
    completed: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 },
  });

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPendingWithdrawals({
        page,
        limit: 20,
      });

      console.log("=== Withdrawal API Response ===", response);

      const data = response.withdrawals || response.data || [];
      setWithdrawals(data);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || data.length);

      if (response.stats) {
        setStats(response.stats);
      } else {
        const pending = data.filter((w: WithdrawalRequest) => w.status === "PENDING");
        setStats((prev) => ({
          ...prev,
          pending: {
            count: pending.length,
            amount: pending.reduce((sum: number, w: WithdrawalRequest) => sum + w.amount, 0),
          },
        }));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal memuat data withdrawal");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleRefresh = () => {
    setSelectedIds([]);
    setSelectAllState(false);
    fetchWithdrawals();
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const setSelectAll = (checked: boolean) => {
    setSelectAllState(checked);
    if (checked) {
      setSelectedIds(withdrawals.map((w) => w.id));
    } else {
      setSelectedIds([]);
    }
  };

  const openApproveModal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setAdminNotes("");
    setApproveModalOpen(true);
  };

  const openRejectModal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const openCompleteModal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setTransferReference("");
    setCompleteModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    setIsApproving(true);
    try {
      await approveWithdrawal(selectedWithdrawal.id, {
        notes: adminNotes || undefined,
      });

      setSuccessMessage(
        `Withdrawal Rp ${selectedWithdrawal.amount.toLocaleString("id-ID")} untuk ${selectedWithdrawal.userName || selectedWithdrawal.accountHolder} berhasil di-approve!`
      );
      setApproveModalOpen(false);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal approve withdrawal");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectReason.trim()) return;

    setIsRejecting(true);
    try {
      await rejectWithdrawal(selectedWithdrawal.id, {
        reason: rejectReason,
      });

      setSuccessMessage(
        `Withdrawal Rp ${selectedWithdrawal.amount.toLocaleString("id-ID")} untuk ${selectedWithdrawal.userName || selectedWithdrawal.accountHolder} berhasil di-reject`
      );
      setRejectModalOpen(false);
      setSelectedWithdrawal(null);
      setRejectReason("");
      fetchWithdrawals();
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal reject withdrawal");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedWithdrawal || !transferReference.trim()) return;

    setIsCompleting(true);
    try {
      await completeWithdrawal(selectedWithdrawal.id, {
        transferReference,
      });

      setSuccessMessage(
        `Withdrawal Rp ${selectedWithdrawal.amount.toLocaleString("id-ID")} untuk ${selectedWithdrawal.userName || selectedWithdrawal.accountHolder} berhasil diselesaikan!`
      );
      setCompleteModalOpen(false);
      setSelectedWithdrawal(null);
      setTransferReference("");
      fetchWithdrawals();
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal menyelesaikan withdrawal");
    } finally {
      setIsCompleting(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      w.accountHolder?.toLowerCase().includes(searchLower) ||
      w.bankName?.toLowerCase().includes(searchLower) ||
      w.accountNumber?.includes(search) ||
      w.userName?.toLowerCase().includes(searchLower) ||
      w.userEmail?.toLowerCase().includes(searchLower) ||
      w.affiliateCode?.toLowerCase().includes(searchLower)
    );
  });

  const getSelectedTotalAmount = () => {
    return withdrawals
      .filter((w) => selectedIds.includes(w.id))
      .reduce((sum, w) => sum + w.amount, 0);
  };

  return {
    withdrawals: filteredWithdrawals,
    isLoading,
    error,
    successMessage,
    stats,
    page,
    setPage,
    totalPages,
    totalItems,
    search,
    setSearch,
    selectedIds,
    selectAll,
    setSelectAll,
    toggleSelection,
    getSelectedTotalAmount,
    approveModalOpen,
    setApproveModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    completeModalOpen,
    setCompleteModalOpen,
    selectedWithdrawal,
    rejectReason,
    setRejectReason,
    adminNotes,
    setAdminNotes,
    transferReference,
    setTransferReference,
    isApproving,
    isRejecting,
    isCompleting,
    handleRefresh,
    openApproveModal,
    openRejectModal,
    openCompleteModal,
    handleApprove,
    handleReject,
    handleComplete,
    clearError,
    clearSuccessMessage,
    formatCurrency,
    formatDate,
  };
};
