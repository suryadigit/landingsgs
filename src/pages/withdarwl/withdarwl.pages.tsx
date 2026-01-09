import React from 'react'
import { Box, Container, Group, Text, Title, Button, Alert, useMantineColorScheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconWallet, IconAlertCircle } from '@tabler/icons-react'
import { DashboardLayout } from '../../components/dashboardlayout/dashboard.layout'
import { COLORS } from '../../types/colors'
import { useWithdrawalPage } from './useWithdrawalPage'
import {
  BalanceCard,
  WithdrawalHistory,
  WithdrawalFormModal,
  NotificationModal,
  WithdrawalInfo,
} from './components'

const WithdrawalPage: React.FC = () => {
  const { colorScheme } = useMantineColorScheme()
  const dark = colorScheme === 'dark'
  const isMobile = useMediaQuery('(max-width: 768px)')

  const {
    modalOpened,
    setModalOpened,
    formData,
    updateFormField,
    submitting,
    notification,
    closeNotification,
    handleWithdrawal,
    isFormValid,
    loading,
    availableBalance,
    withdrawalHistory,
    maxAvailableForWithdrawal,
    isWithdrawalAllowed,
    constants,
  } = useWithdrawalPage()

  const content = (
    <Box style={{ backgroundColor: dark ? '#0d0d0d' : COLORS.bg.primary, minHeight: '100vh', padding: '40px 0' }}>
      <NotificationModal dark={dark} notification={notification} onClose={closeNotification} />

      <Container size="xl">
        <Group justify="space-between" align="flex-start" mb={40}>
          <Box>
            <Title order={1} style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 32, fontWeight: 700 }}>
              Pencairan
            </Title>
            <Text style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary, fontSize: 14, marginTop: 4 }}>
              Ajukan pencairan penghasilan Anda
            </Text>
          </Box>
        </Group>

        <BalanceCard
          dark={dark}
          loading={loading}
          availableBalance={availableBalance}
          maxAvailableForWithdrawal={maxAvailableForWithdrawal}
          minimumBalanceRemaining={constants.MINIMUM_BALANCE_REMAINING}
        />

        {!isWithdrawalAllowed && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Pencairan Tidak Tersedia"
            color="orange"
            style={{
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid #f97316',
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <Text style={{ color: '#f97316', fontSize: 14 }}>
              {availableBalance < constants.MINIMUM_BALANCE_REMAINING
                ? `Saldo Anda (Rp ${availableBalance.toLocaleString('id-ID')}) belum mencapai minimum saldo tersisa (Rp ${constants.MINIMUM_BALANCE_REMAINING.toLocaleString('id-ID')}).`
                : `Saldo yang bisa ditarik (Rp ${maxAvailableForWithdrawal.toLocaleString('id-ID')}) belum memenuhi minimum pencairan (Rp ${constants.MINIMUM_WITHDRAWAL.toLocaleString('id-ID')}).`}
            </Text>
          </Alert>
        )}

        <Button
          onClick={() => setModalOpened(true)}
          disabled={!isWithdrawalAllowed}
          style={{
            width: '100%',
            height: isMobile ? 56 : 70,
            borderRadius: 20,
            fontSize: isMobile ? 16 : 18,
            fontWeight: 900,
            background: isWithdrawalAllowed
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
            color: '#ffffff',
            border: 'none',
            cursor: isWithdrawalAllowed ? 'pointer' : 'not-allowed',
            boxShadow: isWithdrawalAllowed
              ? '0 20px 48px rgba(59, 130, 246, 0.4)'
              : '0 8px 16px rgba(156, 163, 175, 0.2)',
          }}
        >
          <Group gap={12} style={{ justifyContent: 'center' }}>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <IconWallet size={18} style={{ color: '#ffffff' }} />
            </Box>
            Ajukan Pencairan
          </Group>
        </Button>

        <WithdrawalInfo dark={dark} />

        <Box mt={40}>
          <Title order={2} mb={20} style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 20, fontWeight: 700 }}>
            Riwayat Pencairan
          </Title>
          <WithdrawalHistory dark={dark} loading={loading} withdrawalHistory={withdrawalHistory} />
        </Box>
      </Container>

      <WithdrawalFormModal
        dark={dark}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        formData={formData}
        updateFormField={updateFormField}
        onSubmit={handleWithdrawal}
        submitting={submitting}
        isFormValid={isFormValid}
        availableBalance={availableBalance}
        maxAvailableForWithdrawal={maxAvailableForWithdrawal}
        minimumWithdrawal={constants.MINIMUM_WITHDRAWAL}
        maximumWithdrawal={constants.MAXIMUM_WITHDRAWAL}
        minimumBalanceRemaining={constants.MINIMUM_BALANCE_REMAINING}
      />
    </Box>
  )

  return <DashboardLayout>{content}</DashboardLayout>
}

export default WithdrawalPage
