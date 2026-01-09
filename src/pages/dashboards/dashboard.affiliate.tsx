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
  useMantineColorScheme,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import {
  IconCopy,
  IconShare2,
  IconExternalLink,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { DashboardLayout } from "../../components/dashboardlayout/dashboard.layout";
import { COLORS } from "../../types/colors";
import { useAuth } from "../../store/auth.context";
import { useDashboardAffiliate, getResponsiveFontSize, LEVEL_COLORS } from "./useDashboard.affiliate";

const DashboardAffiliate: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Use custom hook for all business logic
  const {
    animatingButton,
    localError,
    pendingInvoice,
    countdown,
    isPaymentProcessing,
    isLoading,
    isRefetching,
    isDataLoaded,
    queryError,
    affiliate,
    referralsData,
    affiliateCode,
    referralLink,
    stats,
    commissionBreakdown,
    commissionBreakdownData,
    membersPerLevel,
    handlePaymentClick,
    handleCopyWithAnimation,
    navigateToInvoice,
    refetch,
  } = useDashboardAffiliate();

  const bgColor = dark ? "#0d0d0d" : "#ffffff";

  const content = (
    <Box
      style={{
        backgroundColor: bgColor,
        minHeight: "100vh",
        padding: "40px 0"
      }}
    >
      {isLoading && (
        <Center style={{ minHeight: "100vh" }}>
          <Loader />
        </Center>
      )}

      {queryError && (
        <Container size="xl">
          <Alert icon={<IconAlertTriangle />} title="Error" color="red" mb={24}>
            {queryError?.message || localError || "An error occurred while loading dashboard data"}
          </Alert>
        </Container>
      )}

      {!isLoading && !queryError && (
        <Container size="xl">
          {/* Error Banner */}
          {localError && (
            <Alert
              icon={<IconAlertTriangle size={20} />}
              color="red"
              title="Error"
              mb={24}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#ef4444", fontSize: 14 }}>{localError}</Text>
            </Alert>
          )}

          {/* Pending Invoice Banner */}
          {pendingInvoice && (
            <Alert
              icon={<IconAlertTriangle size={20} />}
              color="yellow"
              title="Pembayaran Tertunda"
              mb={24}
              style={{
                backgroundColor: "rgba(234, 179, 8, 0.1)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                borderRadius: 12,
              }}
            >
              <Group justify="space-between" align="center">
                <Box>
                  <Text style={{ color: dark ? "#ffffff" : COLORS.text.dark, fontSize: 14 }}>
                    Selesaikan pembayaran Anda dalam{" "}
                    <strong>
                      {countdown.minutes}:{countdown.seconds.toString().padStart(2, "0")}
                    </strong>
                  </Text>
                  {pendingInvoice.amount && (
                    <Text style={{ color: COLORS.text.tertiary, fontSize: 12, marginTop: 4 }}>
                      Amount: Rp {pendingInvoice.amount.toLocaleString("id-ID")}
                    </Text>
                  )}
                </Box>
                <Group gap={12}>
                  <Button
                    onClick={handlePaymentClick}
                    loading={isPaymentProcessing}
                    style={{
                      backgroundColor: "#d4af37",
                      color: "#000000",
                      fontWeight: 700,
                      fontSize: 14,
                      height: 40,
                      borderRadius: 8,
                      border: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#c9a961";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#d4af37";
                    }}
                  >
                    Bayar Sekarang
                  </Button>
                  <Button
                    onClick={navigateToInvoice}
                    variant="outline"
                    style={{
                      borderColor: "#d4af37",
                      color: "#d4af37",
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

          {/* Header Section */}
          <Group justify="space-between" align="center" mb={40}>
            <Box>
              <Group gap={12} align="center">
                <Title
                  order={1}
                  style={{
                    color: dark ? "#ffffff" : COLORS.text.dark,
                    fontSize: 32,
                    fontWeight: 700
                  }}
                >
                  Affiliate Dashboard
                </Title>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => refetch()}
                  loading={isRefetching}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    backgroundColor: isRefetching 
                      ? 'transparent' 
                      : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }}
                  title="Refresh data"
                >
                  <IconRefresh 
                    size={18} 
                    style={{ 
                      animation: isRefetching ? 'spin 1s linear infinite' : 'none',
                    }} 
                  />
                </Button>
                <style>
                  {`
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}
                </style>
              </Group>
              <Text
                style={{
                  color: COLORS.text.tertiary,
                  fontSize: 16,
                  marginTop: 8
                }}
              >
                Monitor kinerja afiliasi dan pendapatan Anda
              </Text>
            </Box>
            {/* Status Badge - hidden on mobile (shown in navbar instead) */}
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
                {/* Animated pulse circle */}
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulse-glow 2s infinite',
                  }}
                />
                <Text
                  style={{
                    color: '#10b981',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  ACTIVE
                </Text>
                <style>
                  {`
                    @keyframes pulse-glow {
                      0% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                        opacity: 1;
                      }
                      50% {
                        box-shadow: 0 0 8px 4px rgba(16, 185, 129, 0.4);
                        opacity: 0.6;
                      }
                      100% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                        opacity: 1;
                      }
                    }
                  `}
                </style>
              </Box>
            )}
          </Group>

          {/* Stats Cards - Premium Design */}
          <Grid gutter="lg" mb={40}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              // Define gradient colors and emojis based on stat color
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
                    {/* Decorative circle */}
                    <Box
                      style={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        pointerEvents: 'none',
                      }}
                    />
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: -20,
                        left: -20,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        pointerEvents: 'none',
                      }}
                    />
                    
                    {/* Emoji decorations - pojok kiri bawah */}
                    <Box style={{ position: 'absolute', bottom: 8, left: 12, fontSize: 24, opacity: 0.3, pointerEvents: 'none' }}>
                      {style.emoji1}
                    </Box>
                    <Box style={{ position: 'absolute', bottom: 28, left: 8, fontSize: 14, opacity: 0.25, pointerEvents: 'none' }}>
                      {style.emoji2}
                    </Box>
                    
                    <Group justify="space-between" align="flex-start" gap={8} style={{ position: 'relative', zIndex: 1 }}>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={{
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 8,
                          }}
                        >
                          {stat.label}
                        </Text>
                        <Text
                          style={{
                            color: '#ffffff',
                            fontSize: getResponsiveFontSize(stat.value),
                            fontWeight: 700,
                            lineHeight: 1.1,
                            wordBreak: 'break-word',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {stat.value}
                        </Text>
                      </Box>
                      <ThemeIcon
                        size={48}
                        radius={12}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          color: 'white',
                          flexShrink: 0,
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <Icon size={24} />
                      </ThemeIcon>
                    </Group>
                  </Box>
                </Grid.Col>
              );
            })}
          </Grid>

          {/* Referral Code Section */}
          <Box
            style={{
              backgroundColor: `rgba(59, 130, 246, 0.05)`,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: 32,
              marginBottom: 40,
              overflow: "hidden",
            }}
          >
            <Stack gap={12} style={{ overflow: "hidden" }}>
              {/* Affiliate Code Box */}
              <Box>
                <Text
                  style={{
                    color: COLORS.text.tertiary,
                    fontSize: 12,
                    marginBottom: 8
                  }}
                >
                  Kode Afiliasi Anda
                </Text>
                <Group
                  style={{
                    backgroundColor: "rgba(212, 175, 55, 0.08)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    border: `1px solid rgba(212, 175, 55, 0.3)`,
                  }}
                  justify="space-between"
                  align="center"
                  wrap="nowrap"
                >
                  <Text
                    style={{
                      color: "#d4af37",
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: 1,
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {affiliateCode}
                  </Text>
                  <CopyButton value={affiliateCode} timeout={2000}>
                    {({ copy }) => (
                      <Button
                        data-button-id="copy-code"
                        onClick={() => handleCopyWithAnimation("copy-code", copy)}
                        variant="subtle"
                        style={{
                          color: "#d4af37",
                          padding: 0,
                          minHeight: "auto",
                          flexShrink: 0,
                        }}
                      >
                        <IconCopy size={16} />
                      </Button>
                    )}
                  </CopyButton>
                </Group>
              </Box>

              <Box>
                <Text
                  style={{
                    color: COLORS.text.tertiary,
                    fontSize: 12,
                    marginBottom: 8
                  }}
                >
                  Link Referral
                </Text>
                <Group
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.08)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                  justify="space-between"
                  align="center"
                  wrap="nowrap"
                >
                  <Text
                    style={{
                      color: COLORS.text.dark,
                      fontSize: 13,
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={referralLink}
                  >
                    {referralLink}
                  </Text>
                  <Button
                    variant="subtle"
                    style={{
                      color: COLORS.accent.primary,
                      padding: 0,
                      minHeight: "auto",
                      flexShrink: 0,
                    }}
                  >
                    <IconExternalLink size={16} />
                  </Button>
                </Group>
              </Box>

              {/* Action Buttons */}
              <Group gap="lg" justify="flex-end">
                <CopyButton value={referralLink} timeout={2000}>
                  {({ copied, copy }) => (
                    <Button
                      data-button-id="copy-link"
                      onClick={() => handleCopyWithAnimation("copy-link", copy)}
                      className={animatingButton === "copy-link" ? "animate__animated animate__tada" : ""}
                      style={{
                        backgroundColor: "#0665fc",
                        color: "#ffffffff",
                        fontWeight: 700,
                        fontSize: 14,
                        height: 40,
                        borderRadius: 8,
                        border: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#01378dff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#0665fc";
                      }}
                    >
                      <Group gap={8}>
                        <IconCopy size={16} />
                        {copied ? "Copied!" : "Copy Link"}
                      </Group>
                    </Button>
                  )}
                </CopyButton>
                <Button
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    color: COLORS.accent.primary,
                    fontWeight: 700,
                    fontSize: 14,
                    height: 40,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.accent.primary}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                  }}
                >
                  <Group gap={8}>
                    <IconShare2 size={16} />
                    Share
                  </Group>
                </Button>
              </Group>
            </Stack>
          </Box>

          {/* Commission Breakdown & Member Hierarchy */}
          <Grid gutter="lg">
            {/* Commission Breakdown */}
            <Grid.Col span={{ base: 12 }}>
              <Box
                style={{
                  backgroundColor: dark ? "#1a1a1a" : "#ffffff",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <Title
                  order={3}
                  mb={24}
                  style={{
                    color: dark ? "#ffffff" : COLORS.text.dark,
                    fontSize: 18,
                    fontWeight: 700
                  }}
                >
                  Status Komisi
                </Title>

                <Stack gap={12}>
                  {commissionBreakdown.map((item, index) => (
                    <Box
                      key={index}
                      style={{
                        backgroundColor: item.bgColor,
                        border: `1px solid ${item.borderColor}`,
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <Box>
                          <Text
                            style={{
                              color: dark ? "#ffffff" : COLORS.text.dark,
                              fontSize: 14,
                              fontWeight: 600,
                              marginBottom: 4
                            }}
                          >
                            {item.level}
                          </Text>
                          <Text
                            style={{
                              color: COLORS.text.tertiary,
                              fontSize: 12
                            }}
                          >
                            {item.description}
                          </Text>
                        </Box>
                        <Text
                          style={{
                            color: item.color,
                            fontSize: 16,
                            fontWeight: 700
                          }}
                        >
                          {item.amount}
                        </Text>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid.Col>

            {/* Member Hierarchy */}
            <Grid.Col span={{ base: 12 }}>
              <Box
                style={{
                  backgroundColor: dark ? "#1a1a1a" : "#ffffff",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <Title
                  order={3}
                  mb={24}
                  style={{
                    color: dark ? "#ffffff" : COLORS.text.dark,
                    fontSize: 18,
                    fontWeight: 700
                  }}
                >
                  Hierarki Member
                </Title>

                <Grid gutter={12}>
                  {/* Level 1-5 */}
                  {[1, 2, 3, 4, 5].map((level) => {
                    // Priority 1: Use membersPerLevel from referral hierarchy (most accurate)
                    // Priority 2: Use commissionBreakdown data as fallback
                    // Priority 3: For Level 1, use referralsData.list.length
                    let levelCount = 0;
                    
                    if (membersPerLevel && membersPerLevel[level] !== undefined) {
                      // Use accurate count from referral hierarchy traversal
                      levelCount = membersPerLevel[level];
                    } else if (level === 1) {
                      // Fallback for Level 1: use referralsData
                      const directReferrals = referralsData?.list;
                      levelCount = Array.isArray(directReferrals) 
                        ? directReferrals.length 
                        : (referralsData?.totalCount || 0);
                    } else {
                      // Fallback for Level 2+: use commissionBreakdown
                      const levelKey = `level_${level}`;
                      const levelData = isDataLoaded ? commissionBreakdownData?.[levelKey] : null;
                      levelCount = levelData?.count || 0;
                    }

                    const colors = LEVEL_COLORS[level];
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
                          <Text
                            style={{
                              color: dark ? "#ffffff" : COLORS.text.dark,
                              fontSize: 13,
                              fontWeight: 600,
                              marginBottom: 4
                            }}
                          >
                            Level {level}
                          </Text>
                          <Text
                            style={{
                              color: COLORS.text.tertiary,
                              fontSize: 10,
                              marginBottom: 8
                            }}
                          >
                            {isDirectReferral ? 'Direct Referrals' : 'Indirect Referrals'}
                          </Text>
                          <Text
                            style={{
                              color: colors.color,
                              fontSize: 28,
                              fontWeight: 700,
                              textAlign: 'center'
                            }}
                          >
                            {isDataLoaded ? levelCount : "-"}
                          </Text>
                          <Text
                            style={{
                              color: COLORS.text.tertiary,
                              fontSize: 10,
                              textAlign: 'center'
                            }}
                          >
                            Members
                          </Text>
                        </Box>
                      </Grid.Col>
                    );
                  })}

                  {/* Level 6-10 Summary Card */}
                  <Grid.Col span={{ base: 6, sm: 4, md: 4 }}>
                    <Box
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                        border: '1px dashed rgba(139, 92, 246, 0.5)',
                        borderRadius: 12,
                        padding: 16,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: '#a855f7',
                          fontSize: 15,
                          fontWeight: 700,
                          marginBottom: 4,
                          textAlign: 'center'
                        }}
                      >
                        Level 6-10
                      </Text>
                      <Text
                        style={{
                          color: COLORS.text.tertiary,
                          fontSize: 11,
                          textAlign: 'center'
                        }}
                      >
                        Tersedia untuk jaringan yang lebih dalam
                      </Text>
                    </Box>
                  </Grid.Col>

                  {/* Empty State */}
                  {isDataLoaded && Object.values(commissionBreakdownData).every((v: any) => v?.count === 0) && (
                    <Grid.Col span={12}>
                      <Box
                        style={{
                          backgroundColor: "rgba(156, 163, 175, 0.1)",
                          border: `1px dashed #9ca3af`,
                          borderRadius: 12,
                          padding: 32,
                          textAlign: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.text.tertiary,
                            fontSize: 14
                          }}
                        >
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
    </Box>
  );

  return (
    <DashboardLayout
      headerProps={{
        userName: user?.fullName || affiliate?.name || "User",
        userLevel: `${affiliate?.status || 'PENDING'} Affiliate`,
        notificationCount: 0,
      }}
    >
      {content}
    </DashboardLayout>
  );
};

export default DashboardAffiliate;
