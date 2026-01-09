import { useState, useMemo, useCallback } from 'react';
import { STATUS_CONFIG, DEFAULT_STATUS_COLOR, DEFAULT_STATUS_BG } from './commissionConstants';
import { useCommissionTransactions } from '../../hooks/useCommissionTransactions';

interface Commission {
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

interface CommissionSummary {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  withdrawn: number;
}

interface UseCommissionReturn {
  commissions: Commission[];
  filteredCommissions: Commission[];
  summary: CommissionSummary | null;
  pagination: any;
  isLoading: boolean;
  error: string | null;
  searchValue: string;
  statusFilter: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  setSearchValue: (value: string) => void;
  setStatusFilter: (value: string | null) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  getStatusColor: (status: string) => string;
  getStatusBg: (status: string) => string;
  getStatusIcon: (status: string) => any;
  pendingAmount: number;
  approvedAmount: number;
  refreshCommissions: () => Promise<void>;
}

export const useCommission = (): UseCommissionReturn => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // ✅ Use optimized React Query hook instead of useState + useEffect
  const { 
    data: commissionData, 
    isLoading, 
    error,
    refetch,
  } = useCommissionTransactions({
    page: currentPage,
    limit: itemsPerPage,
  });

  // Transform API data to component format
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

  // Get summary and pagination from cached data
  const summary = useMemo(() => {
    return commissionData?.summary || null;
  }, [commissionData?.summary]);

  const pagination = useMemo(() => {
    return commissionData?.pagination || null;
  }, [commissionData?.pagination]);

  // Filter commissions based on search value and status
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

  const getStatusColor = (status: string): string => {
    const upperStatus = status.toUpperCase();
    return STATUS_CONFIG[upperStatus]?.color || DEFAULT_STATUS_COLOR;
  };

  const getStatusBg = (status: string): string => {
    const upperStatus = status.toUpperCase();
    return STATUS_CONFIG[upperStatus]?.bg || DEFAULT_STATUS_BG;
  };

  const getStatusIcon = (status: string) => {
    const upperStatus = status.toUpperCase();
    return STATUS_CONFIG[upperStatus]?.icon || null;
  };

  // Calculate total amounts based on status
  const pendingAmount = useMemo(() => {
    return commissions
      .filter((c) => c.status === 'PENDING')
      .reduce((total, c) => total + c.amount, 0);
  }, [commissions]);

  const approvedAmount = useMemo(() => {
    return commissions
      .filter((c) => c.status === 'APPROVED')
      .reduce((total, c) => total + c.amount, 0);
  }, [commissions]);

  // Refresh function - refetch using React Query
  const refreshCommissions = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Calculate totalPages and totalItems from pagination
  const totalPages = pagination?.pages || 1;
  const totalItems = pagination?.total || 0;

  // Reset to page 1 when itemsPerPage changes
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
