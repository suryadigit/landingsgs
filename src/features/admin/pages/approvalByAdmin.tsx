import React, { useState } from "react";
import {
  Box,
  Title,
  Text,
  Badge,
  Button,
  Group,
  TextInput,
  Modal,
  Textarea,
  Alert,
  Loader,
  Card,
  Flex,
  Tooltip,
  Tabs,
  Accordion,
  Stack,
  Paper,
  NumberInput,
  ActionIcon,
} from "@mantine/core";
import {
  IconSearch,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconRefresh,
  IconClock,
  IconCash,
  IconCoins,
  IconCopy,
} from "@tabler/icons-react";
import { DashboardLayout } from "../../../components/dashboardlayout/dashboard.layout";
import { useDarkMode } from "../../../shared/hooks";
import { useApproval } from "./useApproval";
import WithdrawalApprovalTab from "./WithdrawalApprovalTab";
import type { GroupedAffiliate, Commission } from "./useApproval";


interface StatsCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  label: string;
  count: number;
  amount?: string;
  amountColor?: string;
  isDark: boolean;
  COLORS: any;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  iconBgColor,
  label,
  count,
  amount,
  amountColor,
  isDark,
  COLORS,
}) => (
  <Card
    shadow="sm"
    padding="lg"
    radius="md"
    style={{
      flex: "1 1 200px",
      backgroundColor: isDark ? COLORS.bg.secondary : "#fff",
      border: `1px solid ${COLORS.border}`,
    }}
  >
    <Group>
      <Box
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: iconBgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
          {label}
        </Text>
        <Text style={{ color: isDark ? COLORS.text.light : COLORS.text.dark, fontSize: 24, fontWeight: 700 }}>
          {count}
        </Text>
        {amount && (
          <Text style={{ color: amountColor, fontSize: 12, fontWeight: 600 }}>
            {amount}
          </Text>
        )}
      </Box>
    </Group>
  </Card>
);

// ============================================
// Affiliate Accordion Panel Component
// ============================================

interface AffiliateAccordionPanelProps {
  affiliate: GroupedAffiliate;
  approveAmount: number;
  onAmountChange: (amount: number) => void;
  onApprove: () => void;
  isApproving: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  getLevelColor: (level: number) => string;
  isDark: boolean;
  COLORS: any;
}

