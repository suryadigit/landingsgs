import React from 'react'
import { Box, Container, Group, Text, Title, Alert, useMantineColorScheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertCircle } from '@tabler/icons-react'
import { DashboardLayout } from '../../../components/dashboardlayout/dashboard.layout'
import { COLORS } from '../../../shared/types'
import { useSidebar } from '../../../contexts/SidebarContext'
import { useWithdrawalPage } from '../hooks/useWithdrawalPage'
import {
  BalanceCard,
  WithdrawalHistory,
  NotificationModal,
  // WithdrawalInfo,
  WithdrawalFormPanel,
} from '../components'
import WithdrawalBarChart from '../components/WithdrawalBarChart'

const WithdrawalPage: React.FC = () => {
  const { colorScheme } = useMantineColorScheme()
  const dark = colorScheme === 'dark'
  const isMobile = useMediaQuery('(max-width: 768px)')

  const {
    formData,
    submitting,
    notification,
    isFormValid,
    loading,
    availableBalance,
    withdrawalHistory,
    maxAvailableForWithdrawal,
    isWithdrawalAllowed,
    constants,
    updateFormField,
    closeNotification,
    handleWithdrawal,
  } = useWithdrawalPage()

  const [inlineOpen, setInlineOpen] = React.useState(false)

  const { sidebarWidth, isOpen } = useSidebar()

  const content = (
    <Box
      style={{
        paddingInlineStart: '10px',
        backgroundColor: dark ? '#0d0d0d' : COLORS.bg.primary,
        minHeight: '100vh',
        paddingBottom: isMobile ? 80 : 120,
      }}
    >
      <Box style={{ width: '100%', position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
        <Box style={{ display: 'flex', width: '100%' }}>
          <Box
            style={{
              width: isMobile ? 0 : isOpen ? sidebarWidth : 60,
              height: isMobile ? 140 : 220,
              background: dark ? '#0d0d0d' : '#143a2b',
            }}
          />
          <Box
            style={{
              flex: 1,
              height: isMobile ? 140 : 220,
              background: '#143a2b',
              borderBottomLeftRadius: 36,
              borderBottomRightRadius: 36,
              boxShadow: '0 8px 30px rgba(4,32,20,0.25)',
            }}
          />
        </Box>
      </Box>
      <NotificationModal dark={dark} notification={notification} onClose={closeNotification} />

      <Container
        fluid
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >

        <Group justify="space-between" align="flex-start" mb={14}>
          <Box>
            <Title order={1} style={{ color: '#ffffff', fontSize: 22, fontWeight: 700 }}>
              Pencairan
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 }}>
              Ajukan pencairan penghasilan Anda
            </Text>
          </Box>
        </Group>

        <Box style={{ marginTop: 8 }}>
          <BalanceCard
            dark={dark}
            loading={loading}
            availableBalance={availableBalance}
            maxAvailableForWithdrawal={maxAvailableForWithdrawal}
            minimumBalanceRemaining={constants.MINIMUM_BALANCE_REMAINING}
            onWithdraw={() => setInlineOpen((v) => !v)}
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
                marginTop: 16,
              }}
            >
              <Text style={{ color: '#f97316', fontSize: 14 }}>
                {availableBalance < constants.MINIMUM_BALANCE_REMAINING
                  ? `Saldo Anda (Rp ${availableBalance.toLocaleString('id-ID')}) belum mencapai minimum saldo tersisa (Rp ${constants.MINIMUM_BALANCE_REMAINING.toLocaleString('id-ID')}).`
                  : `Saldo yang bisa ditarik (Rp ${maxAvailableForWithdrawal.toLocaleString('id-ID')}) belum memenuhi minimum pencairan (Rp ${constants.MINIMUM_WITHDRAWAL.toLocaleString('id-ID')}).`}
              </Text>
            </Alert>
          )}

          <Box style={{ display: 'flex', gap: isMobile ? 16 : 32, marginTop: isMobile ? 12 : 28, flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start' }}>
            {isMobile ? (
              <>
                <Box style={{ width: '100%', marginTop: 0 }}>
                  {inlineOpen && (
                    <WithdrawalFormPanel
                      dark={dark}
                      onClose={() => setInlineOpen(false)}
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
                  )}
                </Box>
              {/* //mobile */}
                <Box style={{ width: '100%', marginTop: 12 }}>
                  <Title order={2} mb={20} style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 20, fontWeight: 700 }}>
                    Riwayat Pencairan
                  </Title>
                  <WithdrawalHistory dark={dark} loading={loading} withdrawalHistory={withdrawalHistory} />
                </Box>
              </>
            ) : (
              <>
              {/* //web */}
                <Box style={{ flex: 1 }}>
                  <Box style={{ width: '100%', marginTop: isMobile ? 12 : 0 }}>
                    <Title order={2} mb={20} style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 20, fontWeight: 700 }}>
                      Riwayat Pencairan
                    </Title>
                    <WithdrawalHistory dark={dark} loading={loading} withdrawalHistory={withdrawalHistory} />
                  </Box>
                </Box>

                <Box style={{ width: isMobile ? '100%' : 360, maxWidth: isMobile ? '100%' : 360, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <WithdrawalBarChart
                    data={withdrawalHistory.map((w) => ({
                      date: w.requestedAt ?? w.approvedAt ?? w.completedAt ?? (w as any).createdAt ?? '',
                      amount: w.amount,
                    }))}
                    dark={dark}
                    width={360}
                    height={260}
                  />

                  {inlineOpen && (
                    <WithdrawalFormPanel
                      dark={dark}
                      onClose={() => setInlineOpen(false)}
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
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Container>

    </Box>
  )

  return <DashboardLayout>{content}</DashboardLayout>
}

export default WithdrawalPage
