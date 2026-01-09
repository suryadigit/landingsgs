import {
  IconClock,
  IconCreditCard,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import type { StatusConfig } from '../types/commissionTypes';
export const STATUS_CONFIG: Record<string, StatusConfig> = {
  PENDING: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.1)',
    icon: IconClock,
  },
  APPROVED: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: IconCreditCard,
  },
  PAID: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: IconCheck,
  },
  REJECTED: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: IconX,
  },
};

export const DEFAULT_STATUS_COLOR = '#a1a1a1';
export const DEFAULT_STATUS_BG = 'rgba(148, 163, 184, 0.1)';

export const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'PENDING', label: 'Pending (Menunggu Review)' },
  { value: 'APPROVED', label: 'Approved (Siap Dicairkan)' },
  { value: 'PAID', label: 'Paid (Sudah Dicairkan)' },
];

export const DEFAULT_PAGE = 1;
export const DEFAULT_ITEMS_PER_PAGE = 20;
