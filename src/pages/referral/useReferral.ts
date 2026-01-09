/**
 * Custom Hook & Business Logic untuk Referral Page
 * Mengintegrasikan: types, utilities, dan state management
 * 
 * ✅ OPTIMIZED: Now uses useReferralDashboard (React Query) for better performance
 * - Aggressive caching (30s staleTime)
 * - Auto-refetch in background (every 2 min)
 * - Automatic error handling & retry
 */

import { useState, useCallback, useMemo } from 'react';
import { useReferralDashboard } from '../../hooks/useReferralDashboard';

// ============================================
// TYPES
// ============================================

export interface CommissionData {
  id?: string;
  level?: number;
  amount: number;
  date?: string;
  status?: string;
}

export interface RawReferralData {
  id: string;
  name: string;
  code: string;
  level?: number | string;
  status: string;
  joinDate?: string;
  totalEarnings?: number;
  email?: string;
  pendingEarnings?: number;
  approvedEarnings?: number;
  subReferrals?: RawReferralData[];
  subReferralCount?: number;
  referrals?: RawReferralData[];
  commissions?: CommissionData[];
}

export interface TransformedReferral {
  id: string;
  name: string;
  code: string;
  level: string;
  status: 'Active' | 'Pending';
  earnings: string;
  totalEarnings: number;
  registered: string;
  subReferrals: number;
  subReferralsList: RawReferralData[];
  commissions: CommissionData[];
}

// ============================================
// UTILITIES
// ============================================

const transformCache = new Map<string, TransformedReferral>();

export const calculateEarnings = (_level: number, _status: string, totalEarnings = 0): number => {
  // Backend sudah calculate totalEarnings dengan benar berdasarkan commissions
  // Jadi langsung return totalEarnings yang diberikan backend
  return totalEarnings || 0;
};

export const formatCurrency = (amount: number): string => {
  if (amount <= 0) return 'Rp 0';
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

const normalizeStatus = (status: string): 'Active' | 'Pending' => {
  const normalized = status?.toUpperCase() || 'PENDING';
  return normalized === 'ACTIVE' ? 'Active' : 'Pending';
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID');
  } catch {
    return '-';
  }
};

const transformReferralData = (rawReferral: RawReferralData): TransformedReferral => {
  const cacheKey = `${rawReferral.id}-${rawReferral.totalEarnings}-${rawReferral.status}`;
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey)!;
  }

  // Extract level - handle both number and string
  const levelNum = typeof rawReferral.level === 'number' 
    ? rawReferral.level 
    : parseInt(String(rawReferral.level || 0), 10);

  const earnings = calculateEarnings(levelNum, rawReferral.status, rawReferral.totalEarnings);

  const transformed: TransformedReferral = {
    id: rawReferral.id,
    name: rawReferral.name,
    code: rawReferral.code,
    level: `Level ${levelNum}`,
    status: normalizeStatus(rawReferral.status),
    earnings: formatCurrency(earnings),
    totalEarnings: earnings,
    registered: formatDate(rawReferral.joinDate),
    // Prioritize nested referrals field (from API), fall back to subReferrals or subReferralCount
    subReferrals: rawReferral.referrals?.length || rawReferral.subReferralCount || rawReferral.subReferrals?.length || 0,
    subReferralsList: rawReferral.referrals || rawReferral.subReferrals || [],
    commissions: rawReferral.commissions || [],
  };

  transformCache.set(cacheKey, transformed);
  return transformed;
};

const transformReferralArray = (rawReferrals: RawReferralData[]): TransformedReferral[] => {
  return rawReferrals.map((ref) => transformReferralData(ref));
};

const filterReferrals = (
  referrals: TransformedReferral[],
  searchValue: string,
  statusFilter: string | null,
  levelFilter: string | null
): TransformedReferral[] => {
  return referrals.filter((ref) => {
    const searchLower = searchValue.toLowerCase();
    const matchSearch =
      ref.name.toLowerCase().includes(searchLower) ||
      String(ref.code || '').toLowerCase().includes(searchLower);

    const matchStatus = !statusFilter || ref.status === statusFilter;
    const matchLevel = !levelFilter || ref.level === levelFilter;

    return matchSearch && matchStatus && matchLevel;
  });
};

const generateLevelOptions = (referrals: TransformedReferral[]) => {
  const levels = Array.from(new Set(referrals.map(r => r.level)))
    .sort((a, b) => {
      const numA = parseInt(a.replace('Level ', ''), 10);
      const numB = parseInt(b.replace('Level ', ''), 10);
      return numA - numB;
    })
    .map((level) => ({
      value: level,
      label: level === 'Level 1' ? 'Level 1 (Direct)' : level,
    }));

  return levels;
};

