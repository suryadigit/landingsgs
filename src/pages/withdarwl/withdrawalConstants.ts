export const WITHDRAWAL_CONSTANTS = {
  MINIMUM_WITHDRAWAL: 10000,
  MAXIMUM_WITHDRAWAL: 500000,
  MINIMUM_BALANCE_REMAINING: 25000,
} as const

export const BANK_OPTIONS = [
  { value: 'BCA', label: 'BCA (Bank Central Asia)', badge: '🏢' },
  { value: 'Mandiri', label: 'Mandiri (Bank Mandiri)', badge: '🏦' },
  { value: 'BNI', label: 'BNI (Bank Negara Indonesia)', badge: '🏧' },
  { value: 'BRI', label: 'BRI (Bank Rakyat Indonesia)', badge: '💰' },
  { value: 'Maybank', label: 'Maybank (Bank Mayapada)', badge: '🏪' },
  { value: 'CIMB Niaga', label: 'CIMB Niaga', badge: '🏛️' },
  { value: 'Danamon', label: 'Danamon', badge: '💳' },
  { value: 'Permata', label: 'Bank Permata', badge: '💎' },
  { value: 'Artha', label: 'Bank Artha', badge: '🤝' },
  { value: 'Panin', label: 'Bank Panin', badge: '📊' },
  { value: 'OCBC NISP', label: 'OCBC NISP', badge: '🏢' },
  { value: 'DBS', label: 'Bank DBS', badge: '🌐' },
  { value: 'BTN', label: 'BTN (Bank Tabungan Negara)', badge: '🏦' },
  { value: 'Bukopin', label: 'Bank Bukopin', badge: '💼' },
  { value: 'Mega', label: 'Bank Mega', badge: '📈' },
  { value: 'OVO', label: 'OVO', badge: '📱' },
  { value: 'DANA', label: 'DANA', badge: '💵' },
  { value: 'LinkAja', label: 'LinkAja', badge: '🔗' },
] as const

export const WITHDRAWAL_INFO = [
  'Durasi : 1-3 hari kerja',
  'Minimum penarikan: Rp 10.000',
  'Maximum penarikan: Rp 500.000 per 24 jam',
  'Minimum saldo yang harus tersisa di dompet: Rp 25.000 (tidak bisa ditarik)',
  'Gratis biaya administrasi'
] as const

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'yellow',
    APPROVED: 'blue',
    COMPLETED: 'green',
    REJECTED: 'red',
  }
  return colors[status] || 'gray'
}

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Menunggu',
    APPROVED: 'Disetujui',
    COMPLETED: 'Selesai',
    REJECTED: 'Ditolak',
  }
  return labels[status] || status
}

export const formatDateWithTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    const dateStr = date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
    const timeStr = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    return `${dateStr} ${timeStr}`
  } catch {
    return '-'
  }
}