const AffiliateAccordionPanel: React.FC<AffiliateAccordionPanelProps> = ({
  affiliate,
  approveAmount,
  onAmountChange,
  onApprove,
  isApproving,
  formatCurrency,
  formatDate,
  getLevelColor,
  isDark,
  COLORS,
}) => {
  return (
    <Stack gap={16} p="md">
      {/* Info Total Pending */}
      <Paper
        p="md"
        withBorder
        style={{
          backgroundColor: isDark ? COLORS.bg.secondary : "#f8fafc",
          borderColor: COLORS.border,
        }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Box>
            <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
              Total Pending ({affiliate.totalPending} transaksi)
            </Text>
            <Text style={{ fontWeight: 700, color: "#f97316", fontSize: 20 }}>
              {formatCurrency(affiliate.totalAmount)}
            </Text>
          </Box>
          <Badge color="orange" variant="light" size="lg">
            Menunggu Approval
          </Badge>
        </Flex>
      </Paper>

      {/* Detail Komisi */}
      <Box>
        <Text style={{ color: COLORS.text.secondary, fontSize: 12, marginBottom: 8 }}>
          Detail Komisi:
        </Text>
        <Stack gap={8}>
          {affiliate.commissions.map((commission: Commission) => (
            <Flex 
              key={commission.id} 
              justify="space-between" 
              align="center"
              style={{
                padding: "8px 12px",
                backgroundColor: isDark ? COLORS.bg.primary : "#fff",
                borderRadius: 6,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Group gap={8}>
                <Badge 
                  color={getLevelColor(commission.level)} 
                  variant="light" 
                  size="xs"
                >
                  Lv.{commission.level}
                </Badge>
                <Group gap={4}>
                  <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                    {commission.transactionId || commission.id}
                  </Text>
                  <Tooltip label="Salin ID" withArrow position="top">
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(commission.transactionId || commission.id);
                      }}
                    >
                      <IconCopy size={12} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Text style={{ fontSize: 11, color: COLORS.text.tertiary }}>
                  {formatDate(commission.createdAt)}
                </Text>
              </Group>
              <Text style={{ fontWeight: 600, color: "#10b981", fontSize: 13 }}>
                {formatCurrency(commission.amount)}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Box>

      <Flex gap={12} align="flex-end">
        <NumberInput
          label="Nominal Pencairan"
          placeholder="Masukkan nominal"
          value={approveAmount}
          onChange={(val) => onAmountChange(typeof val === "number" ? val : 0)}
          min={0}
          max={affiliate.totalAmount}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          style={{ flex: 1 }}
          styles={{
            input: {
              backgroundColor: isDark ? COLORS.bg.primary : "#fff",
              color: COLORS.text.primary,
              border: `2px solid #10b981`,
              fontSize: 16,
              fontWeight: 600,
            },
            label: {
              color: COLORS.text.secondary,
              marginBottom: 4,
            },
          }}
        />
        <Tooltip 
          label={approveAmount <= 0 ? "Masukkan nominal terlebih dahulu" : `Approve ${formatCurrency(approveAmount)}`}
        >
          <Button
            color="teal"
            size="md"
            onClick={onApprove}
            loading={isApproving}
            disabled={approveAmount <= 0}
            style={{ 
              minWidth: 120,
              height: 42,
            }}
          >
            approve
          </Button>
        </Tooltip>
      </Flex>

      <Group gap={8}>
        <Text style={{ color: COLORS.text.tertiary, fontSize: 11 }}>Quick:</Text>
        <Button 
          size="xs" 
          variant="light" 
          color="gray"
          onClick={() => onAmountChange(affiliate.totalAmount)}
        >
          Max ({formatCurrency(affiliate.totalAmount)})
        </Button>
        <Button 
          size="xs" 
          variant="light" 
          color="gray"
          onClick={() => onAmountChange(Math.floor(affiliate.totalAmount / 2))}
        >
          50%
        </Button>
        <Button 
          size="xs" 
          variant="light" 
          color="gray"
          onClick={() => onAmountChange(0)}
        >
          Reset
        </Button>
      </Group>
    </Stack>
  );
};

// ============================================
// Main Component
// ============================================

const ApprovalByAdmin: React.FC = () => {
  const { COLORS, isDark } = useDarkMode();

  const {
    groupedAffiliates,
    isLoading,
    error,
    successMessage,
    search,
    setSearch,
    rejectModalOpen,
    setRejectModalOpen,
    selectedCommission,
    rejectReason,
    setRejectReason,
    isRejecting,
    handleRefresh,
    approveById,
    handleReject,
    clearError,
    clearSuccessMessage,
    pendingStats,
    approvedStats,
    formatCurrency,
    formatDate,
    getLevelColor,
  } = useApproval();

  const [activeTab, setActiveTab] = useState<string | null>("commission");
  const [openedAccordions, setOpenedAccordions] = useState<string[]>([]);
  
  const [approveAmounts, setApproveAmounts] = useState<Record<string, number>>({});
  const [approvingUser, setApprovingUser] = useState<string | null>(null);

  const handleAmountChange = (affiliateCode: string, amount: number) => {
    setApproveAmounts((prev) => ({
      ...prev,
      [affiliateCode]: amount,
    }));
  };

  const handleApproveUser = async (affiliate: GroupedAffiliate) => {
    const amount = approveAmounts[affiliate.affiliateCode] || 0;
    if (amount <= 0) return;

    setApprovingUser(affiliate.affiliateCode);
    
    try {
      let remainingAmount = amount;
      const sortedCommissions = [...affiliate.commissions].sort((a, b) => a.amount - b.amount);
      
      for (const commission of sortedCommissions) {
        if (remainingAmount >= commission.amount) {
          await approveById(commission.id);
          remainingAmount -= commission.amount;
        }
        if (remainingAmount <= 0) break;
      }
      
      setApproveAmounts((prev) => ({
        ...prev,
        [affiliate.affiliateCode]: 0,
      }));

      handleRefresh();
    } catch {
      // Silent fail
    } finally {
      setApprovingUser(null);
    }
  };

  const content = (
    <Box
      style={{
        padding: "24px",
        backgroundColor: COLORS.bg.primary,
        minHeight: "100vh",
      }}
    >
      <Flex justify="space-between" align="center" mb={24}>
        <Box>
          <Title
            order={2}
            style={{
              color: isDark ? COLORS.text.light : COLORS.text.dark,
              fontWeight: 700,
              marginBottom: 4,
              fontSize:16
            }}
          >
            Admin Approval
          </Title>
          <Text style={{ color: COLORS.text.secondary, fontSize: 14 }}>
            Kelola approval komisi dan pencairan affiliate
          </Text>
        </Box>
      </Flex>

      <Tabs 
        value={activeTab} 
        onChange={setActiveTab}
        mb={24}
        styles={{
          root: {
            backgroundColor: isDark ? COLORS.bg.secondary : "#fff",
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
          },
          list: {
            borderBottom: `1px solid ${COLORS.border}`,
            padding: "0 16px",
          },
          tab: {
            color: COLORS.text.secondary,
            fontWeight: 500,
            "&[data-active]": {
              color: isDark ? COLORS.text.light : COLORS.text.dark,
              borderBottomColor: "#3b82f6",
            },
          },
          panel: {
            padding: 16,
          },
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="commission" leftSection={<IconCoins size={16} />}>
            Approval Komisi
          </Tabs.Tab>
          <Tabs.Tab value="withdrawal" leftSection={<IconCash size={16} />}>
            Approval Pencairan
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="commission" pt="md">
          <Flex justify="flex-end" mb={16}>
            <Button
              leftSection={<IconRefresh size={16} />} 
              variant="light"
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
          </Flex>

          <Flex gap={16} mb={24} wrap="wrap">
            <StatsCard
              icon={<IconClock size={24} color="#f97316" />}
              iconBgColor="rgba(249, 115, 22, 0.1)"
              label="Pending"
              count={pendingStats.count}
              amount={formatCurrency(pendingStats.amount)}
              amountColor="#f97316"
              isDark={isDark}
              COLORS={COLORS}
            />
            <StatsCard
              icon={<IconCheck size={24} color="#10b981" />}
              iconBgColor="rgba(16, 185, 129, 0.1)"
              label="Approved"
              count={approvedStats.count}
              amount={formatCurrency(approvedStats.amount)}
              amountColor="#10b981"
              isDark={isDark}
              COLORS={COLORS}
            />
          
          </Flex>

          {successMessage && (
            <Alert
              icon={<IconCheck size={18} />}
              color="green"
              mb={16}
              withCloseButton
              onClose={clearSuccessMessage}
              styles={{
                root: {
                  backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                },
              }}
            >
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              color="red"
              mb={16}
              withCloseButton
              onClose={clearError}
              styles={{
                root: {
                  backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Card
            shadow="sm"
            padding="md"
            radius="md"
            mb={16}
            style={{
              backgroundColor: isDark ? COLORS.bg.secondary : "#fff",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <TextInput
              placeholder="Cari transaksi atau nama..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ maxWidth: 400 }}
              styles={{
                input: {
                  backgroundColor: isDark ? COLORS.bg.primary : "#f9f9f9",
                  color: isDark ? COLORS.text.light : COLORS.text.dark,
                  border: `1px solid ${COLORS.border}`,
                },
              }}
            />
          </Card>

          <Card
            shadow="sm"
            padding="md"
            radius="md"
            style={{
              backgroundColor: isDark ? COLORS.bg.secondary : "#fff",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {isLoading ? (
              <Flex justify="center" align="center" py={60}>
                <Loader size="lg" />
              </Flex>
            ) : groupedAffiliates.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py={60}>
                <IconCheck size={48} color={COLORS.text.tertiary} />
                <Text
                  style={{
                    color: isDark ? COLORS.text.light : COLORS.text.dark,
                    fontSize: 16,
                    marginTop: 12,
                  }}
                >
                  Tidak ada komisi pending
                </Text>
                <Text
                  style={{
                    color: COLORS.text.tertiary,
                    fontSize: 13,
                  }}
                >
                  Semua komisi sudah di-review
                </Text>
              </Flex>
            ) : (
              <Accordion
                multiple
                value={openedAccordions}
                onChange={setOpenedAccordions}
                styles={{
                  item: {
                    backgroundColor: "transparent",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    marginBottom: 12,
                    "&[data-active]": {
                      backgroundColor: isDark ? COLORS.bg.secondary : "#f8fafc",
                    },
                  },
                  control: {
                    padding: "16px",
                    "&:hover": {
                      backgroundColor: isDark ? COLORS.bg.secondary : "#f1f5f9",
                    },
                  },
                  content: {
                    padding: 0,
                  },
                  chevron: {
                    color: COLORS.text.secondary,
                  },
                }}
              >
                {groupedAffiliates.map((affiliate) => (
                  <Accordion.Item key={affiliate.affiliateCode} value={affiliate.affiliateCode}>
                    <Accordion.Control>
                      <Text fw={600} style={{ color: isDark ? COLORS.text.light : COLORS.text.dark, fontSize: 16 }}>
                        {affiliate.affiliateName}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <AffiliateAccordionPanel
                        affiliate={affiliate}
                        approveAmount={approveAmounts[affiliate.affiliateCode] || 0}
                        onAmountChange={(amount) => handleAmountChange(affiliate.affiliateCode, amount)}
                        onApprove={() => handleApproveUser(affiliate)}
                        isApproving={approvingUser === affiliate.affiliateCode}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        getLevelColor={getLevelColor}
                        COLORS={COLORS}
                        isDark={isDark}
                      />
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="withdrawal" pt="md">
          <WithdrawalApprovalTab COLORS={COLORS} isDark={isDark} />
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={
          <Text fw={700} style={{ color: isDark ? COLORS.text.light : COLORS.text.dark }}>
            Reject Komisi
          </Text>
        }
        centered
        styles={{
          content: {
            backgroundColor: isDark ? COLORS.bg.secondary : "#fff",
          },
          header: {
            backgroundColor: isDark ? COLORS.bg.secondary : "#fff",
          },
        }}
      >
        {selectedCommission && (
          <Box>
            <Alert
              icon={<IconAlertCircle size={18} />}
              color="red"
              mb={16}
              styles={{
                root: {
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                },
              }}
            >
              Komisi akan di-reject dan tidak akan masuk ke dompet affiliate
            </Alert>

            <Box
              style={{
                backgroundColor: isDark ? COLORS.bg.secondary : "#f8fafc",
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <Flex justify="space-between" mb={8}>
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>
                  Receiver:
                </Text>
                <Text style={{ color: isDark ? COLORS.text.light : COLORS.text.dark, fontWeight: 600, fontSize: 13 }}>
                  {selectedCommission.receiverName}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>
                  Amount:
                </Text>
                <Text style={{ color: "#ef4444", fontWeight: 700, fontSize: 16 }}>
                  {formatCurrency(selectedCommission.amount)}
                </Text>
              </Flex>
            </Box>

            <Textarea
              label="Alasan Reject"
              placeholder="Masukkan alasan reject (wajib)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.currentTarget.value)}
              minRows={3}
              required
              mb={16}
              styles={{
                input: {
                  backgroundColor: isDark ? COLORS.bg.primary : "#f9f9f9",
                  color: isDark ? COLORS.text.light : COLORS.text.dark,
                  border: `1px solid ${COLORS.border}`,
                },
                label: {
                  color: isDark ? COLORS.text.light : COLORS.text.dark,
                },
              }}
            />

            <Flex justify="flex-end" gap={12}>
              <Button
                variant="light"
                color="gray"
                onClick={() => setRejectModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                color="red"
                leftSection={<IconX size={16} />}
                onClick={handleReject}
                loading={isRejecting}
                disabled={!rejectReason.trim()}
              >
                Reject Komisi
              </Button>
            </Flex>
          </Box>
        )}
      </Modal>
    </Box>
  );

  return <DashboardLayout>{content}</DashboardLayout>;
};

export default ApprovalByAdmin;
