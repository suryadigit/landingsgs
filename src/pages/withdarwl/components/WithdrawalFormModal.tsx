import React from 'react'
import { Modal, Stack, Box, Text, NumberInput, Select, TextInput, Button, Group, Alert } from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { COLORS } from '../../../types/colors'
import { BANK_OPTIONS } from '../withdrawalConstants'
import type { WithdrawalFormData } from '../useWithdrawalPage'

interface WithdrawalFormModalProps {
  dark: boolean
  opened: boolean
  onClose: () => void
  formData: WithdrawalFormData
  updateFormField: <K extends keyof WithdrawalFormData>(field: K, value: WithdrawalFormData[K]) => void
  onSubmit: () => void
  submitting: boolean
  isFormValid: boolean
  availableBalance: number
  maxAvailableForWithdrawal: number
  minimumWithdrawal: number
  maximumWithdrawal: number
  minimumBalanceRemaining: number
}

export const WithdrawalFormModal: React.FC<WithdrawalFormModalProps> = ({
  dark,
  opened,
  onClose,
  formData,
  updateFormField,
  onSubmit,
  submitting,
  isFormValid,
  availableBalance,
  maxAvailableForWithdrawal,
  minimumWithdrawal,
  maximumWithdrawal,
  minimumBalanceRemaining,
}) => {
  const withdrawAmountNum = typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount
  const remainingBalance = availableBalance - (withdrawAmountNum || 0)

  const renderValidationAlert = () => {
    if (!formData.amount || isNaN(withdrawAmountNum) || withdrawAmountNum === 0) return null

    if (withdrawAmountNum < minimumWithdrawal) {
      return (
        <Alert color="orange" mt={12} icon={<IconAlertCircle size={16} />} title="Jumlah Kurang dari Minimum">
          Jumlah pencairan minimal Rp {minimumWithdrawal.toLocaleString('id-ID')}.
        </Alert>
      )
    }

    if (withdrawAmountNum > maximumWithdrawal) {
      return (
        <Alert color="red" mt={12} icon={<IconAlertCircle size={16} />} title="Melebihi Batas Harian">
          Pencairan tidak bisa lebih dari Rp {maximumWithdrawal.toLocaleString('id-ID')} dalam 24 jam.
        </Alert>
      )
    }

    if (withdrawAmountNum > maxAvailableForWithdrawal) {
      return (
        <Alert color="red" mt={12} icon={<IconAlertCircle size={16} />} title="Saldo Tidak Cukup">
          Saldo yang bisa dicairkan hanya Rp {maxAvailableForWithdrawal.toLocaleString('id-ID')}.
        </Alert>
      )
    }

    if (remainingBalance > 0 && remainingBalance < minimumBalanceRemaining) {
      return (
        <Alert color="orange" mt={12} icon={<IconAlertCircle size={16} />} title="Sisa Saldo Kurang dari Minimum">
          Setelah pencairan, sisa saldo akan kurang dari minimum Rp {minimumBalanceRemaining.toLocaleString('id-ID')}.
        </Alert>
      )
    }

    return (
      <Alert color="green" mt={12} icon={<IconCheck size={16} />} title="Jumlah Valid">
        Pencairan Rp {withdrawAmountNum.toLocaleString('id-ID')} siap diproses.
      </Alert>
    )
  }

  const inputStyles = {
    input: {
      backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
      border: `1px solid ${COLORS.border}`,
      color: dark ? '#ffffff' : COLORS.text.dark,
      height: 44,
      borderRadius: 8,
    },
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Request Pencairan"
      centered
      size="md"
      styles={{
        title: { color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 },
        content: { backgroundColor: dark ? '#1a1a1a' : '#ffffff' },
      }}
    >
      <Stack gap={20}>
        <Box>
          <Text style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Jumlah Pencairan
          </Text>
          <NumberInput
            placeholder="Masukkan jumlah"
            value={formData.amount}
            onChange={(val) => updateFormField('amount', val)}
            min={minimumWithdrawal}
            max={availableBalance}
            hideControls
            thousandSeparator=","
            styles={inputStyles}
          />
          <Group justify="space-between" mt={8}>
            <Text style={{ color: COLORS.text.tertiary, fontSize: 12 }}>
              Minimum: Rp {minimumWithdrawal.toLocaleString('id-ID')}
            </Text>
            <Text style={{ color: COLORS.text.tertiary, fontSize: 12 }}>
              Max: Rp {maxAvailableForWithdrawal.toLocaleString('id-ID')}
            </Text>
          </Group>
          {renderValidationAlert()}
          
          {formData.amount && (
            <Box mt={12} style={{ backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12 }}>
              <Group justify="space-between" mb={8}>
                <Text style={{ color: COLORS.text.tertiary, fontSize: 12 }}>Saldo Saat Ini</Text>
                <Text style={{ color: COLORS.accent.primary, fontWeight: 600, fontSize: 12 }}>Rp {availableBalance.toLocaleString('id-ID')}</Text>
              </Group>
              <Group justify="space-between" mb={8}>
                <Text style={{ color: COLORS.text.tertiary, fontSize: 12 }}>Pencairan</Text>
                <Text style={{ color: '#f97316', fontWeight: 600, fontSize: 12 }}>- Rp {withdrawAmountNum.toLocaleString('id-ID')}</Text>
              </Group>
              <Group justify="space-between" style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
                <Text style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700, fontSize: 13 }}>Sisa Saldo</Text>
                <Text style={{ color: remainingBalance < minimumBalanceRemaining ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: 13 }}>
                  Rp {remainingBalance.toLocaleString('id-ID')}
                </Text>
              </Group>
            </Box>
          )}
        </Box>

        <Box>
          <Text style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Nama Bank
          </Text>
          <Select
            placeholder="Pilih bank Anda"
            data={[...BANK_OPTIONS]}
            value={formData.bankName}
            onChange={(val) => updateFormField('bankName', val || '')}
            searchable
            clearable
            styles={{ ...inputStyles, dropdown: { backgroundColor: dark ? '#1a1a1a' : '#ffffff' } }}
          />
        </Box>

        <Box>
          <Text style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Nomor Rekening
          </Text>
          <TextInput
            placeholder="Masukkan nomor rekening bank Anda"
            value={formData.accountNumber}
            onChange={(e) => updateFormField('accountNumber', e.currentTarget.value)}
            styles={inputStyles}
          />
        </Box>

        <Box>
          <Text style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Nama Akun
          </Text>
          <TextInput
            placeholder="Nama pada rekening bank Anda"
            value={formData.accountName}
            onChange={(e) => updateFormField('accountName', e.currentTarget.value)}
            styles={inputStyles}
          />
        </Box>

        <Group grow pt={16}>
          <Button
            variant="default"
            onClick={onClose}
            style={{ backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', color: dark ? '#ffffff' : COLORS.text.dark, height: 44, borderRadius: 8, fontWeight: 700, border: `1px solid ${COLORS.border}` }}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!isFormValid}
            loading={submitting}
            style={{ backgroundColor: COLORS.accent.primary, color: '#000000', height: 44, borderRadius: 8, fontWeight: 700, border: 'none' }}
          >
            {submitting ? 'Mohon Tunggu Sebentar' : 'Tarik'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
