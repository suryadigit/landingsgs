import React from 'react'
import { Box, Text, Table, Badge, Group, Skeleton } from '@mantine/core'
import { IconClock, IconCheck, IconX } from '@tabler/icons-react'
import { useMediaQuery } from '@mantine/hooks'
import { COLORS } from '../../../shared/types'
import { getStatusColor, getStatusLabel, formatDateWithTime } from '../constants/withdrawalConstants'

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

  const isMobile = useMediaQuery('(max-width: 768px)')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <IconClock size={14} />
      case 'APPROVED':
      case 'COMPLETED':
        return <IconCheck size={14} />
      case 'REJECTED':
        return <IconX size={14} />
      default:
        return <IconClock size={14} />
    }
  }

  if (loading) {
    return (
      <Box style={{ padding: 12 }}>
        <Table style={{ width: '100%', maxWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 , tableLayout: 'fixed'}}>
          <Table.Thead style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)' }}>
            <Table.Tr>
              <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 }}>Tanggal</Table.Th>
              <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 }}>Jumlah</Table.Th>
              <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 }}>Bank</Table.Th>
              <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 }}>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[1, 2, 3].map((i) => (
              <Table.Tr key={i}>
                <Table.Td style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary, fontSize: 13 }}>
                  <Box>
                    <Skeleton height={12} width={110} radius="sm" mb={6} />
                    <Skeleton height={10} width={70} radius="sm" />
                  </Box>
                </Table.Td>
                <Table.Td style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 600 }}>
                  <Skeleton height={16} width={120} radius="sm" />
                </Table.Td>
                <Table.Td style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary }}>
                  <Skeleton height={12} width={80} radius="sm" />
                </Table.Td>
                <Table.Td>
                  <Skeleton height={20} width={80} radius="xl" />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
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

  if (isMobile) {
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {withdrawalHistory.map((w) => (
          <Box key={w.id} style={{ backgroundColor: dark ? '#0f0f0f' : '#ffffff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12, boxShadow: '0 6px 16px rgba(0,0,0,0.04)' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Text style={{ fontSize: 13, fontWeight: 600, color: dark ? '#ffffff' : COLORS.text.dark }}>{getDisplayDate(w).split(' ')[0]}</Text>
                <Text style={{ fontSize: 11, color: dark ? '#a1a1a1' : COLORS.text.tertiary, marginTop: 6 }}>{getDisplayDate(w).split(' ').slice(1).join(' ')}</Text>
              </Box>

              <Box style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: 14, fontWeight: 700, color: dark ? '#ffffff' : COLORS.text.dark }}>Rp {(w.amount || 0).toLocaleString('id-ID')}</Text>
                <Text style={{ fontSize: 12, color: dark ? '#a1a1a1' : COLORS.text.tertiary, marginTop: 6 }}>{w.bankName || '-'}</Text>
              </Box>
            </Box>

            <Box style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <Badge color={getStatusColor(w.status)} variant="filled" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Group gap={8} align="center">
                  {getStatusIcon(w.status)}
                  <Text style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{getStatusLabel(w.status)}</Text>
                </Group>
              </Badge>
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  return (
    // web
    <Box
      style={{
        backgroundColor: dark ? '#1a1a1a' : '#ffffff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: 12,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        alignSelf: 'stretch',
      }}
    >
      <Table
        style={{
          width: '100%',
          maxWidth: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          minWidth: 0,
          tableLayout: 'fixed',
        }}
      >
        <Table.Thead style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)' }}>
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
                    <Badge color={getStatusColor(withdrawal.status)} variant="filled" style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center' }}>
                      <Group gap={8} align="center">
                        {getStatusIcon(withdrawal.status)}
                        <Text style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{getStatusLabel(withdrawal.status)}</Text>
                      </Group>
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
