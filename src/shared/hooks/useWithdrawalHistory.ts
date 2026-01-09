import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getWithdrawalHistory } from "../../features/withdrawal/api/withdrawalApi";

interface WithdrawalHistoryItem {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  createdAt: string;
  processedAt?: string;
  rejectionReason?: string;
  // Normalized timestamps from API (mapped in queryFn)
  requestedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  notes?: string;
}

interface WithdrawalHistoryResponse {
  availableBalance: number;
  withdrawalHistory: WithdrawalHistoryItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const withdrawalKeys = {
  all: ["withdrawal"] as const,
  history: (params?: { page?: number; limit?: number }) => [...withdrawalKeys.all, "history", params] as const,
};

export const useWithdrawalHistory = (params?: { page?: number; limit?: number }) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery<WithdrawalHistoryResponse>({
    queryKey: withdrawalKeys.history(params),
    queryFn: async () => {
      const response = await getWithdrawalHistory(params);
      const available = response?.balance?.availableBalance ?? response?.balance?.availableForWithdrawal ?? response?.availableBalance ?? 0;
      const withdrawals = response?.withdrawals ?? response?.withdrawalHistory ?? [];

      const normalized = {
        availableBalance: available,
        withdrawalHistory: (withdrawals || []).map((w: any) => ({
          id: w.id,
          amount: w.amount,
          bankName: w.bankName,
          accountNumber: w.accountNumber || "",
          accountHolder: w.accountHolder || "",
          status: (w.status || "").toUpperCase(),
          requestedAt: w.requestedAt || w.createdAt || undefined,
          approvedAt: w.approvedAt || undefined,
          completedAt: w.completedAt || undefined,
          notes: w.notes || "",
        })),
      } as WithdrawalHistoryResponse;

      return normalized;
    },
    staleTime: 30 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });

  const withdrawal = {
    availableBalance: data?.availableBalance ?? 0,
    withdrawalHistory: data?.withdrawalHistory ?? [],
  };

  const refreshWithdrawal = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const startListening = useCallback(() => {
    queryClient.setQueryDefaults(withdrawalKeys.history(params), {
      refetchInterval: 2 * 60 * 1000,
    });
  }, [queryClient, params]);

  const stopListening = useCallback(() => {
    queryClient.setQueryDefaults(withdrawalKeys.history(params), {
      refetchInterval: false,
    });
  }, [queryClient, params]);

  return {
    withdrawal,
    loading,
    refreshWithdrawal,
    startListening,
    stopListening,
  };
};
