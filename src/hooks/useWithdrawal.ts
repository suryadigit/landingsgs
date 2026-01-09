import { useState, useEffect, useRef, useCallback } from 'react';
import {
  requestWithdrawal,
  getWithdrawalHistory,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  completeWithdrawal,
} from '../api/withdrawal';
import { getCommissionSummary } from '../api/commission';

export interface WithdrawalData {
  id: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  bankName: string;
  accountNumberMasked: string;
  accountHolder: string;
  createdAt: string;
}

export interface CommissionSummary {
  totalEarnings: number;
  totalPaid: number;
  totalPending: number;
  totalApproved: number;
}

/**
 * Hook for user withdrawal operations
 */
export const useWithdrawal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const request = useCallback(
    async (data: {
      amount: number;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    }) => {
      try {
        abortControllerRef.current = new AbortController();
        setLoading(true);
        setError(null);
        const response = await requestWithdrawal(data);
        return response;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        const errorMessage = err.response?.data?.message || 'Failed to request withdrawal';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getHistory = async (params?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWithdrawalHistory(params);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to get withdrawal history';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    request,
    getHistory,
    loading,
    error,
  };
};

/**
 * Hook for admin withdrawal operations
 */
export const useWithdrawalAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPending = async (params?: {
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingWithdrawals(params);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to get pending withdrawals';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approve = async (withdrawalId: string, notes?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await approveWithdrawal(withdrawalId, { notes });
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to approve withdrawal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reject = async (withdrawalId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rejectWithdrawal(withdrawalId, { reason });
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject withdrawal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const complete = async (withdrawalId: string, transferReference: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await completeWithdrawal(withdrawalId, { transferReference });
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to complete withdrawal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getPending,
    approve,
    reject,
    complete,
    loading,
    error,
  };
};

/**
 * Hook for getting commission summary and withdrawal availability
 */
export const useWithdrawalAvailability = () => {
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCommissionSummary();
        setSummary(response.data);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        const errorMessage = err.response?.data?.message || 'Failed to fetch commission summary';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();

    return () => abortController.abort();
  }, []);

  return {
    summary,
    loading,
    error,
    availableBalance: summary?.totalPaid || 0,
  };
};
