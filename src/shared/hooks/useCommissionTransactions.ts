import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axios";

interface CommissionTransaction {
  id: string;
  transactionId: string;
  from: string;
  level: number;
  amount: number;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
}

interface APICommission {
  id: string;
  affiliateId: string;
  transactionId: string;
  userId: string;
  amount: number;
  level: number;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  buyerName: string;
  productName: string;
  sourceType: string;
  approvedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  receiver: {
    id: string;
    email: string;
    fullName: string;
  };
}

interface APIResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  summary: {
    total: number;
    pending: number;
    approved: number;
    paid: number;
    rejected: number;
    count: {
      total: number;
      pending: number;
      approved: number;
      paid: number;
      rejected: number;
    };
  };
  commissions: APICommission[];
}

interface CommissionTransactionsResponse {
  transactions: CommissionTransaction[];
  summary: { total: number; pending: number; approved: number; paid: number };
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const commissionTransactionKeys = {
  all: ["commissionTransactions"] as const,
  list: (params: { page?: number; limit?: number }) => [...commissionTransactionKeys.all, params] as const,
};

export const useCommissionTransactions = (params?: { page?: number; limit?: number }) => {
  return useQuery<CommissionTransactionsResponse>({
    queryKey: commissionTransactionKeys.list(params || {}),
    queryFn: async () => {
      const response = await axiosClient.get<APIResponse>("/v1/commissions/my", { params });
      const data = response.data;
      
      const allowedStatuses = ["PENDING", "APPROVED", "PAID", "REJECTED"] as const;
      const transactions: CommissionTransaction[] = (data.commissions || []).map((c) => {
        const status = (c.status || "").toUpperCase();
        return {
          id: c.id,
          transactionId: c.transactionId,
          from: c.buyerName,  
          level: c.level,
          amount: c.amount,
          status: allowedStatuses.includes(status as any) ? (status as CommissionTransaction["status"]) : "PENDING",
          createdAt: c.createdAt,
          approvedAt: c.approvedAt || undefined,
          paidAt: c.paidAt || undefined,
        };
      });

      return {
        transactions,
        summary: {
          total: data.summary?.total || 0,
          pending: data.summary?.pending || 0,
          approved: data.summary?.approved || 0,
          paid: data.summary?.paid || 0,
        },
        pagination: {
          page: data.page || 1,
          limit: data.limit || 20,
          total: data.total || 0,
          pages: Math.ceil((data.total || 0) / (data.limit || 20)),
        },
      };
    },
    staleTime: 30 * 1000,
  });
};
