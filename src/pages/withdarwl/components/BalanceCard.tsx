import React from 'react'
import { Box, Text, Group, ThemeIcon, Loader } from '@mantine/core'
import { IconWallet } from '@tabler/icons-react'
import { useMediaQuery } from '@mantine/hooks'

interface BalanceCardProps {
  dark: boolean
  loading: boolean
  availableBalance: number
  maxAvailableForWithdrawal: number
  minimumBalanceRemaining: number
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  dark,
  loading,
  availableBalance,
  maxAvailableForWithdrawal,
  minimumBalanceRemaining,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: dark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: isMobile ? 16 : 24,
          padding: isMobile ? 24 : 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? 200 : 240,
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Loader size={48} color="#10b981" />
        <Text style={{ color: dark ? '#a1a1a1' : '#64748b', fontSize: 14 }}>
          Memuat data dompet...
        </Text>
      </Box>
    )
  }

  return (
    <Box style={{ position: 'relative', marginBottom: 24 }}>
      <Box
        style={{
          position: 'absolute',
          bottom: -12,
          left: 12,
          right: 0,
          height: isMobile ? 180 : 220,
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: isMobile ? 16 : 24,
          zIndex: 0,
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: -6,
          left: 6,
          right: 0,
          height: isMobile ? 185 : 225,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: isMobile ? 16 : 24,
          zIndex: 1,
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
        }}
      />
      <Box
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 40%, #047857 100%)',
          border: 'none',
          borderRadius: isMobile ? 16 : 24,
          padding: isMobile ? 24 : 40,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 48px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          minHeight: isMobile ? 200 : 240,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: isMobile ? -100 : -80,
            right: isMobile ? -100 : -80,
            width: isMobile ? 200 : 320,
            height: isMobile ? 200 : 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none',
            filter: 'blur(1px)',
          }}
        />
        <Box style={{ position: 'absolute', top: isMobile ? 15 : 30, right: isMobile ? 20 : 40, fontSize: isMobile ? 40 : 56, opacity: 0.4, pointerEvents: 'none' }}>
          💰
        </Box>
        <Box style={{ position: 'absolute', top: isMobile ? 18 : 32, right: isMobile ? 95 : 130, fontSize: isMobile ? 24 : 32, opacity: 0.35, pointerEvents: 'none' }}>
          ✨
        </Box>
        <Box style={{ position: 'absolute', bottom: isMobile ? 15 : 25, left: isMobile ? 15 : 30, fontSize: isMobile ? 36 : 56, opacity: 0.25, pointerEvents: 'none' }}>
          💵
        </Box>

        <Group justify="space-between" align="flex-start" style={{ position: 'relative', zIndex: 1 }}>
          <Box style={{ flex: 1 }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: isMobile ? 11 : 13, marginBottom: isMobile ? 16 : 24, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Saldo Bisa Dicairkan
            </Text>
            <Text style={{ color: '#ffffff', fontSize: isMobile ? 28 : 42, fontWeight: 800, marginBottom: isMobile ? 16 : 24, textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)', letterSpacing: -0.5 }}>
              Rp {maxAvailableForWithdrawal.toLocaleString('id-ID')}
            </Text>
            <Group grow={isMobile} gap={isMobile ? 16 : 40} style={{ marginTop: isMobile ? 8 : 16 }}>
              <Box>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: isMobile ? 10 : 12, marginBottom: 4 }}>
                  Total Saldo
                </Text>
                <Text style={{ color: '#ffffff', fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>
                  Rp {availableBalance.toLocaleString('id-ID')}
                </Text>
              </Box>
              <Box>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: isMobile ? 10 : 12, marginBottom: 4 }}>
                  Min. Dompet
                </Text>
                <Text style={{ color: '#fef3c7', fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>
                  Rp {minimumBalanceRemaining.toLocaleString('id-ID')}
                </Text>
              </Box>
            </Group>
          </Box>

          {!isMobile && (
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
              <ThemeIcon
                size={64}
                radius="50%"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <IconWallet size={32} stroke={1.5} />
              </ThemeIcon>
            </Box>
          )}
        </Group>
      </Box>
    </Box>
  )
}
