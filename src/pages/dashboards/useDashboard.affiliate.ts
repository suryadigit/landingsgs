import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useCommissionDashboard } from '../../hooks/useCommissionDashboard';
import { useReferralDashboard, fetchAndUpdateUserLevel } from '../../hooks/useReferralDashboard';
import { refreshInvoice, startPaymentPolling } from '../../api/affiliate';
import {
  IconCoin,
  IconCash,
  IconClock,
  IconUsers,
} from '@tabler/icons-react';

// Types
export interface StatusBadgeInfo {
  text: string;
  bgColor: string;
  dotColor: string;
}

export interface StatCard {
  label: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface CommissionBreakdownItem {
  level: string;
  description: string;
  amount: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface LevelColors {
  color: string;
  bgColor: string;
  borderColor: string;
}

// Constants
export const STATUS_MAP: Record<string, StatusBadgeInfo> = {
  ACTIVE: {
    text: '🟢 Active',
    bgColor: '#10b981',
    dotColor: '#ffffff',
  },
  PENDING: {
    text: '🟡 Pending',
    bgColor: '#f97316',
    dotColor: '#ffffff',
  },
  SUSPENDED: {
    text: '🔴 Suspended',
    bgColor: '#ef4444',
    dotColor: '#ffffff',
  },
  INACTIVE: {
    text: '⚫ Inactive',
    bgColor: '#6b7280',
    dotColor: '#ffffff',
  },
};

export const DEFAULT_STATUS_BADGE: StatusBadgeInfo = {
  text: '❓ Unknown',
  bgColor: '#9ca3af',
  dotColor: '#ffffff',
};

export const LEVEL_COLORS: Record<number, LevelColors> = {
  1: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6' },
  2: { color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.15)', borderColor: '#a855f7' },
  3: { color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)', borderColor: '#ec4899' },
  4: { color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.15)', borderColor: '#f43f5e' },
  5: { color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.15)', borderColor: '#06b6d4' },
  6: { color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.15)', borderColor: '#14b8a6' },
  7: { color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.15)', borderColor: '#eab308' },
  8: { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)', borderColor: '#f97316' },
  9: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' },
  10: { color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.15)', borderColor: '#6b7280' },
};

// Helper Functions
export const getResponsiveFontSize = (value: string): number => {
  const length = value.replace(/[^0-9]/g, '').length;
  
  if (length > 15) return 14;
  if (length > 12) return 16;
  if (length > 10) return 18;
  if (length > 8) return 20;
  return 24;
};

export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('id-ID');
};

// Main Hook
export const useDashboardAffiliate = () => {
  const navigate = useNavigate();
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingInvoice, setPendingInvoice] = useState<any>(null);
  const [countdown, setCountdown] = useState({ minutes: 0, seconds: 0 });
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // React Query hook - single source of truth for dashboard data
  const {
    data: dashboardData,
    isLoading,
    error: queryError,
    isRefetching,
    refetch,
  } = useCommissionDashboard();

  // Also fetch referral hierarchy data for accurate level counts
  const { data: referralHierarchyData } = useReferralDashboard();

  // Helper function to count members per level from nested referral hierarchy
  const countMembersPerLevel = useCallback((referrals: any): Record<number, number> => {
    const levelCounts: Record<number, number> = {};
    
    const traverse = (items: any[], currentLevel: number = 1) => {
      if (!items || !Array.isArray(items)) return;
      
      for (const item of items) {
        // Use level from item if available, otherwise use currentLevel
        const itemLevel = item.level ? parseInt(String(item.level), 10) : currentLevel;
        
        // Count this member at their level
        levelCounts[itemLevel] = (levelCounts[itemLevel] || 0) + 1;
        
        // Traverse nested referrals (subReferrals or referrals)
        const nestedReferrals = item.subReferrals || item.referrals;
        if (nestedReferrals && Array.isArray(nestedReferrals) && nestedReferrals.length > 0) {
          traverse(nestedReferrals, itemLevel + 1);
        }
      }
    };
    
    // Handle both array and object with list property
    if (Array.isArray(referrals)) {
      traverse(referrals);
    } else if (referrals?.list && Array.isArray(referrals.list)) {
      traverse(referrals.list);
    }
    
    console.log('📊 [Dashboard] Members per level from hierarchy:', levelCounts);
    return levelCounts;
  }, []);

