import axiosClient from "./apis";

export interface SubReferral {
  id: string;
  name: string;
  code: string;
  email: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";
  joinDate: string;
  subReferrals?: SubReferral[];  // Recursive - bisa nested unlimited
  subReferralCount?: number;
}

export interface ReferralMember {
  id: string;
  name: string;
  code: string;
  email: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";
  level?: string;
  joinDate: string;
  totalEarnings: number;
  pendingEarnings?: number;
  approvedEarnings?: number;
  subReferrals?: SubReferral[];  // Anak-anak dari referral ini (bisa nested)
  subReferralCount?: number;  // Jumlah sub-referral
}

export interface ReferralProgramResponse {
  message: string;
  affiliate: {
    id: string;
    name: string;
    code: string;
    status: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";
    level?: string;
    joinDate: string;
    totalEarnings: number;
    totalPaid: number;
  };
  earnings?: {
    total: number;
    pending: number;
    approved: number;
  };
  referrals: {
    totalCount: number;
    list: ReferralMember[];
  };
  summary?: {
    totalMembers: number;
    activeMembers: number;
    totalCommissionDistributed: number;
    pendingCommissions: number;
  };
}

/**
 * Get referral program dashboard data with all affiliates, earnings, and referrals
 * 
 * ⚠️ DEPRECATED: Use useReferralDashboard hook instead for optimized performance
 * 
 * Response from: GET /v1/commissions/referral-hierarchy
 * 
 * This is a lower-level API function. For React components, prefer:
 * - useReferralDashboard() - React Query hook with caching & automatic refetch
 * - Better performance with automatic cache management
 * - Built-in retry logic & error handling
 */
export const getReferralProgramDashboard = async (): Promise<ReferralProgramResponse> => {
  try {
    const startTime = performance.now();
    
    const response = await axiosClient.get<ReferralProgramResponse>(
      "/v1/commissions/referral-hierarchy"  
    );
    
    const duration = performance.now() - startTime;
    if (duration > 3000) {
      console.warn(`⚠️ getReferralProgramDashboard took ${duration.toFixed(0)}ms (> 3s)`);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error in getReferralProgramDashboard:', error.message);
    throw new Error(
      error.response?.data?.error || "Failed to fetch referral program data"
    );
  }
};
