import type { StatusBadgeInfo, LevelColors } from '../types/dashboardTypes';

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
