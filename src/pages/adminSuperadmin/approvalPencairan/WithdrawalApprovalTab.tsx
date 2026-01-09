import React from "react";
import {
  Box,
  Text,
  Table,
  Badge,
  Button,
  Group,
  TextInput,
  Pagination,
  Modal,
  Textarea,
  Alert,
  Loader,
  Card,
  Flex,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconSearch,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconRefresh,
  IconClock,
  IconCash,
  IconBuildingBank,
  IconReceipt,
} from "@tabler/icons-react";
import { useWithdrawalApproval, type WithdrawalRequest } from "./useWithdrawalApproval";

// ============================================
// Sub-components
// ============================================

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
        <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>{label}</Text>
        <Text style={{ color: COLORS.text.primary, fontSize: 22, fontWeight: 700 }}>
          {count}
        </Text>
        {amount && (
          <Text style={{ color: amountColor, fontSize: 13, fontWeight: 600 }}>
            {amount}
          </Text>
        )}
      </Box>
    </Group>
  </Card>
);

// Withdrawal Table Row
interface WithdrawalRowProps {
  withdrawal: WithdrawalRequest;
  isDark: boolean;
  COLORS: any;
  formatCurrency: (n: number) => string;
  formatDate: (d: string) => string;
  onApprove: () => void;
  onReject: () => void;
  onComplete: () => void;
}

