import type { NotificationTypeOption, StatusFilterOption } from '../types/notificationPageTypes';

export const ITEMS_PER_PAGE = 10;

export const notificationTypeOptions: NotificationTypeOption[] = [
  { value: "ALL", label: "Semua Tipe" },
  { value: "WITHDRAWAL_REQUEST", label: "Permintaan Pencairan" },
  { value: "WITHDRAWAL_APPROVED", label: "Pencairan Disetujui" },
  { value: "WITHDRAWAL_REJECTED", label: "Pencairan Ditolak" },
  { value: "COMMISSION_APPROVED", label: "Komisi Disetujui" },
  { value: "COMMISSION_PAID", label: "Komisi Dibayar" },
  { value: "ACCOUNT_ACTIVATED", label: "Akun Diaktifkan" },
  { value: "SYSTEM_ANNOUNCEMENT", label: "Pengumuman Sistem" },
  { value: "NEW_REFERRAL", label: "Referral Baru" },
  { value: "NEW_COMMISSION", label: "Komisi Baru" },
];

export const statusFilterOptions: StatusFilterOption[] = [
  { value: "all", label: "Semua" },
  { value: "unread", label: "Belum Dibaca" },
  { value: "read", label: "Sudah Dibaca" },
];

export const notificationTypeLabels: Record<string, string> = {
  WITHDRAWAL_REQUEST: "Permintaan Penarikan",
  WITHDRAWAL_APPROVED: "Penarikan Disetujui",
  WITHDRAWAL_REJECTED: "Penarikan Ditolak",
  WITHDRAWAL_COMPLETED: "Penarikan Selesai",
  COMMISSION_EARNED: "Komisi Diterima",
  COMMISSION_APPROVED: "Komisi Disetujui",
  REFERRAL_JOINED: "Referral Bergabung",
  SYSTEM: "Sistem",
  WELCOME: "Selamat Datang",
  PROMO: "Promo",
};
