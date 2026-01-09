import { useState, useMemo, useCallback } from 'react';
import { 
  STATUS_CONFIG, 
  DEFAULT_STATUS_COLOR, 
  DEFAULT_STATUS_BG,
  DEFAULT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
} from '../constants/commissionConstants';
import { useCommissionTransactions } from '../../../shared/hooks';
import type { Commission, CommissionSummary, UseCommissionReturn } from '../types/commissionTypes';

export const useCommission = (): UseCommissionReturn => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const { 
    data: commissionData, 
    isLoading, 
    error,
    refetch,
  } = useCommissionTransactions({
    page: currentPage,
    limit: itemsPerPage,
  });
  const commissions = useMemo(() => {
    if (!commissionData?.transactions) {
      return [];
    }
    
    return commissionData.transactions.map((transaction: any) => ({
      id: transaction.id,
      transactionId: transaction.transactionId,
      from: transaction.from,
      level: transaction.level,
      amount: transaction.amount,
      status: transaction.status,
      createdAt: transaction.createdAt,
      approvedAt: transaction.approvedAt,
      paidAt: transaction.paidAt,
    }));
  }, [commissionData?.transactions]);

  const summary = useMemo<CommissionSummary | null>(() => {
    return commissionData?.summary || null;
  }, [commissionData?.summary]);

  const pagination = useMemo(() => {
    return commissionData?.pagination || null;
  }, [commissionData?.pagination]);

  const filteredCommissions = useMemo(() => {
    return commissions.filter((commission: Commission) => {
      const transactionId = commission.transactionId || '';
      const from = commission.from || '';
      
      const matchSearch =
        transactionId.toLowerCase().includes(searchValue.toLowerCase()) ||
        from.toLowerCase().includes(searchValue.toLowerCase());

      const matchStatus =
        !statusFilter ||
        statusFilter === 'ALL' ||
        commission.status.toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchStatus;
    });
  }, [commissions, searchValue, statusFilter]);

  const getStatusColor = useCallback((status: string): string => {
    const upperStatus = status.toUpperCase();
    return STATUS_CONFIG[upperStatus]?.color || DEFAULT_STATUS_COLOR;
  }, []);

  const getStatusBg = useCallback((status: string): string => {
    const upperStatus = status.toUpperCase();
    return STATUS_CONFIG[upperStatus]?.bg || DEFAULT_STATUS_BG;
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const upperStatus = status.toUpperCase();
    return STATUS_CONFIG[upperStatus]?.icon || null;
  }, []);

  const pendingAmount = useMemo(() => {
    return summary?.pending || 0;
  }, [summary]);

  const approvedAmount = useMemo(() => {
    return summary?.approved || 0;
  }, [summary]);

  const refreshCommissions = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const totalPages = pagination?.pages || 1;
  const totalItems = pagination?.total || 0;

  const handleItemsPerPageChange = useCallback((limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  }, []);

  return {
    commissions,
    filteredCommissions,
    summary,
    pagination,
    isLoading,
    error: error?.message ?? null,
    searchValue,
    statusFilter,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    setSearchValue,
    setStatusFilter,
    setCurrentPage,
    setItemsPerPage: handleItemsPerPageChange,
    getStatusColor,
    getStatusBg,
    getStatusIcon,
    pendingAmount,
    approvedAmount,
    refreshCommissions,
  };
};
