import React from 'react'
import { Box, Text, Group, ThemeIcon, Skeleton, Button } from '@mantine/core'
import { IconWallet, IconEye, IconEyeOff, IconArrowDown } from '@tabler/icons-react'
import { useMediaQuery } from '@mantine/hooks'

interface BalanceCardProps {
  dark: boolean
  loading: boolean
  availableBalance: number
  maxAvailableForWithdrawal: number
  minimumBalanceRemaining: number
  onWithdraw?: () => void
  walletSvgUrl?: string 
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  dark,
  loading,
  availableBalance,
  maxAvailableForWithdrawal,
  minimumBalanceRemaining,
  onWithdraw,
  walletSvgUrl = '/src/assets/wallet.svga',
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [hidden, setHidden] = React.useState(false)

  const skeletonBg = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'

  if (loading) {
    return (
      <Box style={{ position: 'relative', marginBottom: 24 }}>
          <Box
            style={{
              background: isMobile
                ? 'linear-gradient(180deg, #0ea55f 0%, #10b981 60%)'
                : `url(${walletSvgUrl}) no-repeat center / contain, linear-gradient(135deg, #10b981 0%, #059669 40%, #047857 100%)`,
              borderRadius: isMobile ? 20 : 28,
              padding: isMobile ? 18 : 24,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isMobile ? '0 12px 30px rgba(2,6,23,0.14)' : '0 14px 32px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
              minHeight: isMobile ? 170 : 160,
              display: 'flex',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isMobile ? 'rgba(2,6,23,0.06)' : 'rgba(16, 185, 129, 0.75)',
              borderRadius: isMobile ? 16 : 28,
              zIndex: 1,
            }}
          />

          <Box style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', zIndex: 2, flexDirection: 'row', gap: isMobile ? 12 : 0 }}>
            <Box style={{ flex: 1, paddingLeft: 12, paddingTop: 0, textAlign: 'left' as const }}>
              <Group align={isMobile ? 'center' : 'center'} gap={10} style={{ marginBottom: isMobile ? 10 : 8, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <ThemeIcon size={26} radius="sm" style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: '#fff' }}>
                  <IconWallet size={16} />
                </ThemeIcon>
                <Text style={{ color: 'rgba(255, 255, 255, 0.98)', fontSize: isMobile ? 13 : 12, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  SALDO BISA DICAIRKAN
                </Text>
              </Group>

              <Skeleton
                height={isMobile ? 46 : 56}
                width={isMobile ? 240 : 360}
                radius="sm"
                style={{
                  backgroundColor: skeletonBg,
                  borderRadius: 12,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              />

              <Box style={{ borderTop: '3px dashed rgba(255,255,255,0.15)', width: isMobile ? '60%' : '45%', marginTop: 12, marginBottom: 12, marginLeft: 0 }} />

              <Group gap={18} style={{ marginTop: isMobile ? 8 : 8, justifyContent: isMobile ? 'center' : 'flex-start', alignItems: 'center' }}>
                <Box>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? 11 : 12 }}>Total Saldo</Text>
                  <Skeleton height={14} width={120} radius="sm" style={{ backgroundColor: skeletonBg, borderRadius: 8 }} />
                </Box>
                <Box>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? 11 : 12 }}>Min. Dompet</Text>
                  <Text style={{ color: '#fef3c7', fontWeight: 700, fontSize: isMobile ? 12 : 13 }}>Rp {minimumBalanceRemaining.toLocaleString('id-ID')}</Text>
                </Box>
              </Group>
            </Box>

          {isMobile ? (
            <Box style={{ width: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginLeft: 12 }}>
              <Box style={{ textAlign: 'center' }}>
                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 800 }}>Tarik Tunai</Text>
                <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 11, marginTop: 4 }}>Ajukan Pencairan</Text>
              </Box>

              <Button
                onClick={() => onWithdraw && onWithdraw()}
                radius="xl"
                size="sm"
                style={{
                  width: 56,
                  height: 56,
                  minHeight: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  color: '#047857',
                  border: 'none',
                  padding: 0,
                  boxShadow: '0 12px 30px rgba(2,6,23,0.12)',
                  fontWeight: 900,
                }}
              >
                <IconArrowDown size={20} />
              </Button>

