import { useState, useCallback, useMemo } from 'react';
import { useReferralDashboard } from '../../../shared/hooks';
import { 
  transformReferralArray, 
  filterReferrals, 
  generateLevelOptions 
} from '../utils/referralUtils';
import type { 
  RawReferralData, 
  UseReferralReturn 
} from '../types/referralTypes';

export const useReferral = (): UseReferralReturn => {
  const { data: referralData, isLoading, error } = useReferralDashboard();

  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const referrals = useMemo(() => {
    if (!referralData?.referrals) {
      return [];
    }

    let referralsList: any[] = [];
    
    if (Array.isArray(referralData.referrals)) {
      referralsList = referralData.referrals;
    } else if (referralData.referrals?.list && Array.isArray(referralData.referrals.list)) {
      referralsList = referralData.referrals.list;
    }
    
    if (!referralsList || referralsList.length === 0) {
      return [];
    }
    
    const mappedData = referralsList.map(member => ({
      id: member.id,
      name: member.name,
      code: member.code,
      level: member.level ? parseInt(String(member.level), 10) : 0,
      status: member.status,
      joinDate: member.joinDate,
      registeredAt: member.registeredAt,
      totalEarnings: member.totalEarnings,
      email: member.email,
      pendingEarnings: member.pendingEarnings,
      approvedEarnings: member.approvedEarnings,
      subReferrals: member.subReferrals as RawReferralData[],
      subReferralCount: member.subReferralCount,
      referrals: member.referrals as RawReferralData[],
      commissions: member.commissions || [],
      commissionFromThisReferral: member.commissionFromThisReferral,
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