// Cache cleared automatically, kept for future manual clearing if needed
// const clearTransformCache = () => {
//   transformCache.clear();
// };

// ============================================
// HOOKS
// ============================================

export interface UseReferralReturn {
  referrals: TransformedReferral[];
  filteredReferrals: TransformedReferral[];
  paginatedReferrals: TransformedReferral[];
  levelOptions: Array<{ value: string; label: string }>;
  loading: boolean;
  error: string | null;
  searchValue: string;
  statusFilter: string | null;
  levelFilter: string | null;
  expandedRows: string[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setSearchValue: (value: string) => void;
  setStatusFilter: (value: string | null) => void;
  setLevelFilter: (value: string | null) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  toggleRow: (id: string) => void;
  stats: {
    totalReferrals: number;
    totalEarnings: number;
    activeCount: number;
    pendingCount: number;
  };
}

export const useReferral = (): UseReferralReturn => {
  const { data: referralData, isLoading, error } = useReferralDashboard();

  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Transform API data to component format
  const referrals = useMemo(() => {
    if (!referralData?.referrals) {
      return [];
    }

    // Handle both response formats:
    // Format 1: { referrals: { totalCount, list } }
    // Format 2: { referrals: [] } - direct array
    let referralsList: any[] = [];
    
    if (Array.isArray(referralData.referrals)) {
      referralsList = referralData.referrals;
    } else if (referralData.referrals?.list && Array.isArray(referralData.referrals.list)) {
      referralsList = referralData.referrals.list;
    }
    
    if (!referralsList || referralsList.length === 0) {
      return [];
    }
    
    // API returns ReferralMember[], need to map to RawReferralData
    const mappedData = referralsList.map(member => ({
      id: member.id,
      name: member.name,
      code: member.code,
      level: member.level ? parseInt(String(member.level), 10) : 0,
      status: member.status,
      joinDate: member.joinDate,
      totalEarnings: member.totalEarnings,
      email: member.email,
      pendingEarnings: member.pendingEarnings,
      approvedEarnings: member.approvedEarnings,
      subReferrals: member.subReferrals as RawReferralData[],
      subReferralCount: member.subReferralCount,
      referrals: member.referrals as RawReferralData[], // ✅ Include nested referrals
      commissions: member.commissions || [],
    }));
    
    return transformReferralArray(mappedData);
  }, [referralData?.referrals]);

  const levelOptions = useMemo(() => {
    return generateLevelOptions(referrals);
  }, [referrals]);

  const filteredReferrals = useMemo(() => {
    return filterReferrals(referrals, searchValue, statusFilter, levelFilter);
  }, [referrals, searchValue, statusFilter, levelFilter]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredReferrals.length / itemsPerPage) || 1;
  }, [filteredReferrals.length, itemsPerPage]);

  const paginatedReferrals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReferrals.slice(startIndex, endIndex);
  }, [filteredReferrals, currentPage, itemsPerPage]);

  const handleSetCurrentPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const handleSetItemsPerPage = useCallback((limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  }, []);

  const handleSetSearchValue = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  const handleSetStatusFilter = useCallback((value: string | null) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleSetLevelFilter = useCallback((value: string | null) => {
    setLevelFilter(value);
    setCurrentPage(1);
  }, []);

  const stats = useMemo(() => {
    return {
      totalReferrals: referrals.length,
      totalEarnings: referrals.reduce((sum, ref) => sum + ref.totalEarnings, 0),
      activeCount: referrals.filter(ref => ref.status === 'Active').length,
      pendingCount: referrals.filter(ref => ref.status === 'Pending').length,
    };
  }, [referrals]);

  // ✅ useReferralDashboard automatically handles:
  // - Fetching on mount
  // - Caching for 30s
  // - Auto-refetch every 2 min
  // - Error handling & retry
  // - No need for useEffect cleanup
  
  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  return {
    referrals,
    filteredReferrals,
    paginatedReferrals,
    levelOptions,
    loading: isLoading,
    error: error?.message ?? null,
    searchValue,
    statusFilter,
    levelFilter,
    expandedRows,
    currentPage,
    itemsPerPage,
    totalPages,
    setSearchValue: handleSetSearchValue,
    setStatusFilter: handleSetStatusFilter,
    setLevelFilter: handleSetLevelFilter,
    setCurrentPage: handleSetCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    toggleRow,
    stats,
  };
};
