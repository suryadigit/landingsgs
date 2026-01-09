import type { RawReferralData, TransformedReferral, StatusColorConfig } from '../types/referralTypes';
const transformCache = new Map<string, TransformedReferral>();

export const calculateEarnings = (_level: number, _status: string, totalEarnings = 0): number => {
  return totalEarnings || 0;
};

export const formatCurrency = (amount: number): string => {
  if (amount <= 0) return 'Rp 0';
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const normalizeStatus = (status: string): 'Active' | 'Pending' => {
  const normalized = status?.toUpperCase() || 'PENDING';
  return normalized === 'ACTIVE' ? 'Active' : 'Pending';
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID');
  } catch {
    return '-';
  }
};

export const transformReferralData = (rawReferral: RawReferralData): TransformedReferral => {
  const cacheKey = `${rawReferral.id}-${rawReferral.totalEarnings}-${rawReferral.status}-${rawReferral.registeredAt}-${rawReferral.commissionFromThisReferral?.total || 0}`;
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey)!;
  }

  const levelNum = typeof rawReferral.level === 'number' 
    ? rawReferral.level 
    : parseInt(String(rawReferral.level || 0), 10);

  const earningsFromReferral = rawReferral.commissionFromThisReferral?.total || 0;
  const earnings = earningsFromReferral > 0 ? earningsFromReferral : calculateEarnings(levelNum, rawReferral.status, rawReferral.totalEarnings);

  const transformed: TransformedReferral = {
    id: rawReferral.id,
    name: rawReferral.name,
    code: rawReferral.code,
    level: `Level ${levelNum}`,
    status: normalizeStatus(rawReferral.status),
    earnings: formatCurrency(earnings),
    totalEarnings: earnings,
    registered: formatDate(rawReferral.registeredAt || rawReferral.joinDate),
    subReferrals: rawReferral.referrals?.length || rawReferral.subReferralCount || rawReferral.subReferrals?.length || 0,
    subReferralsList: rawReferral.referrals || rawReferral.subReferrals || [],
    commissions: rawReferral.commissions || [],
    commissionFromThisReferral: rawReferral.commissionFromThisReferral,
  };

  transformCache.set(cacheKey, transformed);
  return transformed;
};

export const transformReferralArray = (rawReferrals: RawReferralData[]): TransformedReferral[] => {
  return rawReferrals.map((ref) => transformReferralData(ref));
};

export const filterReferrals = (
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

export const generateLevelOptions = (referrals: TransformedReferral[]) => {
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

export const getStatusColors = (status: 'Active' | 'Pending' | 'Inactive'): StatusColorConfig => {
  switch (status) {
    case 'Active':
      return { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    case 'Pending':
      return { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' };
    default:
      return { color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
  }
};

export const getFontSizeForCurrency = (currencyString: string): 'xs' | 'sm' | 'md' | 'lg' => {
  const length = currencyString.replace(/[^0-9]/g, '').length;
  
  if (length > 12) return 'xs';
  if (length > 10) return 'xs';
  if (length > 8) return 'sm';
  return 'md';
};

export const getLevelColor = (level: number): string => {
  const colors: Record<number, string> = {
    1: '#3b82f6',
    2: '#8b5cf6',
    3: '#ec4899',
    4: '#f97316',
    5: '#14b8a6',
    6: '#eab308',
    7: '#ef4444',
    8: '#06b6d4',
    9: '#84cc16',
    10: '#6366f1',
  };
  return colors[level] || colors[1];
};