              <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 6, fontWeight: 800 }}>Tarik</Text>
            </Box>
          ) : (

              <Box style={{ width: 240, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                <Box style={{ textAlign: 'right', marginRight: 12 }}>
                    <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 800 }}>Tarik Tunai</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 12, marginTop: 4 }}>Ajukan Pencairan</Text>
                  </Box>

                  <Button
                    onClick={() => onWithdraw && onWithdraw()}
                    radius="xl"
                    size="lg"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      color: '#fff',
                      border: '2px solid rgba(255,255,255,0.14)',
                      padding: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      fontWeight: 900,
                    }}
                  >
                    <IconArrowDown size={20} />
                  </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box style={{ position: 'relative', marginBottom: 24 }}>
      <Box
        style={{
          background: isMobile
            ? 'linear-gradient(180deg, #0ea55f 0%, #10b981 60%)'
            : `url(${walletSvgUrl}) no-repeat center / contain, linear-gradient(135deg, #10b981 0%, #059669 40%, #047857 100%)`,
          borderRadius: isMobile ? 20 : 28,
          padding: isMobile ? 18 : 24,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isMobile ? '0 12px 30px rgba(2,6,23,0.14)' : '0 14px 32px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          minHeight: isMobile ? 170 : 160,
          display: 'flex',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        {/* Overlay untuk memastikan text tetap terbaca */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isMobile ? 'rgba(2,6,23,0.06)' : 'rgba(16, 185, 129, 0.75)',
            borderRadius: isMobile ? 16 : 28,
            zIndex: 1,
          }}
        />
      
        {/* left notch (hidden on mobile) */}
        <Box style={{ display: isMobile ? 'none' : 'block', position: 'absolute', left: -18, width: 36, height: 72, background: 'transparent', borderRadius: '0 36px 36px 0', top: '50%', transform: 'translateY(-50%)', boxShadow: `inset 12px 0 0 rgba(255,255,255,0.02)`, zIndex: 3 }} />
        {/* right notch (hidden on mobile) */}
        <Box style={{ display: isMobile ? 'none' : 'block', position: 'absolute', right: -18, width: 36, height: 72, background: 'transparent', borderRadius: '36px 0 0 36px', top: '50%', transform: 'translateY(-50%)', boxShadow: `inset -12px 0 0 rgba(255,255,255,0.02)`, zIndex: 3 }} />

        <Box style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', zIndex: 2, flexDirection: 'row', gap: isMobile ? 12 : 0 }}>
          <Box style={{ flex: 1, paddingLeft: isMobile ? 8 : 12, paddingTop: isMobile ? 4 : 0, textAlign: 'left' as const }}>
            <Group align="center" gap={10} style={{ marginBottom: isMobile ? 10 : 8, justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.98)', fontSize: isMobile ? 13 : 12, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', lineHeight: 1 }}>
                SALDO ANDA
              </Text>
              <Box
                style={{ cursor: 'pointer', marginLeft: 8, display: 'flex', alignItems: 'center', height: isMobile ? 18 : 20 }}
                onClick={() => setHidden(h => !h)}
                aria-label={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
              >
                {hidden ? (
                  <IconEyeOff size={18} stroke={1.5} color="rgba(255,255,255,0.95)" />
                ) : (
                  <IconEye size={18} stroke={1.5} color="rgba(255,255,255,0.95)" />
                )}
              </Box>
            </Group>

            <Text style={{ color: '#ffffff', fontSize: isMobile ? 32 : 36, fontWeight: 800, marginBottom: isMobile ? 8 : 12, lineHeight: 1 }}>
              {hidden ? 'Rp •••••' : `Rp ${maxAvailableForWithdrawal.toLocaleString('id-ID')}`}
            </Text>

            <Box style={{ borderTop: '3px dashed rgba(255,255,255,0.15)', width: isMobile ? '65%' : '45%', marginTop: 8, marginBottom: 10, marginLeft: isMobile ? 16 : 0 }} />

            <Group gap={18} style={{ marginTop: isMobile ? 2 : 8, justifyContent: 'flex-start', alignItems: 'center' }}>
              <Box>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? 11 : 12 }}>Total Saldo</Text>
                <Text style={{ color: '#ffffff', fontWeight: 700, fontSize: isMobile ? 13 : 13 }}>{hidden ? 'Rp •••••' : `Rp ${availableBalance.toLocaleString('id-ID')}`}</Text>
              </Box>
              <Box>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? 11 : 12 }}>Min. Dompet</Text>
                <Text style={{ color: '#fef3c7', fontWeight: 700, fontSize: isMobile ? 12 : 13 }}>Rp {minimumBalanceRemaining.toLocaleString('id-ID')}</Text>
              </Box>
            </Group>
          </Box>

          {isMobile ? (
            <Box style={{ width: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginLeft: 12, marginTop:50 }}>
              <Box style={{ textAlign: 'center' }}>
                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 800 }}>Tarik Tunai</Text>
              </Box>

              <Button
                onClick={() => onWithdraw && onWithdraw()}
                radius="xl"
                size="sm"
                style={{
                  width: 56,
                  height: 56,
                  minHeight: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  color: '#047857',
                  border: 'none',
                  padding: 0,
                  boxShadow: '0 12px 30px rgba(2,6,23,0.12)',
                  fontWeight: 900,
                }}
              >
                <IconArrowDown size={20} />
              </Button>

              </Box>
          ) : (
            <Box style={{ width: 240, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
              <Box style={{ textAlign: 'right', marginRight: 12, marginTop: 8 }}>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 800 }}>Tarik Tunai</Text>
                <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 12, marginTop: 4 }}>Ajukan Pencairan</Text>
              </Box>

              <Button
                onClick={() => onWithdraw && onWithdraw()}
                radius="xl"
                size="lg"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.14)',
                  padding: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  fontWeight: 900,
                }}
              >
                <IconArrowDown size={20} />
              </Button>
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  )
}