  // Calculate members per level from referral hierarchy
  const membersPerLevel = useMemo(() => {
    if (referralHierarchyData?.referrals) {
      return countMembersPerLevel(referralHierarchyData.referrals);
    }
    return {};
  }, [referralHierarchyData?.referrals, countMembersPerLevel]);

  // Fetch and update user level on mount (so level is correct immediately)
  useEffect(() => {
    // Only fetch if user is ACTIVE (has valid affiliate status)
    if (dashboardData?.affiliate?.status === 'ACTIVE') {
      fetchAndUpdateUserLevel().then((level) => {
        console.log(`📊 [Dashboard] User level updated to: ${level}`);
      });
    }
  }, [dashboardData?.affiliate?.status]);

  // Check pending status
  useEffect(() => {
    if (dashboardData?.affiliate?.status === 'PENDING') {
      setLocalError(null);
    }
  }, [dashboardData?.affiliate?.status]);

  // Countdown timer
  useEffect(() => {
    if (!pendingInvoice?.expiryDate) {
      setCountdown({ minutes: 0, seconds: 0 });
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expireTime = new Date(pendingInvoice.expiryDate).getTime();
      const distance = expireTime - now;

      if (distance <= 0) {
        setCountdown({ minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown({ minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingInvoice]);

  // Payment handler
  const handlePaymentClick = useCallback(async () => {
    try {
      setIsPaymentProcessing(true);

      const response = await refreshInvoice();
      const invoiceData = response.payment || response.invoice;

      if (invoiceData?.invoiceUrl) {
        setPendingInvoice({
          invoiceUrl: invoiceData.invoiceUrl,
          expiryDate: invoiceData.expiredAt || '',
          amount: invoiceData.amount,
        });

        window.open(invoiceData.invoiceUrl, '_blank');

        try {
          await startPaymentPolling();
        } catch {
          // Continue anyway
        }

        setTimeout(() => {
          refetch();
        }, 3000);
      } else {
        throw new Error('No invoice URL received');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Failed to process payment');
    } finally {
      setIsPaymentProcessing(false);
    }
  }, [refetch]);

  // Copy with animation handler
  const handleCopyWithAnimation = useCallback((buttonId: string, copy: () => void) => {
    setAnimatingButton(buttonId);
    copy();

    const button = document.querySelector(`[data-button-id="${buttonId}"]`) as HTMLElement;
    if (button) {
      const rect = button.getBoundingClientRect();
      confetti({
        particleCount: 50,
        spread: 30,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#0665fc', '#d4af37', '#10b981', '#a855f7'],
      });
    }

    setTimeout(() => setAnimatingButton(null), 600);
  }, []);

  // Navigate to invoice
  const navigateToInvoice = useCallback(() => {
    navigate('/invoice');
  }, [navigate]);

  // Derived state
  const isDataLoaded = !isLoading && dashboardData !== null && !queryError;

  // Extract data from API response
  const affiliate = useMemo(() => (dashboardData as any)?.affiliate || {}, [dashboardData]);
  const earnings = useMemo(() => (dashboardData as any)?.earnings || {}, [dashboardData]);
  const commissionDetails = useMemo(() => (dashboardData as any)?.commissionDetails || {}, [dashboardData]);
  const commissionBreakdownData = useMemo(() => (dashboardData as any)?.commissionBreakdown?.byLevel || {}, [dashboardData]);
  const referralsData = useMemo(() => (dashboardData as any)?.referrals || {}, [dashboardData]);
  const summaryData = useMemo(() => (dashboardData as any)?.summary || {}, [dashboardData]);
  const networkData = useMemo(() => (dashboardData as any)?.network || {}, [dashboardData]);

  const affiliateCode = affiliate?.code || '---';
  const referralLink = `https://santa.cloud/register?ref=${affiliateCode}`;

  // Helper function to calculate total members from referrals list using networkMembersCount
  const calculateTotalFromReferralsList = (referrals: any[]): number => {
    if (!Array.isArray(referrals) || referrals.length === 0) return 0;
    
    let count = referrals.length; // Count direct referrals first
    referrals.forEach((ref: any) => {
      // Use networkMembersCount from API (all downlines of this referral)
      if (typeof ref.networkMembersCount === 'number') {
        count += ref.networkMembersCount;
      }
      // Fallback to subReferralsCount
      else if (typeof ref.subReferralsCount === 'number') {
        count += ref.subReferralsCount;
      }
    });
    return count;
  };

  // Calculate Total Member from all levels (all downlines including sub-referrals)
  // Uses data from /v1/affiliate/dashboard/komisi endpoint only
  const totalMemberCount = useMemo(() => {
    console.log('📊 [Dashboard] Calculating total members...', {
      membersPerLevel,
      networkData,
      summaryData,
      referralsData,
      commissionBreakdownData,
    });

    // Priority 1: Use membersPerLevel from referral hierarchy (most accurate - calculated from nested structure)
    if (membersPerLevel && Object.keys(membersPerLevel).length > 0) {
      const total = Object.values(membersPerLevel).reduce((sum, count) => sum + count, 0);
      if (total > 0) {
        console.log('📊 [Dashboard] Total members from membersPerLevel:', total, membersPerLevel);
        return total;
      }
    }

    // Priority 2: Use summary.totalMembers from API
    if (typeof summaryData?.totalMembers === 'number' && summaryData.totalMembers > 0) {
      console.log('📊 [Dashboard] Total members from summary.totalMembers:', summaryData.totalMembers);
      return summaryData.totalMembers;
    }

    // Priority 3: Use network.totalNetworkMembers from API
    if (typeof networkData?.totalNetworkMembers === 'number' && networkData.totalNetworkMembers > 0) {
      console.log('📊 [Dashboard] Total members from network.totalNetworkMembers:', networkData.totalNetworkMembers);
      return networkData.totalNetworkMembers;
    }
    
    // Priority 4: Use summary.totalNetworkMembers if available
    if (typeof summaryData?.totalNetworkMembers === 'number' && summaryData.totalNetworkMembers > 0) {
      console.log('📊 [Dashboard] Total members from summary.totalNetworkMembers:', summaryData.totalNetworkMembers);
      return summaryData.totalNetworkMembers;
    }
    
    // Priority 5: Calculate manually - Level 1 from referralsData, Level 2+ from commissionBreakdown
    let total = 0;
    
    // Level 1: Use referrals.list (actual direct referrals)
    const directReferrals = referralsData?.list;
    const level1Count = Array.isArray(directReferrals) ? directReferrals.length : (referralsData?.totalCount || 0);
    if (level1Count > 0) {
      console.log('📊 [Dashboard] Level 1 count from referralsData:', level1Count);
      total += level1Count;
    }
    
    // Level 2-10: Use commissionBreakdown
    if (commissionBreakdownData && typeof commissionBreakdownData === 'object') {
      for (let i = 2; i <= 10; i++) {
        const key = `level_${i}`;
        const levelData = commissionBreakdownData[key];
        if (levelData?.count && levelData.count > 0) {
          console.log(`📊 [Dashboard] Level ${i} count:`, levelData.count);
          total += levelData.count;
        }
      }
    }
    
    if (total > 0) {
      console.log('📊 [Dashboard] Total members calculated:', total);
      return total;
    }
    
    // Priority 6: Calculate from referrals.list using subReferralsCount per referral
    // Formula: directReferrals.length + sum(each referral's subReferralsCount)
    if (Array.isArray(directReferrals) && directReferrals.length > 0) {
      const totalFromList = calculateTotalFromReferralsList(directReferrals);
      console.log('📊 [Dashboard] Total members calculated from referrals.list:', totalFromList, directReferrals);
      if (totalFromList > 0) return totalFromList;
    }
    
    // Fallback to referrals.totalCount
    console.log('📊 [Dashboard] Fallback to referrals.totalCount:', referralsData?.totalCount);
    return referralsData?.totalCount || 0;
  }, [membersPerLevel, networkData, summaryData, referralsData, commissionBreakdownData]);

  // Status badge
  const statusBadge = useMemo((): StatusBadgeInfo => {
    const status = affiliate?.status || 'PENDING';
    return STATUS_MAP[status] || DEFAULT_STATUS_BADGE;
  }, [affiliate?.status]);

  // Calculate Total Omset from Level 1 downlines (direct referrals)
  // Omset = jumlah member level 1 × Rp 575.000 (harga per user)
  const PRODUCT_PRICE = 575000;
  
  // Use referrals.list length for direct referrals (level 1)
  // or fallback to commissionBreakdownData.level_1.count
  const level1Count = useMemo(() => {
    // referrals.list contains direct referrals (level 1)
    const directReferrals = referralsData?.list;
    if (Array.isArray(directReferrals)) {
      return directReferrals.length;
    }
    // Fallback to commission breakdown data
    const level1Data = commissionBreakdownData?.level_1;
    return level1Data?.count || 0;
  }, [referralsData, commissionBreakdownData]);
  
  const totalOmset = useMemo(() => {
    return level1Count * PRODUCT_PRICE;
  }, [level1Count]);

  // Stats cards data
  const stats = useMemo((): StatCard[] => [
    {
      label: 'Total Omset',
      value: isDataLoaded ? formatCurrency(totalOmset) : 'Loading...',
      icon: IconCoin,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
    },
    {
      label: 'Approve Commission',
      value: isDataLoaded ? formatCurrency(earnings?.approved || 0) : 'Loading...',
      icon: IconCash,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 58, 0.1)',
      borderColor: '#10b981',
    },
    {
      label: 'Pending Payment Person',
      value: isDataLoaded ? formatNumber(commissionDetails?.pending_payment_class || 0) : 'Loading...',
      icon: IconClock,
      color: '#e4f755ff',
      bgColor: 'rgba(234, 247, 85, 0.1)',
      borderColor: '#f7f755ff',
    },
    {
      label: 'Total Member',
      value: isDataLoaded ? formatNumber(totalMemberCount) : 'Loading...',
      icon: IconUsers,
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.1)',
      borderColor: '#a855f7',
    },
  ], [isDataLoaded, earnings, commissionDetails, totalMemberCount]);

  // Commission breakdown data
  const commissionBreakdown = useMemo((): CommissionBreakdownItem[] => [
    {
      level: 'Pending Commissions',
      description: 'Commission menunggu approval',
      amount: isDataLoaded ? formatCurrency(earnings?.pending || 0) : 'Loading...',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      borderColor: '#f97316',
    },
    {
      level: 'Approved Commissions',
      description: 'Commission yang telah disetujui',
      amount: isDataLoaded ? formatCurrency(earnings?.approved || 0) : 'Loading...',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: '#3b82f6',
    },
    {
      level: 'Total Commission',
      description: 'Total commission yang sudah diterima',
      amount: isDataLoaded ? formatCurrency(earnings?.total || 0) : 'Loading...',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: '#10b981',
    },
  ], [isDataLoaded, earnings]);

  // Check if all levels are empty
  const isHierarchyEmpty = useMemo(() => {
    return isDataLoaded && Object.values(commissionBreakdownData).every((v: any) => v?.count === 0);
  }, [isDataLoaded, commissionBreakdownData]);

  // Get level data helper
  const getLevelData = useCallback((level: number) => {
    const levelKey = `level_${level}`;
    const levelData = isDataLoaded ? commissionBreakdownData?.[levelKey] : null;
    return {
      count: levelData?.count || 0,
      commission: levelData?.commission || 0,
      colors: LEVEL_COLORS[level] || LEVEL_COLORS[10],
    };
  }, [isDataLoaded, commissionBreakdownData]);

  return {
    // State
    animatingButton,
    localError,
    pendingInvoice,
    countdown,
    isPaymentProcessing,
    isLoading,
    isRefetching,
    isDataLoaded,
    queryError,

    // Data
    affiliate,
    earnings,
    commissionDetails,
    commissionBreakdownData,
    referralsData,
    affiliateCode,
    referralLink,
    statusBadge,
    stats,
    commissionBreakdown,
    isHierarchyEmpty,
    membersPerLevel, // Members count per level from referral hierarchy

    // Handlers
    handlePaymentClick,
    handleCopyWithAnimation,
    navigateToInvoice,
    getLevelData,
    refetch,
  };
};

export default useDashboardAffiliate;
