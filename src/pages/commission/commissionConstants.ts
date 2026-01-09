import {
  IconClock,
  IconCreditCard,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

export const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof IconClock }> = {
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
