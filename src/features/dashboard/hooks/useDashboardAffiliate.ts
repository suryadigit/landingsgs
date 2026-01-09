import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useReferralDashboard, fetchAndUpdateUserLevel } from '../../../shared/hooks';
import axiosClient from '../../../shared/api/axios';
import { useAuth } from '../../auth';
import { refreshInvoice, startPaymentPolling } from '../../affiliate';
import { IconCoin, IconCash, IconClock, IconUsers } from '@tabler/icons-react';
import type { StatCard, CommissionBreakdownItem, StatusBadgeInfo } from '../types/dashboardTypes';
import { STATUS_MAP, DEFAULT_STATUS_BADGE, LEVEL_COLORS } from '../constants/dashboardConstants';

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

export const useDashboardAffiliate = () => {
  const navigate = useNavigate();
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingInvoice, setPendingInvoice] = useState<any>(null);
  const [countdown, setCountdown] = useState({ minutes: 0, seconds: 0 });
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const { token } = useAuth();
  const [queryError, setQueryError] = useState<any>(null);

  const { data: dashboardData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['affiliateDashboard'],
    queryFn: async ({ signal }) => {
      setQueryError(null);
      try {
        const bypass = (() => {
          try { return localStorage.getItem('affiliate_dashboard_bypass'); } catch { return null; }
        })();
        const base1 = bypass ? `/v1/affiliate/dashboard/komisi?t=${bypass}` : '/v1/affiliate/dashboard/komisi';
        const base2 = bypass ? `/affiliate/dashboard/komisi?t=${bypass}` : '/affiliate/dashboard/komisi';
        let resp;
        try {
          resp = await axiosClient.get(base1, { signal });
        } catch (err) {
          resp = await axiosClient.get(base2, { signal });
        }
        const data = resp.data;
        if ((import.meta as any).env?.DEV) console.debug('[dashboard] axios success', { status: resp.status, data });
      const transformed: any = { ...data };
      if (data?.totals?.ownerCode) {
        transformed.affiliate = { ...(transformed.affiliate || {}), code: data.totals.ownerCode };
      }
      if (typeof data?.totals?.totalMembers === 'number') {
        transformed.summary = { ...(transformed.summary || {}), totalMembers: data.totals.totalMembers };
      }
      if (Array.isArray(data?.totals?.qualifyingUsers) && data.totals.qualifyingUsers.length > 0) {
        transformed.referrals = transformed.referrals || {};
        transformed.referrals.list = data.totals.qualifyingUsers.map((u: any) => ({
          id: u.id,
          code: u.code,
          user: { fullName: u.fullName, email: u.email },
          payments: u.payments || [],
          purchases: u.purchases || [],
          status: u.status || 'UNKNOWN',
          registeredAt: u.registeredAt || null,
        }));
        transformed.referrals.totalCount = transformed.referrals.list.length;
      }
      return transformed;
      } catch (err: any) {
        try { setQueryError(err); } catch {}
        throw err;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
   
  });

  const isRefetching = isFetching && !isLoading;

  const { data: referralHierarchyData } = useReferralDashboard();

  const countMembersPerLevel = useCallback((referrals: any): Record<number, number> => {
    const levelCounts: Record<number, number> = {};
    
    const traverse = (items: any[], currentLevel: number = 1) => {
      if (!items || !Array.isArray(items)) return;
      
      for (const item of items) {
        const itemLevel = item.level ? parseInt(String(item.level), 10) : currentLevel;
        levelCounts[itemLevel] = (levelCounts[itemLevel] || 0) + 1;
        
        const nestedReferrals = item.subReferrals || item.referrals;
        if (nestedReferrals && Array.isArray(nestedReferrals) && nestedReferrals.length > 0) {
          traverse(nestedReferrals, itemLevel + 1);
        }
      }
    };
    
    if (Array.isArray(referrals)) {
      traverse(referrals);
    } else if (referrals?.list && Array.isArray(referrals.list)) {
      traverse(referrals.list);
    }
    
    return levelCounts;
  }, []);

  const membersPerLevel = useMemo(() => {
    if (referralHierarchyData?.referrals) {
      return countMembersPerLevel(referralHierarchyData.referrals);
    }
    return {};
  }, [referralHierarchyData?.referrals, countMembersPerLevel]);

  useEffect(() => {
    if ((dashboardData as any)?.affiliate?.status === 'ACTIVE') {
      fetchAndUpdateUserLevel();
    }
  }, [(dashboardData as any)?.affiliate?.status]);

  useEffect(() => {
    if ((dashboardData as any)?.affiliate?.status === 'PENDING') {
      setLocalError(null);
    }
  }, [(dashboardData as any)?.affiliate?.status]);

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
        try { await startPaymentPolling(); } catch {}
        setTimeout(() => refetch(), 3000);
        return invoiceData.invoiceUrl;
      } else {
        throw new Error('No invoice URL received');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Failed to process payment');
    } finally {
      setIsPaymentProcessing(false);
    }
  }, [refetch]);

  const handleCopyWithAnimation = useCallback(
    (buttonId: string, copy: () => void, textToCopy?: string) => {
      setAnimatingButton(buttonId);
      try {
        copy();
      } catch (err) {
        // ignore, we'll try navigator.clipboard below
      }

      if (textToCopy && typeof navigator !== 'undefined' && (navigator as any).clipboard && (navigator as any).clipboard.writeText) {
        try {
          (navigator as any).clipboard.writeText(textToCopy).catch(() => {});
        } catch (err) {
          // ignore
        }
      }

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
    },
    []
  );

  const navigateToInvoice = useCallback(() => navigate('/invoice'), [navigate]);

  const isDataLoaded = dashboardData !== null && !queryError;
  const affiliate = useMemo(() => (dashboardData as any)?.affiliate || {}, [dashboardData]);
  const earnings = useMemo(() => (dashboardData as any)?.earnings || {}, [dashboardData]);
  const commissionDetails = useMemo(() => (dashboardData as any)?.commissionDetails || {}, [dashboardData]);
  const commissionBreakdownData = useMemo(() => (dashboardData as any)?.commissionBreakdown?.byLevel || {}, [dashboardData]);
 
  const referralsData = useMemo(() => (dashboardData as any)?.referrals || {}, [dashboardData]);  
  const summaryData = useMemo(() => (dashboardData as any)?.summary || {}, [dashboardData]);
  const networkData = useMemo(() => (dashboardData as any)?.network || {}, [dashboardData]);
  const affiliateCode = useMemo(() => affiliate?.code || '---', [affiliate?.code]);

  const referralLink = useMemo(() => {
    if (!affiliateCode || affiliateCode === '---') return '';
    return `https://santa.cloud/register?ref=${affiliateCode}`;
  }, [affiliateCode]);
  const wordpressReferralLink = useMemo(() => affiliate?.wpReferralLink || null, [affiliate?.wpReferralLink]);
  const wpDisplayLink = useMemo(() => affiliate?.wpDisplayLink || null, [affiliate?.wpDisplayLink]);
  const wpCustomCode = useMemo(() => affiliate?.wpCustomCode || null, [affiliate?.wpCustomCode]);

  const generateCustomCode = useCallback((id: number, name: string): string => {
    const paddedId = String(id).padStart(3, '0');
    const namePart = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'SGS';
    return `AFF${paddedId}${namePart}`;
  }, []);

  const wpCustomDisplayCode = useMemo(() => {
    if (wpCustomCode) return wpCustomCode;
    if (!affiliate?.wpAffiliateId || !affiliate?.name) return null;
    return generateCustomCode(affiliate.wpAffiliateId, affiliate.name);
  }, [wpCustomCode, affiliate?.wpAffiliateId, affiliate?.name, generateCustomCode]);

  const wpUserId = useMemo(() => affiliate?.wpUserId || null, [affiliate?.wpUserId]);
  const wpAffiliateId = useMemo(() => affiliate?.wpAffiliateId || null, [affiliate?.wpAffiliateId]);
  const isWordPressAffiliate = useMemo(() => {
    return affiliate?.isWordPressAffiliate || (!!wpAffiliateId && !!wordpressReferralLink);
  }, [affiliate?.isWordPressAffiliate, wpAffiliateId, wordpressReferralLink]);

  const calculateTotalFromReferralsList = (referrals: any[]): number => {
    if (!Array.isArray(referrals) || referrals.length === 0) return 0;
    let count = referrals.length;
    referrals.forEach((ref: any) => {
      if (typeof ref.networkMembersCount === 'number') count += ref.networkMembersCount;
      else if (typeof ref.subReferralsCount === 'number') count += ref.subReferralsCount;
    });
    return count;
  };

  const totalMemberCount = useMemo(() => {
    if (membersPerLevel && Object.keys(membersPerLevel).length > 0) {
      const total = Object.values(membersPerLevel).reduce((sum, count) => sum + count, 0);
      if (total > 0) return total;
    }
    if (typeof summaryData?.totalMembers === 'number' && summaryData.totalMembers > 0) return summaryData.totalMembers;
    if (typeof networkData?.totalNetworkMembers === 'number' && networkData.totalNetworkMembers > 0) return networkData.totalNetworkMembers;
    if (typeof summaryData?.totalNetworkMembers === 'number' && summaryData.totalNetworkMembers > 0) return summaryData.totalNetworkMembers;
    
    let total = 0;
    const directReferrals = referralsData?.list;
    const level1Count = Array.isArray(directReferrals) ? directReferrals.length : (referralsData?.totalCount || 0);
    if (level1Count > 0) total += level1Count;
    
    if (commissionBreakdownData && typeof commissionBreakdownData === 'object') {
      for (let i = 2; i <= 10; i++) {
        const key = `level_${i}`;
        const levelData = commissionBreakdownData[key];
        if (levelData?.count && levelData.count > 0) total += levelData.count;
      }
    }
    
    if (total > 0) return total;
    
    if (Array.isArray(directReferrals) && directReferrals.length > 0) {
      const totalFromList = calculateTotalFromReferralsList(directReferrals);
      if (totalFromList > 0) return totalFromList;
    }
    
    return referralsData?.totalCount || 0;
  }, [membersPerLevel, networkData, summaryData, referralsData, commissionBreakdownData]);

  const statusBadge = useMemo((): StatusBadgeInfo => {
    const status = affiliate?.status || 'PENDING';
    return STATUS_MAP[status] || DEFAULT_STATUS_BADGE;
  }, [affiliate?.status]);

  const PRODUCT_PRICE = 575000;

  const level1Count = useMemo(() => {
    const directReferrals = referralsData?.list;
    if (Array.isArray(directReferrals)) return directReferrals.length;
    const level1Data = commissionBreakdownData?.level_1;
    return level1Data?.count || 0;
  }, [referralsData, commissionBreakdownData]);

  const totalOmset = useMemo(() => {
    const apiTotal = (dashboardData as any)?.totals?.totalOmset ?? (summaryData?.totalOmset ?? null);
    if (typeof apiTotal === 'number' && !isNaN(apiTotal)) return apiTotal;
    return level1Count * PRODUCT_PRICE;
  }, [dashboardData, summaryData, level1Count]);

  const approvedCommissionTotal = useMemo(() => {
    const apiApproved = (dashboardData as any)?.totals?.approvedCommission;
    if (typeof apiApproved === 'number') return apiApproved;
    return earnings?.approved || 0;
  }, [dashboardData, earnings]);

  const pendingPaymentPersonsTotal = useMemo(() => {
    const apiPending = (dashboardData as any)?.totals?.pendingPaymentPersons;
    if (typeof apiPending === 'number') return apiPending;
    return commissionDetails?.pending_payment_class || 0;
  }, [dashboardData, commissionDetails]);

  const totalMembersTotal = useMemo(() => {
    const apiMembers = (dashboardData as any)?.totals?.totalMembers;
    if (typeof apiMembers === 'number' && apiMembers > 0) return apiMembers;
    return totalMemberCount;
  }, [dashboardData, totalMemberCount]);

  const stats = useMemo((): StatCard[] => [
    {
      label: 'Total Omset',
      value: isDataLoaded ? formatCurrency(totalOmset) : '-',
      icon: IconCoin,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
    },
    {
      label: 'Approve Commission',
      value: isDataLoaded ? formatCurrency(approvedCommissionTotal || 0) : '-',
      icon: IconCash,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 58, 0.1)',
      borderColor: '#10b981',
    },
    {
      label: 'Pending Payment Person',
      value: isDataLoaded ? formatNumber(pendingPaymentPersonsTotal || 0) : '-',
      icon: IconClock,
      color: '#e4f755ff',
      bgColor: 'rgba(234, 247, 85, 0.1)',
      borderColor: '#f7f755ff',
    },
    {
      label: 'Total Member',
      value: isDataLoaded ? formatNumber(totalMembersTotal || 0) : '-',
      icon: IconUsers,
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.1)',
      borderColor: '#a855f7',
    },
  ], [isDataLoaded, totalOmset, approvedCommissionTotal, pendingPaymentPersonsTotal, totalMembersTotal]);

  const commissionBreakdown = useMemo((): CommissionBreakdownItem[] => [
    {
      level: 'Pending Commissions',
      description: 'Commission menunggu approval',
      amount: isDataLoaded ? formatCurrency(earnings?.pending || 0) : '-',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      borderColor: '#f97316',
    },
    {
      level: 'Approved Commissions',
      description: 'Commission yang telah disetujui',
      amount: isDataLoaded ? formatCurrency(earnings?.approved || 0) : '-',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: '#3b82f6',
    },
    {
      level: 'Total Commission',
      description: 'Total commission yang sudah diterima',
      amount: isDataLoaded ? formatCurrency(earnings?.total || 0) : '-',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: '#10b981',
    },
  ], [isDataLoaded, earnings]);

  const isHierarchyEmpty = useMemo(() => {
    return isDataLoaded && Object.values(commissionBreakdownData).every((v: any) => v?.count === 0);
  }, [isDataLoaded, commissionBreakdownData]);

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
    animatingButton,
    localError,
    pendingInvoice,
    countdown,
    isPaymentProcessing,
    isLoading: isLoading,
    isRefetching,
    isDataLoaded,
    queryError,
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
    membersPerLevel,
    wpReferralLink: wordpressReferralLink,
    wpDisplayLink,
    wpCustomCode,
    wpCustomDisplayCode,
    wpUserId,
    wpAffiliateId,
    isWordPressAffiliate,
    handlePaymentClick,
    handleCopyWithAnimation,
    navigateToInvoice,
    getLevelData,
    refetch,
  };
};

export default useDashboardAffiliate;
