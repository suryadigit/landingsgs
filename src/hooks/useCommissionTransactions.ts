import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getCommissionTransactions } from '../api/commissionTransaction';

/**
 * Commission transaction data structure from API
 */
export interface CommissionTransaction {
  id: string;
  transactionId: string;
  from: string;
  level: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
}

export interface CommissionSummary {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  withdrawn: number;
}

export interface CommissionTransactionsResponse {
  transactions: CommissionTransaction[];
  summary: CommissionSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UseCommissionTransactionsParams {
  page?: number;
  limit?: number;
}

/**
 * Hook untuk fetch commission transactions dengan caching via React Query
 * - Menggunakan React Query dengan aggressive caching
 * - Automatic refetch di background
 * - Error handling built-in
 * - Data persisted selama navigasi
 * 
 * Features:
 * - Cache data 30 detik (staleTime)
 * - Keep cache 5 menit (gcTime)
 * - Auto-refetch setiap 3 menit
 * - Refetch saat window fokus
 * - Retry 2x dengan exponential backoff
 */
export const useCommissionTransactions = (
  params: UseCommissionTransactionsParams = { page: 1, limit: 20 }
): UseQueryResult<CommissionTransactionsResponse, Error> => {
  return useQuery<CommissionTransactionsResponse, Error>({
    queryKey: ['commission-transactions', params.page, params.limit],
    queryFn: async () => {
      try {
        console.log('📡 Fetching commission transactions...', params);
        const startTime = performance.now();
        const requestId = `commission-${Date.now()}`;

        const response = await getCommissionTransactions({
          page: params.page || 1,
          limit: params.limit || 20,
        });

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log dengan color coding
        if (duration > 3000) {
          console.warn(
            `⚠️ [${requestId}] Slow response: ${duration.toFixed(0)}ms (> 3s)`,
            response
          );
        } else {
          console.log(
            `✅ [${requestId}] Commission transactions fetched in ${duration.toFixed(0)}ms`,
            `(${response.transactions?.length || 0} items)`
          );
        }

        return response;
      } catch (error: any) {
        // Handle timeout error separately
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          console.error('❌ Request timeout - Backend is taking too long (> 15s)');
          throw new Error('Backend response timeout. Please try again or contact support.');
        }

        console.error('❌ Error fetching commission transactions:', error);
        throw new Error(
          error.response?.data?.message || error.message || 'Failed to fetch commission transactions'
        );
      }
    },
    // ⏱️ Cache Configuration - AGGRESSIVE CACHING FOR PERFORMANCE
    staleTime: 30 * 1000,           // Cache data untuk 30 detik
    gcTime: 5 * 60 * 1000,          // Keep cache selama 5 menit (garbage collection time)
    refetchInterval: 3 * 60 * 1000, // Auto-refetch setiap 3 menit
    refetchOnWindowFocus: true,     // Refetch saat window fokus kembali
    refetchOnMount: true,           // Refetch when component mounts
    
    // 🔄 Retry Configuration - AUTOMATIC RECOVERY
    retry: 2,                       // Retry 2x jika gagal
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Exponential backoff: 1s → 2s → 4s
    
    // ✅ Error Handling - GRACEFUL DEGRADATION
    throwOnError: (_error, query) => {
      // Jangan throw error jika ada stale data (biar UX tetap smooth)
      return query.state.data === undefined;
    },
  });
};
