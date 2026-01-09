import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axiosClient from '../api/apis';

export interface ReferralHierarchyData {
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
  earnings?: {
    total: number;
    pending: number;
    approved: number;
  };
  referrals: {
    totalCount: number;
    list: Array<{
      id: string;
      code: string;
      name: string;
      email: string;
      status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
      level?: number;
      joinDate: string;
      totalEarnings: number;
      pendingEarnings?: number;
      approvedEarnings?: number;
      subReferrals?: any[];
      subReferralCount?: number;
    }>;
  } | Array<any>;
  summary?: {
    totalMembers: number;
    activeMembers: number;
    totalCommissionDistributed: number;
    pendingCommissions: number;
  };
  performance?: {
    optimized: boolean;
    queries: number;
    note: string;
  };
}

// Helper function to calculate highest level (depth) from referral hierarchy
// Level = depth in downline tree (from API response)
// - Direct referrals = Level 1
// - Sub-referrals of those = Level 2
// - And so on...
const calculateHighestDownlineLevel = (referrals: any): number => {
  let maxLevel = 0;
  
  const traverse = (items: any[]) => {
    if (!items || !Array.isArray(items)) return;
    
    for (const item of items) {
      // Use level from API response if available
      const itemLevel = item.level ? parseInt(String(item.level), 10) : 0;
      maxLevel = Math.max(maxLevel, itemLevel);
      
      console.log(`📊 [Referral] Found: ${item.name} at level ${itemLevel}`);
      
      // Traverse nested referrals recursively
      // API uses "referrals" key for nested children
      if (item.referrals && Array.isArray(item.referrals) && item.referrals.length > 0) {
        traverse(item.referrals);
      }
      // Also check subReferrals for backward compatibility
      if (item.subReferrals && Array.isArray(item.subReferrals) && item.subReferrals.length > 0) {
        traverse(item.subReferrals);
      }
    }
  };
  
  // Handle both array and object with list property
  if (Array.isArray(referrals)) {
    traverse(referrals);
  } else if (referrals?.list && Array.isArray(referrals.list)) {
    traverse(referrals.list);
  }
  
  console.log(`📊 [Referral] Calculated highest downline level: ${maxLevel}`);
  return maxLevel;
};

// Update localStorage with highest downline level AND user's level
const updateUserProfileWithHighestLevel = (highestLevel: number) => {
  try {
    const cached = localStorage.getItem('user_profile');
    if (cached) {
      const profile = JSON.parse(cached);
      let updated = false;
      
      // Update highestDownlineLevel
      if (profile.highestDownlineLevel !== highestLevel) {
        profile.highestDownlineLevel = highestLevel;
        updated = true;
        console.log(`📊 [Referral] Updated highestDownlineLevel to ${highestLevel}`);
      }
      
      // Update user's own level based on their network depth
      // If user has downlines, their level = highestDownlineLevel
      // (level represents how deep their network goes)
      // Minimum level is 1 for all members
      const newUserLevel = Math.max(1, highestLevel);
      if (profile.level !== newUserLevel) {
        profile.level = newUserLevel;
        updated = true;
        console.log(`📊 [Referral] Updated user level to ${newUserLevel}`);
      }
      
      if (updated) {
        localStorage.setItem('user_profile', JSON.stringify(profile));
        // Dispatch event to notify header to update
        window.dispatchEvent(new CustomEvent('userProfileUpdated'));
      }
    }
  } catch (e) {
    console.warn('⚠️ [Referral] Failed to update user profile with highest level');
  }
};

export const useReferralDashboard = (): UseQueryResult<ReferralHierarchyData, Error> => {
  return useQuery<ReferralHierarchyData, Error>({
    queryKey: ['referral-dashboard'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get<ReferralHierarchyData>(
          '/v1/commissions/referral-hierarchy'
        );
        
        // Calculate and save highest downline level
        const highestLevel = calculateHighestDownlineLevel(response.data.referrals);
        if (highestLevel > 0) {
          updateUserProfileWithHighestLevel(highestLevel);
        }
        
        return response.data;
      } catch (error: any) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          throw new Error('Backend response timeout. Please try again or contact support.');
        }

        if (error.response?.status === 403) {
          throw new Error('Anda tidak memiliki akses ke halaman ini. Silakan login ulang.');
        }

        if (error.response?.status === 500) {
          throw new Error(
            error.response?.data?.message || 'Server error: Please try again later or contact support.'
          );
        }

        throw new Error(
          error.response?.data?.message || error.message || 'Failed to fetch referral hierarchy'
        );
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry on 403 Forbidden
      if (error?.message?.includes('akses') || error?.message?.includes('Forbidden')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false, // Don't throw - let component handle error state
  });
};

// Export function to fetch and update user level (can be called from anywhere)
export const fetchAndUpdateUserLevel = async (): Promise<number> => {
  try {
    const response = await axiosClient.get<ReferralHierarchyData>(
      '/v1/commissions/referral-hierarchy'
    );
    
    const highestLevel = calculateHighestDownlineLevel(response.data.referrals);
    if (highestLevel > 0) {
      updateUserProfileWithHighestLevel(highestLevel);
    }
    
    return Math.max(1, highestLevel);
  } catch (error) {
    console.warn('⚠️ [Level] Failed to fetch user level:', error);
    return 1;
  }
};
