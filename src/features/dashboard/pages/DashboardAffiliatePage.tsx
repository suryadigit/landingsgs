import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Group,
  Text,
  Title,
  CopyButton,
  Button,
  Stack,
  ThemeIcon,
  Modal,
  Anchor,
  useMantineColorScheme,
  Alert,
} from '@mantine/core';
import {
  IconCopy,
  IconShare2,
  IconAlertTriangle,
} from '@tabler/icons-react';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { useMediaQuery } from '@mantine/hooks';
import { DashboardLayout } from '../../../components/dashboardlayout/dashboard.layout';
import { COLORS } from '../../../shared/types';
import { useAuth } from '../../auth';
import { useDashboardAffiliate, getResponsiveFontSize } from '../hooks/useDashboardAffiliate';
import XenditInvoiceModal from '../../../components/common/XenditInvoiceModal';

const DashboardAffiliatePage: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const {
    animatingButton,
    localError,
    pendingInvoice,
    countdown,
    isPaymentProcessing,
    isLoading,
    isDataLoaded,
    queryError,
    affiliate,
    referralsData,
    affiliateCode,
    wpReferralLink,
    wpDisplayLink,
    wpCustomDisplayCode,
    wpAffiliateId,
    stats,
    commissionBreakdown,
    commissionBreakdownData,
    membersPerLevel,
    handlePaymentClick,
    handleCopyWithAnimation,
    navigateToInvoice,
    refetch,
  } = useDashboardAffiliate();

  const displayCode = wpCustomDisplayCode || (wpAffiliateId != null ? String(wpAffiliateId) : affiliateCode) || '';

  const [showXenditModal, setShowXenditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const bgColor = dark ? '#0b0b0b' : '#ffffffff';

  const content = (
    <Box style={{ backgroundColor: bgColor, minHeight: '100vh', paddingInlineStart: "10px"  }}>
      {isLoading && <DashboardSkeleton />}

      {queryError && (
        <Container size="xl">
          <Box
            mb={24}
            style={{
              display: 'flex',
              gap: 20,
              alignItems: 'flex-start',
              padding: '18px',
              borderRadius: 12,
              backgroundColor: dark ? 'rgba(55,55,60,0.6)' : 'rgba(250,244,242,0.95)',
              border: dark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(200, 30, 30, 0.08)',
              boxShadow: '0 6px 18px rgba(0,0,0,0.04)'
            }}
          >
            <Box style={{ flexShrink: 0 }}>
              <Box style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: dark ? 'linear-gradient(180deg, rgba(200,30,30,0.08), rgba(200,30,30,0.02))' : 'linear-gradient(180deg, rgba(200,30,30,0.06), rgba(200,30,30,0.03))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IconAlertTriangle size={28} style={{ color: '#b91c1c' }} />
              </Box>
            </Box>

            <Box style={{ flex: 1, minWidth: 0 }}>
              {(() => {
                const err: any = queryError as any;
                const kind = err?.kind || 'unknown';
                const title = err?.title || (kind === 'auth' ? 'Unauthorized' : 'Service Error');
                const message = err?.message || localError || 'Terjadi kesalahan saat memuat data dashboard.';
                const code = err?.code || err?.status || 'N/A';
                const errorId = `ERR-${new Date().toISOString()}`;

                return (
                  <>
                    <Group align="flex-start">
                      <Box>
                        <Title order={3} style={{ margin: 0, color: '#7f1d1d' }}>{title}</Title>
                        <Text size="sm" style={{ color: '#5b2121', marginTop: 6 }}>
                          {message}
                        </Text>
                        <Text size="xs" style={{ color: '#6b6b6b', marginTop: 8 }}>
                          Error Code: <strong>{code}</strong> — Reference: <strong>{errorId}</strong>
                        </Text>
                      </Box>

                      <Group>
                        <Button
                          onClick={() => refetch()}
                          variant="filled"
                          style={{ backgroundColor: '#8b1a1a', color: '#fff', fontWeight: 700 }}
                        >
                          Retry
                        </Button>
                        {err?.requireLogin ? (
                          <Button
                            onClick={() => window.location.assign(err?.redirectTo || '/signin')}
                            variant="outline"
                            style={{ borderColor: 'rgba(139,26,26,0.9)', color: '#8b1a1a', fontWeight: 600 }}
                          >
                            Sign In
                          </Button>
                        ) : (
                          <Button
                            onClick={() => window.open(`https://wa.me/6285183292385?text=${encodeURIComponent(`Halo, kami mengalami error ${code} (Ref: ${errorId}). Mohon bantuannya.`)}`)}
                            variant="outline"
                            style={{ borderColor: 'rgba(139,26,26,0.9)', color: '#8b1a1a', fontWeight: 600 }}
                          >
                            Contact Support
                          </Button>
                        )}
                      </Group>
                    </Group>

                    <Box style={{ marginTop: 12 }}>
                      <Text size="xs" color="dimmed">Jika masalah berlanjut, coba muat ulang, periksa koneksi, atau hubungi support.</Text>
                    </Box>
                  </>
                );
              })()}
            </Box>
          </Box>
        </Container>
      )}

      <XenditInvoiceModal
        opened={showXenditModal}
        onClose={() => setShowXenditModal(false)}
        invoiceUrl={pendingInvoice?.invoiceUrl}
        amount={pendingInvoice?.amount}
      />

      {!isLoading && !queryError && (
        <Container size="xl">
          {localError && (
            <Box
              mb={24}
              style={{
                padding: '12px',
                borderRadius: 10,
                backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,249,249,0.9)',
                border: dark ? '1px solid rgba(255,255,255,0.02)' : '1px solid rgba(224, 36, 36, 0.08)'
              }}
            >
              <Group align="center" gap="sm">
                <ThemeIcon radius="md" size="lg" style={{ backgroundColor: '#fff5f5', color: '#b91c1c' }}>
                  <IconAlertTriangle size={18} />
                </ThemeIcon>
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" style={{ color: '#6b1a1a', fontWeight: 700 }}>Error</Text>
                  <Text size="xs" style={{ color: '#6b6b6b' }}>{localError}</Text>
                </Box>
              </Group>
            </Box>
          )}

          {pendingInvoice && (
            <Alert
              icon={<IconAlertTriangle size={20} />}
              color="yellow"
              title="Pembayaran Tertunda"
              mb={24}
              style={{
                  backgroundColor: dark ? 'rgba(34,34,12,0.25)' : 'rgba(255,249,230,0.6)',
                  border: dark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(234, 179, 8, 0.18)',
                  borderRadius: 12,
                }}
            >
              <Group justify="space-between" align="center">
                <Box>
                  <Text style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 14 }}>
                    Selesaikan pembayaran Anda dalam{' '}
                    <strong>
                      {countdown.minutes}:{countdown.seconds.toString().padStart(2, '0')}
                    </strong>
                  </Text>
                  {pendingInvoice.amount && (
                    <Text style={{ color: COLORS.text.tertiary, fontSize: 12, marginTop: 4 }}>
                      Amount: Rp {pendingInvoice.amount.toLocaleString('id-ID')}
                    </Text>
                  )}
                </Box>
                <Group gap={12}>
                    <Button
                    onClick={async () => {
                      try {
                        const invoiceUrl = await handlePaymentClick();
                        if (invoiceUrl) setShowXenditModal(true);
                      } catch (err) {
                      }
                    }}
                    loading={isPaymentProcessing}
                    style={{
                      backgroundColor: '#b8860b',
                      color: '#000000',
                      fontWeight: 700,
                      fontSize: 14,
                      height: 40,
                      borderRadius: 8,
                      border: 'none',
                    }}
                  >
                    Bayar Sekarang
                  </Button>
                  <Button
                    onClick={navigateToInvoice}
                    variant="outline"
                    style={{
                      borderColor: 'rgba(212,175,55,0.22)',
                      color: '#8b6b10',
                      fontWeight: 600,
                      fontSize: 14,
                      height: 40,
                      borderRadius: 8,
                    }}
                  >
                    Detail Invoice
                  </Button>
                </Group>
              </Group>
            </Alert>
          )}

          <Group justify="space-between" align="center" mb={12}>
            <Box>
              <Group gap={12} align="center" >
                <Title order={1} style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 22, fontWeight: 700}}>
                  Affiliate Dashboard
                </Title>
                
              </Group>
              <Text style={{ color: COLORS.text.tertiary, fontSize: 16, marginTop: 6 }}>
                Monitor kinerja afiliasi dan pendapatan Anda
              </Text>
            </Box>
            {!isMobile && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulse-glow 2s infinite',
                  }}
                />
                <Text style={{ color: '#10b981', fontWeight: 600, fontSize: 14 }}>ACTIVE</Text>
              </Box>
            )}
          </Group>

          <Grid gutter="lg" mb={40}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const cardStyles: Record<string, { from: string; to: string; shadow: string; emoji1: string; emoji2: string }> = {
                '#3b82f6': { from: '#3b82f6', to: '#1d4ed8', shadow: 'rgba(59, 130, 246, 0.35)', emoji1: '💰', emoji2: '✨' },
                '#10b981': { from: '#10b981', to: '#059669', shadow: 'rgba(16, 185, 129, 0.35)', emoji1: '💵', emoji2: '✨' },
                '#e4f755ff': { from: '#eab308', to: '#ca8a04', shadow: 'rgba(234, 179, 8, 0.35)', emoji1: '⏳', emoji2: '💫' },
                '#a855f7': { from: '#a855f7', to: '#7c3aed', shadow: 'rgba(168, 85, 247, 0.35)', emoji1: '👥', emoji2: '⭐' },
              };
              const style = cardStyles[stat.color] || { from: stat.color, to: stat.color, shadow: 'rgba(0,0,0,0.2)', emoji1: '💎', emoji2: '✨' };

              return (
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={index}>
                  <Box
                    style={{
                      background: `linear-gradient(135deg, ${style.from} 0%, ${style.to} 100%)`,
                      borderRadius: 16,
                      padding: 20,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `0 8px 24px ${style.shadow}`,
                      minHeight: 120,
                    }}
                  >
                    <Box style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, left: -20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: 8, left: 12, fontSize: 24, opacity: 0.3, pointerEvents: 'none' }}>{style.emoji1}</Box>
                    <Box style={{ position: 'absolute', bottom: 28, left: 8, fontSize: 14, opacity: 0.25, pointerEvents: 'none' }}>{style.emoji2}</Box>

                    <Group justify="space-between" align="flex-start" gap={8} style={{ position: 'relative', zIndex: 1 }}>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                          {stat.label}
                        </Text>
                        <Text style={{ color: '#ffffff', fontSize: getResponsiveFontSize(stat.value), fontWeight: 700, lineHeight: 1.1, wordBreak: 'break-word', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                          {stat.value}
                        </Text>
                      </Box>
                      <ThemeIcon size={48} radius={12} style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', color: 'white', flexShrink: 0, border: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        <Icon size={24} />
                      </ThemeIcon>
                    </Group>
                  </Box>
                </Grid.Col>
              );
            })}
          </Grid>

          <Box
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: 12,
              marginBottom: 40,
              overflow: 'hidden',
            }}
          >
            <Stack gap={12} style={{ overflow: 'hidden' }}>
              <Box>
                <Text style={{ color: COLORS.text.tertiary, fontSize: 14, marginBottom: 8 }}>Kode Afiliasi Anda</Text>
                <Group
                  style={{
                    backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(245,247,249,0.9)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    border: `1px solid ${COLORS.border}`,
                    minHeight: 44,
                  }}
                  align="center"
                  wrap="nowrap"
                >
                  <Box style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Text
                      style={{
                        color: dark ? COLORS.text.light : COLORS.text.dark,
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {wpCustomDisplayCode || wpAffiliateId || affiliateCode}
                    </Text>
                  </Box>

                  <Group gap={8} style={{ flexShrink: 0 }}>
                    <CopyButton value={displayCode} timeout={2000}>
                      {({ copy }) => (
                        <Button
                          data-button-id="copy-code"
                          onClick={() => handleCopyWithAnimation('copy-code', copy, displayCode)}
                          variant="subtle"
                          style={{ color: COLORS.text.secondary, padding: 6, minHeight: 32, height: 32, borderRadius: 8 }}
                        >
                          <IconCopy size={14} />
                        </Button>
                      )}
                    </CopyButton>

                    <Button
                      variant="outline"
                      onClick={() => setShowShareModal(true)}
                      style={{ height: 32, padding: '6px 10px', borderRadius: 8, borderColor: 'rgba(59,130,246,0.12)' }}
                    >
                      <Group gap={6}>
                        <IconShare2 size={14} />
                        <Text style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Share</Text>
                      </Group>
                    </Button>
                  </Group>
                </Group>
              </Box>

              {wpReferralLink && (
                <Box>
                  <Text style={{ color: COLORS.text.tertiary, fontSize: 12, marginBottom: 8 }}>Link Referral</Text>
                  <Box
                    style={{
                      backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(247,248,249,0.9)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      border: `1px solid ${COLORS.border}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'nowrap',
                    }}
                  >
                    <Text
                      style={{
                          color: dark ? COLORS.text.light : COLORS.text.dark,
                        fontSize: 13,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={wpDisplayLink || wpReferralLink}
                    >
                      {wpDisplayLink || wpReferralLink}
                    </Text>
                    <CopyButton value={wpReferralLink} timeout={2000}>
                      {({ copied, copy }) => (
                        <Button
                          data-button-id="copy-wp-link"
                          onClick={() => handleCopyWithAnimation('copy-wp-link', copy, wpReferralLink)}
                          variant="subtle"
                          style={{ color: COLORS.text.secondary, padding: 0, minHeight: 'auto', flexShrink: 0 }}
                        >
                          {copied ? '✓' : <IconCopy size={16} />}
                        </Button>
                      )}
                    </CopyButton>
                  </Box>
                  <Text style={{ color: COLORS.text.tertiary, fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>
                    Share link ini untuk dapat komisi dari pembelian kelas (Lv1: Rp75k, Lv2-3: Rp12.5k)
                  </Text>
                </Box>
              )}

                <Group gap="lg" justify="flex-end" wrap="wrap">
                {wpReferralLink && (
                  <CopyButton value={wpReferralLink} timeout={2000}>
                    {({ copied, copy }) => (
                      <Button
                        data-button-id="copy-wp-main"
                        onClick={() => handleCopyWithAnimation('copy-wp-main', copy, wpReferralLink)}
                        className={animatingButton === 'copy-wp-main' ? 'animate__animated animate__tada' : ''}
                        style={{
                          backgroundColor: COLORS.accent.primary,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 14,
                          height: 40,
                          borderRadius: 8,
                          border: 'none',
                        }}
                      >
                        <Group gap={8}>
                          <IconCopy size={16} />
                          {copied ? 'Copied!' : 'Copy Link'}
                        </Group>
                      </Button>
                    )}
                  </CopyButton>
                )}
                
              </Group>
            </Stack>
          </Box>

          <Modal opened={showShareModal} onClose={() => setShowShareModal(false)} title="Share Referral Links" centered size="lg">
            <Stack gap="sm">
              {(() => {
                const rawShopBase = (import.meta as any).env?.VITE_SHOP_URL || 'https://jagobikinaplikasi.com/woo/shop';
                const shopBase = String(rawShopBase).replace(/\/+$/, '');

                const displayCodeSafe = displayCode || '';

                const numericRefCandidate = wpAffiliateId != null ? wpAffiliateId : (affiliate && (affiliate as any).id != null ? (affiliate as any).id : null);
                let numericRef: string | null = null;
                if (numericRefCandidate != null) numericRef = String(numericRefCandidate);
                else {
                  const digitsMatch = String(displayCodeSafe || '').match(/(\d+)/);
                  if (digitsMatch && digitsMatch[1]) {
                    const parsed = String(parseInt(digitsMatch[1], 10));
                    if (!Number.isNaN(Number(parsed))) numericRef = parsed;
                  }
                }

                const shopLinkDisplay = `${shopBase}?ref=${encodeURIComponent(displayCodeSafe)}`;
                const shopLinkForCopy = numericRef ? `${shopBase}?ref=${encodeURIComponent(numericRef)}` : shopLinkDisplay;

                return (
                  <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Anchor href={shopLinkForCopy} target="_blank" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {shopLinkDisplay}
                    </Anchor>
                    <Button onClick={() => handleCopyWithAnimation('copy-shop-link', () => {}, shopLinkForCopy)} variant="subtle">
                      Copy
                    </Button>
                  </Group>
                );
              })()}

              {wpReferralLink && (
                <>
                  <Text style={{ color: COLORS.text.secondary }}>Referral link</Text>
                  <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Anchor href={wpReferralLink} target="_blank" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {wpReferralLink}
                    </Anchor>
                    <Button onClick={() => handleCopyWithAnimation('copy-wp-link-modal', () => {}, wpReferralLink)} variant="subtle">
                      Copy
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          </Modal>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box
                style={{
                  backgroundColor: dark ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <Title order={3} mb={24} style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 18, fontWeight: 700 }}>
                  Status Komisi
                </Title>
                <Stack gap={12}>
                  {Array.isArray(commissionBreakdown) && commissionBreakdown.map((item, index) => (
                    <Box
                      key={index}
                      style={{
                        backgroundColor: dark ? '#0f1720' : '#ffffff',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <Box>
                          <Text style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                            {item?.level}
                          </Text>
                          <Text style={{ color: COLORS.text.tertiary, fontSize: 12 }}>{item?.description}</Text>
                        </Box>
                        <Text style={{ color: COLORS.accent.primary, fontSize: 16, fontWeight: 700 }}>{item?.amount ?? '-'}</Text>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box
                style={{
                  backgroundColor: dark ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <Title order={3} mb={24} style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 18, fontWeight: 700 }}>
                  Hierarki Member
                </Title>
                <Grid gutter={12}>
                  {[1, 2, 3, 4, 5].map((level) => {
                    let levelCount = 0;
                    if (membersPerLevel && membersPerLevel[level] !== undefined) {
                      levelCount = membersPerLevel[level];
                    } else if (level === 1) {
                      const directReferrals = referralsData?.list;
                      levelCount = Array.isArray(directReferrals) ? directReferrals.length : (referralsData?.totalCount || 0);
                    } else {
                      const levelKey = `level_${level}`;
                      const levelData = isDataLoaded ? commissionBreakdownData?.[levelKey] : null;
                      levelCount = levelData?.count || 0;
                    }

                    // Use a muted / neutral palette for level boxes to reduce colorful appearance
                    const mutedLevel = {
                      color: COLORS.accent.primary,
                      bgColor: dark ? '#0f1720' : '#ffffff',
                      borderColor: COLORS.border,
                    };
                    const colors = mutedLevel;
                    const isDirectReferral = level === 1;

                    return (
                      <Grid.Col key={level} span={{ base: 6, sm: 4, md: 4 }}>
                        <Box
                          style={{
                            backgroundColor: colors.bgColor,
                            border: `1px solid ${colors.borderColor}`,
                            borderRadius: 12,
                            padding: 16,
                            height: '100%',
                          }}
                        >
                          <Text style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                            Level {level}
                          </Text>
                          <Text style={{ color: COLORS.text.tertiary, fontSize: 10, marginBottom: 8 }}>
                            {isDirectReferral ? 'Direct Referrals' : 'Indirect Referrals'}
                          </Text>
                          <Text style={{ color: colors.color, fontSize: 28, fontWeight: 700, textAlign: 'center' }}>
                            {isDataLoaded ? levelCount : '-'}
                          </Text>
                          <Text style={{ color: COLORS.text.tertiary, fontSize: 10, textAlign: 'center' }}>Members</Text>
                        </Box>
                      </Grid.Col>
                    );
                  })}

                  <Grid.Col span={{ base: 6, sm: 4, md: 4 }}>
                    <Box
                      style={{
                        backgroundColor: dark ? '#0f1720' : '#ffffff',
                        border: `1px dashed ${COLORS.border}`,
                        borderRadius: 12,
                        padding: 16,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: COLORS.text.dark, fontSize: 15, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>
                        Level 6-10
                      </Text>
                      <Text style={{ color: COLORS.text.tertiary, fontSize: 11, textAlign: 'center' }}>
                        Tersedia untuk jaringan yang lebih dalam
                      </Text>
                    </Box>
                  </Grid.Col>

                  {isDataLoaded && Object.values(commissionBreakdownData).every((v: any) => v?.count === 0) && (
                    <Grid.Col span={12}>
                      <Box
                        style={{
                          backgroundColor: 'rgba(156, 163, 175, 0.1)',
                          border: '1px dashed #9ca3af',
                          borderRadius: 12,
                          padding: 32,
                          textAlign: 'center',
                        }}
                      >
                        <Text style={{ color: COLORS.text.tertiary, fontSize: 14 }}>
                          Belum ada referral. Bagikan link referral Anda untuk mulai membangun jaringan!
                        </Text>
                      </Box>
                    </Grid.Col>
                  )}
                </Grid>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); opacity: 1; }
            50% { box-shadow: 0 0 8px 4px rgba(16, 185, 129, 0.4); opacity: 0.6; }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); opacity: 1; }
          }
        `}
      </style>
    </Box>
  );

  return (
    <DashboardLayout
      headerProps={{
        userName: user?.fullName || affiliate?.name || 'User',
        userLevel: `${affiliate?.status || 'PENDING'} Affiliate`,
        notificationCount: 0,
      }}
    >
      {content}
    </DashboardLayout>
  );
};

export default DashboardAffiliatePage;
