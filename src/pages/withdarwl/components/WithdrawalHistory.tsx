import React from 'react'
import { Box, Text, Table, Badge, Group, Loader } from '@mantine/core'
import { IconClock } from '@tabler/icons-react'
import { COLORS } from '../../../types/colors'
import { getStatusColor, getStatusLabel, formatDateWithTime } from '../withdrawalConstants'

interface WithdrawalHistoryItem {
  id: string
  amount: number
  status: string
  bankName: string
  requestedAt?: string
  approvedAt?: string
  completedAt?: string
}

interface WithdrawalHistoryProps {
  dark: boolean
  loading: boolean
  withdrawalHistory: WithdrawalHistoryItem[]
}

export const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({
  dark,
  loading,
  withdrawalHistory,
}) => {
  const getDisplayDate = (withdrawal: WithdrawalHistoryItem): string => {
    if (withdrawal.status === 'PENDING' && withdrawal.requestedAt) {
      return formatDateWithTime(withdrawal.requestedAt)
    }
    if (withdrawal.status === 'COMPLETED' && withdrawal.completedAt) {
      return formatDateWithTime(withdrawal.completedAt)
    }
    if (withdrawal.status === 'APPROVED' && withdrawal.approvedAt) {
      return formatDateWithTime(withdrawal.approvedAt)
    }
    if (withdrawal.status === 'REJECTED' && withdrawal.completedAt) {
      return formatDateWithTime(withdrawal.completedAt)
    }
    return formatDateWithTime(withdrawal.requestedAt)
  }

  const getStatusTime = (withdrawal: WithdrawalHistoryItem): string => {
    const formatTime = (dateStr?: string) => {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }

    switch (withdrawal.status) {
      case 'PENDING':
        return `Diminta: ${formatTime(withdrawal.requestedAt)}`
      case 'COMPLETED':
        return `Selesai: ${formatTime(withdrawal.completedAt)}`
      case 'APPROVED':
        return `Disetujui: ${formatTime(withdrawal.approvedAt)}`
      case 'REJECTED':
        return `Ditolak: ${formatTime(withdrawal.completedAt)}`
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: dark ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Loader size={40} color={COLORS.accent.primary} />
        <Text style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary, fontSize: 14 }}>
          Memuat riwayat pencairan...
        </Text>
      </Box>
    )
  }

  if (withdrawalHistory.length === 0) {
    return (
      <Box
        style={{
          backgroundColor: dark ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
        }}
      >
        <Group justify="center" mb={16}>
          <IconClock size={48} color={dark ? '#a1a1a1' : COLORS.text.tertiary} opacity={0.5} />
        </Group>
        <Text style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary, fontSize: 16 }}>
          Belum ada riwayat pencairan
        </Text>
      </Box>
    )
  }

  return (
    <Box
      style={{
        backgroundColor: dark ? '#1a1a1a' : '#ffffff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <Table striped highlightOnHover>
        <Table.Thead style={{ backgroundColor: dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }}>
          <Table.Tr>
            <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 }}>Tanggal</Table.Th>
            <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 }}>Jumlah</Table.Th>
            <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 }}>Bank</Table.Th>
            <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 }}>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {withdrawalHistory.map((withdrawal) => {
            const displayDate = getDisplayDate(withdrawal)
            return (
              <Table.Tr key={withdrawal.id}>
                <Table.Td style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary, fontSize: 13 }}>
                  <Box>
                    <Text style={{ fontSize: 13, fontWeight: 500, color: dark ? '#ffffff' : COLORS.text.dark }}>
                      {displayDate.split(' ')[0]}
                    </Text>
                    <Text style={{ fontSize: 11, color: dark ? '#a1a1a1' : COLORS.text.tertiary, marginTop: 2 }}>
                      {displayDate.split(' ').slice(1).join(' ')}
                    </Text>
                  </Box>
                </Table.Td>
                <Table.Td style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 600 }}>
                  Rp {(withdrawal.amount || 0).toLocaleString('id-ID')}
                </Table.Td>
                <Table.Td style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary }}>
                  {withdrawal.bankName || '-'}
                </Table.Td>
                <Table.Td>
                  <Box>
                    <Badge color={getStatusColor(withdrawal.status)} variant="light" style={{ marginBottom: 8 }}>
                      {getStatusLabel(withdrawal.status)}
                    </Badge>
                    <Text style={{ fontSize: 11, color: dark ? '#a1a1a1' : COLORS.text.tertiary }}>
                      {getStatusTime(withdrawal)}
                    </Text>
                  </Box>
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
