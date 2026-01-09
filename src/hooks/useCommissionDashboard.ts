import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axiosClient from '../api/apis';

/**
 * Consolidated commission dashboard data from backend
 * Structure from actual API response: /v1/affiliate/dashboard/komisi
 */
export interface CommissionDashboardData {
  message: string;
  affiliate: {
    id: string;
    name: string;
    code: string;
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
    joinDate: string;
    totalEarnings: number;
    totalPaid: number;
  };
  earnings: {
    total: number;
    pending: number;
    approved: number;
  };
  commissionBreakdown: {
    byLevel: {
      [key: string]: {
        count: number;
        total: number;
        pending: number;
        approved: number;
        fixed_amount: number;
      };
    };
  };
  commissionDetails: {
    total_records: number;
    recent_commissions: Array<{
      id: string;
      level: number;
      amount: number;
      status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
      from: string;
      date: string;
    }>;
  };
  referrals: {
    totalCount: number;
    list: Array<{
      id: string;
      code: string;
      name: string;
      email: string;
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
      joinDate: string;
      activatedAt: string;
      subReferralsCount: number;
      totalEarnings: number;
      pendingEarnings: number;
      approvedEarnings: number;
    }>;
  };
  summary: {
    totalMembers: number;
    activeMembers: number;
    totalCommissionDistributed: number;
    pendingCommissions: number;
  };
  performance: {
    optimized: boolean;
    queries: number;
    note: string;
  };
}

/**
 * Hook untuk fetch commission dashboard data
 * - Menggunakan React Query dengan caching 30 detik
 * - Automatic refetch di background
 * - Error handling built-in
 * - Backend already includes referralsByLevel in response
 */
export const useCommissionDashboard = (): UseQueryResult<CommissionDashboardData, Error> => {
  return useQuery<CommissionDashboardData, Error>({
    queryKey: ['commission-dashboard'],
    queryFn: async () => {
      try {
        console.log('📡 Fetching commission dashboard (single request)...');
        const startTime = performance.now();
        const requestId = `dashboard-${Date.now()}`;

        try {
          // ✅ Axios already has 8s timeout configured globally in src/api/apis.ts
          // No need for AbortController here - would cause duplicate timeouts
          const response = await axiosClient.get<CommissionDashboardData>(
            '/v1/affiliate/dashboard/komisi'
          );

          const endTime = performance.now();
          const duration = endTime - startTime;

          // Log with color coding
          if (duration > 3000) {
            console.warn(
              `⚠️ [${requestId}] Slow response: ${duration.toFixed(0)}ms (> 3s)`,
              response.data
            );
          } else {
            console.log(
              `✅ [${requestId}] Commission dashboard fetched in ${duration.toFixed(0)}ms`,
              response.data
            );
          }

          return response.data;
        } catch (axiosError: any) {
          throw axiosError;
        }
      } catch (error: any) {
        // Handle timeout error separately
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          console.error('❌ Request timeout - Backend is taking too long (> 8s)');
          throw new Error('Backend response timeout. Please try again or contact support.');
        }
        
        console.error('❌ Error fetching commission dashboard:', error);
        throw new Error(
          error.response?.data?.message || error.message || 'Failed to fetch commission dashboard'
        );
      }
    },
    // Cache data untuk 15 detik (lebih responsive)
    staleTime: 15 * 1000,
    // Jangan hapus cache saat component unmount (biar reusable)
    gcTime: 5 * 60 * 1000, // Keep cache selama 5 menit
    // Automatic refetch di background setiap 30 detik (lebih sering untuk real-time feel)
    refetchInterval: 30 * 1000,
    // Refetch saat window fokus kembali
    refetchOnWindowFocus: true,
    // Refetch saat reconnect internet
    refetchOnReconnect: true,
    // Retry 2x jika gagal dengan exponential backoff
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Don't throw error immediately if we have stale data
    throwOnError: (_error, query) => {
      // Only throw if no data at all (first load failure)
      return query.state.data === undefined;
    },
  });
};

/**
 * Hook untuk refetch manual (misal setelah approve/reject commission)
 * Gunakan untuk invalidate cache dan trigger refetch
 */
export const useRefreshCommissionDashboard = () => {
  // Import di component yang membutuhkan:
  // import { useQueryClient } from '@tanstack/react-query';
  // const queryClient = useQueryClient();
  // return () => queryClient.invalidateQueries({ queryKey: ['commission-dashboard'] });

  return () => {
    // This will be exported from component yang pakai React Query
  };
};