const WithdrawalRow: React.FC<WithdrawalRowProps> = ({
  withdrawal,
  isDark,
  COLORS,
  formatCurrency,
  formatDate,
  onApprove,
  onReject,
  onComplete,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge color="orange" variant="light">Pending</Badge>;
      case "APPROVED":
        return <Badge color="blue" variant="light">Approved</Badge>;
      case "COMPLETED":
        return <Badge color="green" variant="light">Completed</Badge>;
      case "REJECTED":
        return <Badge color="red" variant="light">Rejected</Badge>;
      default:
        return <Badge color="gray" variant="light">{status}</Badge>;
    }
  };

  // Helper to get user info (handles nested or flat structure)
  const userName = withdrawal.user?.name || withdrawal.userName || "-";
  const userEmail = withdrawal.user?.email || withdrawal.userEmail || "-";
  const accountName = withdrawal.accountName || withdrawal.accountHolder || "-";
  const createdDate = withdrawal.createdAt || withdrawal.requestedAt || "";

  return (
    <Table.Tr
      style={{
        backgroundColor: isDark ? COLORS.bg.secondary : "#fff",
      }}
    >
      <Table.Td>
        <Text style={{ color: COLORS.text.primary, fontWeight: 500, fontSize: 13 }}>
          {userName}
        </Text>
        <Text style={{ color: COLORS.text.secondary, fontSize: 11 }}>
          {userEmail}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>
          {formatCurrency(withdrawal.amount)}
        </Text>
        {withdrawal.fee !== undefined && withdrawal.fee > 0 && (
          <Text style={{ color: COLORS.text.tertiary, fontSize: 11 }}>
            Fee: {formatCurrency(withdrawal.fee)}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <IconBuildingBank size={14} color={COLORS.text.secondary} />
          <Text style={{ color: COLORS.text.primary, fontSize: 13 }}>
            {withdrawal.bankName || "-"}
          </Text>
        </Group>
        <Text style={{ color: COLORS.text.secondary, fontSize: 11 }}>
          {withdrawal.accountNumber || "-"}
        </Text>
        <Text style={{ color: COLORS.text.tertiary, fontSize: 11 }}>
          a.n {accountName}
        </Text>
      </Table.Td>
      <Table.Td>
        {getStatusBadge(withdrawal.status)}
      </Table.Td>
      <Table.Td>
        <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
          {createdDate ? formatDate(createdDate) : "-"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={8}>
          {withdrawal.status === "PENDING" && (
            <>
              <Tooltip label="Approve">
                <ActionIcon color="blue" variant="light" size="lg" onClick={onApprove}>
                  <IconCheck size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Reject">
                <ActionIcon color="red" variant="light" size="lg" onClick={onReject}>
                  <IconX size={18} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
          {withdrawal.status === "APPROVED" && (
            <Tooltip label="Complete Transfer">
              <ActionIcon color="green" variant="light" size="lg" onClick={onComplete}>
                <IconReceipt size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

// ============================================
// Main Component
// ============================================

interface WithdrawalApprovalTabProps {
  COLORS: any;
  isDark: boolean;
}

const WithdrawalApprovalTab: React.FC<WithdrawalApprovalTabProps> = ({ COLORS, isDark }) => {
  const {
    withdrawals,
    isLoading,
    error,
    successMessage,
    stats,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    // Modals
    approveModalOpen,
    setApproveModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    completeModalOpen,
    setCompleteModalOpen,
    selectedWithdrawal,
    // Form inputs
    adminNotes,
    setAdminNotes,
    rejectReason,
    setRejectReason,
    transferReference,
    setTransferReference,
    // Loading states
    isApproving,
    isRejecting,
    isCompleting,
    // Actions
    handleRefresh,
    openApproveModal,
    openRejectModal,
    openCompleteModal,
    handleApprove,
    handleReject,
    handleComplete,
    clearError,
    clearSuccessMessage,
    // Helpers
    formatCurrency,
    formatDate,
  } = useWithdrawalApproval();

  // Helper function to get user name (handles both nested and flat structure)
  const getUserName = (w: WithdrawalRequest) => w.user?.name || w.userName || "-";

  return (
    <Box>
      {/* Stats Cards */}
      <Flex gap={16} mb={24} wrap="wrap">
        <StatsCard
          icon={<IconClock size={24} color="#f97316" />}
          iconBgColor="rgba(249, 115, 22, 0.1)"
          label="Pending"
          count={stats.pending.count}
          amount={formatCurrency(stats.pending.amount)}
          amountColor="#f97316"
          isDark={isDark}
          COLORS={COLORS}
        />
        <StatsCard
          icon={<IconCash size={24} color="#3b82f6" />}
          iconBgColor="rgba(59, 130, 246, 0.1)"
          label="Approved (Siap Transfer)"
          count={stats.approved.count}
          amount={formatCurrency(stats.approved.amount)}
          amountColor="#3b82f6"
          isDark={isDark}
          COLORS={COLORS}
        />
      </Flex>

      {/* Success Message */}
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

      {/* Error Message */}
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

      {/* Filters */}
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
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Group>
            <TextInput
              placeholder="Cari nama atau rekening..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ minWidth: 280 }}
              styles={{
                input: {
                  backgroundColor: isDark ? COLORS.bg.primary : "#f9f9f9",
                  color: COLORS.text.primary,
                  border: `1px solid ${COLORS.border}`,
                },
              }}
            />
          </Group>

          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
        </Flex>
      </Card>

      {/* Table */}
      <Card
        shadow="sm"
        padding={0}
        radius="md"
        style={{
          backgroundColor: isDark ? COLORS.bg.secondary : "#fff",
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <Flex justify="center" align="center" py={60}>
            <Loader size="lg" />
          </Flex>
        ) : withdrawals.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={60}>
            <IconCash size={48} color={COLORS.text.tertiary} />
            <Text
              style={{
                color: COLORS.text.secondary,
                fontSize: 16,
                marginTop: 12,
              }}
            >
              Tidak ada request pencairan
            </Text>
            <Text
              style={{
                color: COLORS.text.tertiary,
                fontSize: 13,
              }}
            >
              Semua request sudah diproses
            </Text>
          </Flex>
        ) : (
          <Table.ScrollContainer minWidth={900}>
            <Table
              striped
              highlightOnHover
              styles={{
                table: { backgroundColor: isDark ? COLORS.bg.secondary : "#fff" },
                thead: { backgroundColor: isDark ? COLORS.bg.tertiary : "#f9f9f9" },
                th: {
                  color: COLORS.text.secondary,
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "uppercase",
                  padding: "12px 16px",
                },
                td: { padding: "12px 16px" },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Bank Info</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Tanggal</Table.Th>
                  <Table.Th>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {withdrawals.map((withdrawal) => (
                  <WithdrawalRow
                    key={withdrawal.id}
                    withdrawal={withdrawal}
                    isDark={isDark}
                    COLORS={COLORS}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    onApprove={() => openApproveModal(withdrawal)}
                    onReject={() => openRejectModal(withdrawal)}
                    onComplete={() => openCompleteModal(withdrawal)}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justify="center" py={16}>
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              color="blue"
            />
          </Flex>
        )}
      </Card>

      {/* Approve Modal */}
      <Modal
        opened={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title={
          <Text style={{ fontWeight: 700, color: COLORS.text.primary }}>
            Approve Pencairan
          </Text>
        }
        centered
        styles={{
          content: { backgroundColor: isDark ? COLORS.bg.secondary : "#fff" },
          header: { backgroundColor: isDark ? COLORS.bg.secondary : "#fff" },
        }}
      >
        <Box>
          {selectedWithdrawal && (
            <Box
              mb={16}
              p={12}
              style={{
                backgroundColor: isDark ? COLORS.bg.tertiary : "#f9f9f9",
                borderRadius: 8,
              }}
            >
              <Flex justify="space-between" mb={8}>
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>User:</Text>
                <Text style={{ color: COLORS.text.primary, fontWeight: 600 }}>
                  {getUserName(selectedWithdrawal)}
                </Text>
              </Flex>
              <Flex justify="space-between" mb={8}>
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>Amount:</Text>
                <Text style={{ color: "#10b981", fontWeight: 700 }}>
                  {formatCurrency(selectedWithdrawal.amount)}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>Bank:</Text>
                <Text style={{ color: COLORS.text.primary, fontWeight: 500 }}>
                  {selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}
                </Text>
              </Flex>
            </Box>
          )}

          <Textarea
            label="Catatan Admin (opsional)"
            placeholder="Tambahkan catatan..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.currentTarget.value)}
            mb={16}
            styles={{
              input: {
                backgroundColor: isDark ? COLORS.bg.primary : "#fff",
                color: COLORS.text.primary,
                border: `1px solid ${COLORS.border}`,
              },
              label: { color: COLORS.text.secondary },
            }}
          />

          <Alert
            icon={<IconAlertCircle size={16} />}
            color="blue"
            mb={16}
            styles={{
              root: {
                backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              },
            }}
          >
            Setelah di-approve, pencairan akan masuk status "Approved" dan siap untuk ditransfer.
          </Alert>

          <Flex justify="flex-end" gap={12}>
            <Button variant="light" color="gray" onClick={() => setApproveModalOpen(false)}>
              Batal
            </Button>
            <Button
              color="blue"
              leftSection={<IconCheck size={16} />}
              onClick={handleApprove}
              loading={isApproving}
            >
              Approve
            </Button>
          </Flex>
        </Box>
      </Modal>

      {/* Reject Modal */}
      <Modal
        opened={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={
          <Text style={{ fontWeight: 700, color: COLORS.text.primary }}>
            Reject Pencairan
          </Text>
        }
        centered
        styles={{
          content: { backgroundColor: isDark ? COLORS.bg.secondary : "#fff" },
          header: { backgroundColor: isDark ? COLORS.bg.secondary : "#fff" },
        }}
      >
        <Box>
          {selectedWithdrawal && (
            <Box
              mb={16}
              p={12}
              style={{
                backgroundColor: isDark ? COLORS.bg.tertiary : "#f9f9f9",
                borderRadius: 8,
              }}
            >
              <Flex justify="space-between" mb={8}>
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>User:</Text>
                <Text style={{ color: COLORS.text.primary, fontWeight: 600 }}>
                  {getUserName(selectedWithdrawal)}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>Amount:</Text>
                <Text style={{ color: "#10b981", fontWeight: 700 }}>
                  {formatCurrency(selectedWithdrawal.amount)}
                </Text>
              </Flex>
            </Box>
          )}

          <Textarea
            label="Alasan Penolakan"
            placeholder="Masukkan alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.currentTarget.value)}
            required
            mb={16}
            styles={{
              input: {
                backgroundColor: isDark ? COLORS.bg.primary : "#fff",
                color: COLORS.text.primary,
                border: `1px solid ${COLORS.border}`,
              },
              label: { color: COLORS.text.secondary },
            }}
          />

          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb={16}
            styles={{
              root: {
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              },
            }}
          >
            Dana akan dikembalikan ke saldo affiliate.
          </Alert>

          <Flex justify="flex-end" gap={12}>
            <Button variant="light" color="gray" onClick={() => setRejectModalOpen(false)}>
              Batal
            </Button>
            <Button
              color="red"
              leftSection={<IconX size={16} />}
              onClick={handleReject}
              loading={isRejecting}
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </Flex>
        </Box>
      </Modal>

      {/* Complete Modal */}
      <Modal
        opened={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title={
          <Text style={{ fontWeight: 700, color: COLORS.text.primary }}>
            Konfirmasi Transfer Selesai
          </Text>
        }
        centered
        styles={{
          content: { backgroundColor: isDark ? COLORS.bg.secondary : "#fff" },
          header: { backgroundColor: isDark ? COLORS.bg.secondary : "#fff" },
        }}
      >
        <Box>
          {selectedWithdrawal && (
            <Box
              mb={16}
              p={12}
              style={{
                backgroundColor: isDark ? COLORS.bg.tertiary : "#f9f9f9",
                borderRadius: 8,
              }}
            >
              <Flex justify="space-between" mb={8}>
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>User:</Text>
                <Text style={{ color: COLORS.text.primary, fontWeight: 600 }}>
                  {getUserName(selectedWithdrawal)}
                </Text>
              </Flex>
              <Flex justify="space-between" mb={8}>
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>Amount:</Text>
                <Text style={{ color: "#10b981", fontWeight: 700 }}>
                  {formatCurrency(selectedWithdrawal.amount)}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>Bank:</Text>
                <Text style={{ color: COLORS.text.primary, fontWeight: 500 }}>
                  {selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}
                </Text>
              </Flex>
            </Box>
          )}

          <TextInput
            label="No. Referensi Transfer"
            placeholder="Masukkan nomor referensi transfer..."
            value={transferReference}
            onChange={(e) => setTransferReference(e.currentTarget.value)}
            required
            mb={16}
            styles={{
              input: {
                backgroundColor: isDark ? COLORS.bg.primary : "#fff",
                color: COLORS.text.primary,
                border: `1px solid ${COLORS.border}`,
              },
              label: { color: COLORS.text.secondary },
            }}
          />

          <Alert
            icon={<IconCheck size={16} />}
            color="green"
            mb={16}
            styles={{
              root: {
                backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              },
            }}
          >
            Pencairan akan ditandai sebagai selesai dan notifikasi akan dikirim ke user.
          </Alert>

          <Flex justify="flex-end" gap={12}>
            <Button variant="light" color="gray" onClick={() => setCompleteModalOpen(false)}>
              Batal
            </Button>
            <Button
              color="green"
              leftSection={<IconReceipt size={16} />}
              onClick={handleComplete}
              loading={isCompleting}
              disabled={!transferReference.trim()}
            >
              Konfirmasi Selesai
            </Button>
          </Flex>
        </Box>
      </Modal>
    </Box>
  );
};

export default WithdrawalApprovalTab;
