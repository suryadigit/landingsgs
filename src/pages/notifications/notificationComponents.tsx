import React, { useState } from "react";
import {
  Box,
  Text,
  Group,
  Badge,
  ActionIcon,
  Tooltip,
  Paper,
  Skeleton,
  TextInput,
  Select,
  Button,
  Modal,
  Divider,
  Stack,
  CopyButton,
  Loader,
  Alert,
  Timeline,
  SimpleGrid,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCheck,
  IconInbox,
  IconSearch,
  IconRefresh,
  IconChecks,
  IconBell,
  IconFilter,
  IconMail,
  IconMailOpened,
  IconUser,
  IconClock,
  IconCopy,
  IconX,
  IconCash,
  IconAlertCircle,
  IconCircleCheck,
  IconCircleX,
  IconHourglass,
  IconExternalLink,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { COLORS } from "../../types/colors";
import type { Notification, NotificationType } from "../../api/notification";
import { getWithdrawalDetail } from "../../api/withdrawal";
import {
  getNotificationIcon,
  getNotificationColor,
  formatNotificationTime,
} from "../../hooks/useNotification";
import type {
  NotificationFilter,
  NotificationTypeFilter,
} from "./useNotificationPage";
import {
  notificationTypeOptions,
  statusFilterOptions,
} from "./useNotificationPage";

// ==================== NOTIFICATION CARD ====================

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isMarkingAsRead: boolean;
  dark: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  isMarkingAsRead,
  dark,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);
  const timeAgo = formatNotificationTime(notification.createdAt);
  const fullDate = new Date(notification.createdAt).toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if withdrawal related and has withdrawalId
  const withdrawalId = notification.data?.withdrawalId as string | undefined;
  const isWithdrawalType = notification.type.includes("WITHDRAWAL");

  // Fetch withdrawal status for card display
  const { data: withdrawalData } = useQuery({
    queryKey: ["withdrawal-status", withdrawalId],
    queryFn: () => getWithdrawalDetail(withdrawalId!),
    enabled: isWithdrawalType && !!withdrawalId,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });

  // Determine final status from multiple sources
  const getFinalStatus = (): string | null => {
    // 1. Check from fetched withdrawal data first (most reliable)
    if (withdrawalData?.withdrawal?.status) {
      return withdrawalData.withdrawal.status;
    }
    // 2. Check from notification.data.status
    if (notification.data?.status) {
      return notification.data.status as string;
    }
    // 3. Check from message if processed
    if (notification.isProcessed || notification.message.includes("✅") || notification.message.includes("❌")) {
      if (notification.message.includes("✅") || notification.message.includes("DISETUJUI")) {
        return "APPROVED";
      }
      if (notification.message.includes("❌") || notification.message.includes("DITOLAK")) {
        return "REJECTED";
      }
    }
    return null;
  };

  const finalStatus = getFinalStatus();

  const handleCardClick = () => {
    setIsDetailOpen(true);
    // Auto mark as read when opened
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <>
      <Paper
        p={isMobile ? "sm" : "md"}
        radius="md"
        withBorder
        style={{
          backgroundColor: notification.isRead
            ? dark
              ? "#1a1a1a"
              : "#ffffff"
            : dark
            ? "rgba(59, 130, 246, 0.1)"
            : "rgba(59, 130, 246, 0.05)",
          borderLeft: notification.isRead
            ? undefined
            : `4px solid ${COLORS.accent.primary}`,
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        {/* Mobile Layout */}
        {isMobile ? (
          <Stack gap="xs">
            {/* Top row: Icon + Title + Badge */}
            <Group gap="xs" wrap="nowrap">
              <Box style={{ flexShrink: 0 }}>
                {notification.isRead ? (
                  <IconMailOpened size={22} color={dark ? "#666" : "#999"} />
                ) : (
                  <IconMail size={22} color={COLORS.accent.primary} />
                )}
              </Box>
              <Text
                size="sm"
                fw={notification.isRead ? 500 : 700}
                lineClamp={1}
                style={{ flex: 1, color: dark ? "#ffffff" : COLORS.text.dark }}
              >
                {notification.title}
              </Text>
              {!notification.isRead && (
                <Badge size="xs" color="blue" variant="filled">
                  Baru
                </Badge>
              )}
            </Group>
            
            {/* Message */}
            <Text size="xs" c="dimmed" lineClamp={2}>
              {notification.message}
            </Text>
            
            {/* Bottom row: Time + Badges */}
            <Group justify="space-between" wrap="wrap" gap={4}>
              <Group gap={4}>
                <Text size="xs" c="dimmed">
                  {timeAgo}
                </Text>
                {notification.fromUser && (
                  <Text size="xs" c="dimmed">
                    • {notification.fromUser.fullName || notification.fromUser.email}
                  </Text>
                )}
              </Group>
              <Group gap={4}>
                {finalStatus && <SmallStatusBadge status={finalStatus} />}
                <Badge size="xs" variant="light" color={color}>
                  {getNotificationTypeLabel(notification.type)}
                </Badge>
              </Group>
            </Group>
          </Stack>
        ) : (
          /* Desktop Layout */
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              {/* Icon - Mail style */}
              <Box
                style={{
                  fontSize: 24,
                  lineHeight: 1,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {notification.isRead ? (
                  <IconMailOpened size={28} color={dark ? "#666" : "#999"} />
                ) : (
                  <IconMail size={28} color={COLORS.accent.primary} />
                )}
              </Box>

              {/* Content */}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" mb={4} wrap="nowrap">
                  <Text
                    size="md"
                    fw={notification.isRead ? 500 : 700}
                    lineClamp={1}
                    style={{
                      color: dark ? "#ffffff" : COLORS.text.dark,
                    }}
                  >
                    {notification.title}
                  </Text>
                  {/* Show "Baru" badge if unread */}
                  {!notification.isRead && (
                    <Badge size="sm" color="blue" variant="filled">
                      Baru
                    </Badge>
                  )}
                </Group>
                <Text
                  size="sm"
                  c="dimmed"
                  lineClamp={1}
                  mb={4}
                  style={{
                    color: dark ? "#a1a1a1" : COLORS.text.tertiary,
                  }}
                >
                  {notification.message}
                </Text>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    {timeAgo}
                  </Text>
                  {notification.fromUser && (
                    <Text size="xs" c="dimmed">
                      • dari{" "}
                      {notification.fromUser.fullName || notification.fromUser.email}
                    </Text>
                  )}
                </Group>
              </Box>

              {/* Type badge and status badge on the right */}
              <Box style={{ flexShrink: 0, textAlign: "right" }}>
                <Group gap={6} justify="flex-end">
                  {/* Show final status badge if processed */}
                  {finalStatus && (
                    <SmallStatusBadge status={finalStatus} />
                  )}
                  <Badge size="xs" variant="light" color={color}>
                    {getNotificationTypeLabel(notification.type)}
                  </Badge>
                </Group>
              </Box>
            </Group>

            {/* Actions */}
            {!notification.isRead && (
              <Tooltip label="Tandai sudah dibaca" withArrow>
                <ActionIcon
                  size="md"
                  variant="light"
                  color="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  loading={isMarkingAsRead}
                >
                  <IconCheck size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        )}
      </Paper>

      {/* Detail Modal - Email Style */}
      <NotificationDetailModal
        notification={notification}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        dark={dark}
        icon={icon}
        color={color}
        fullDate={fullDate}
      />
    </>
  );
};

// ==================== NOTIFICATION DETAIL MODAL ====================

interface NotificationDetailModalProps {
  notification: Notification;
  isOpen: boolean;
  onClose: () => void;
  dark: boolean;
  icon: string;
  color: string;
  fullDate: string;
}

// Small status badge for card list
const SmallStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { color: string; label: string }> = {
    PENDING: { color: "yellow", label: "Menunggu" },
    APPROVED: { color: "blue", label: "Disetujui" },
    REJECTED: { color: "red", label: "Ditolak" },
    COMPLETED: { color: "green", label: "Selesai" },
    PAID: { color: "green", label: "Dibayar" },
  };

  const config = statusConfig[status] || { color: "gray", label: status };

  return (
    <Badge size="xs" color={config.color} variant="outline">
      {config.label}
    </Badge>
  );
};

// Status badge component (larger, with icon)
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    PENDING: { color: "yellow", label: "Menunggu", icon: <IconHourglass size={14} /> },
    APPROVED: { color: "blue", label: "Disetujui", icon: <IconCircleCheck size={14} /> },
    REJECTED: { color: "red", label: "Ditolak", icon: <IconCircleX size={14} /> },
    COMPLETED: { color: "green", label: "Selesai", icon: <IconCircleCheck size={14} /> },
    PAID: { color: "green", label: "Dibayar", icon: <IconCash size={14} /> },
  };

  const config = statusConfig[status] || { color: "gray", label: status, icon: null };

  return (
    <Badge size="lg" color={config.color} variant="filled" leftSection={config.icon}>
      {config.label}
    </Badge>
  );
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  isOpen,
  onClose,
  dark,
  icon,
  color,
  fullDate,
}) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Check if notification has related withdrawal data
  const withdrawalId = notification.data?.withdrawalId as string | undefined;
  const isWithdrawalType = notification.type.includes("WITHDRAWAL");
  const hasWithdrawalId = !!withdrawalId;
  
  // Check if notification is already processed (from message containing ✅ or ❌)
  const isAlreadyProcessed = notification.isProcessed || 
    notification.message.includes("✅") || 
    notification.message.includes("❌");

  // Fetch withdrawal data only if we have withdrawalId and notification is not processed
  const {
    data: withdrawalData,
    isLoading: isLoadingWithdrawal,
    error: withdrawalError,
  } = useQuery({
    queryKey: ["withdrawal", withdrawalId],
    queryFn: () => getWithdrawalDetail(withdrawalId!),
    enabled: isOpen && hasWithdrawalId && !isAlreadyProcessed,
    staleTime: 10 * 1000,
  });

  const withdrawal = withdrawalData?.withdrawal;
  
  // Extract data from notification.data for display when no fetch needed
  const notifData = notification.data || {};

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size={isMobile ? "full" : "lg"}
      padding={isMobile ? "md" : "xl"}
      radius={isMobile ? 0 : "md"}
      fullScreen={isMobile}
      title={
        <Group gap="sm">
          <Text size={isMobile ? "lg" : "xl"}>{icon}</Text>
          <Text size={isMobile ? "md" : "lg"} fw={700}>
            Detail Notifikasi
          </Text>
        </Group>
      }
      styles={{
        header: {
          backgroundColor: dark ? "#1a1a1a" : "#ffffff",
        },
        body: {
          backgroundColor: dark ? "#1a1a1a" : "#ffffff",
        },
        content: {
          backgroundColor: dark ? "#1a1a1a" : "#ffffff",
        },
      }}
    >
      <Stack gap={isMobile ? "sm" : "md"}>
        {/* Header Info */}
        <Paper
          p={isMobile ? "sm" : "md"}
          radius="md"
          style={{
            backgroundColor: dark ? "#252525" : "#f8f9fa",
          }}
        >
          <Group justify="space-between" mb="sm" wrap="wrap" gap="xs">
            <Badge size={isMobile ? "sm" : "md"} color={color} variant="filled">
              {getNotificationTypeLabel(notification.type)}
            </Badge>
            {notification.isRead ? (
              <Badge size="sm" color="gray" variant="light">
                Sudah Dibaca
              </Badge>
            ) : (
              <Badge size="sm" color="blue" variant="filled">
                Belum Dibaca
              </Badge>
            )}
          </Group>

          {/* From */}
          <Group gap="xs" mb="xs">
            <IconUser size={16} color={dark ? "#888" : "#666"} />
            <Text size="sm" c="dimmed">
              Dari:
            </Text>
            <Text size="sm" fw={500}>
              {notification.fromUser
                ? notification.fromUser.fullName || notification.fromUser.email
                : "Sistem"}
            </Text>
          </Group>

          {/* Date */}
          <Group gap="xs">
            <IconClock size={16} color={dark ? "#888" : "#666"} />
            <Text size="sm" c="dimmed">
              Tanggal:
            </Text>
            <Text size="sm" fw={500}>
              {fullDate}
            </Text>
          </Group>
        </Paper>

        <Divider />

        {/* Subject/Title */}
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
            Subjek
          </Text>
          <Text size="lg" fw={700} style={{ color: dark ? "#fff" : COLORS.text.dark }}>
            {notification.title}
          </Text>
        </Box>

        <Divider />

        {/* Message Body */}
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={8}>
            Pesan
          </Text>
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: dark ? "#252525" : "#f8f9fa",
              minHeight: 80,
            }}
          >
            <Text
              size="md"
              style={{
                color: dark ? "#e0e0e0" : COLORS.text.dark,
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {notification.message}
            </Text>
          </Paper>
        </Box>

        {/* Real-time Withdrawal Status - Show for withdrawal-related notifications */}
        {isWithdrawalType && (
          <>
            <Divider />
            <Box>
              <Group justify="space-between" mb={8}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  {isAlreadyProcessed ? "Informasi Pencairan" : "Status Pencairan Terkini"}
                </Text>
                <Button
                  size="xs"
                  variant="subtle"
                  rightSection={<IconExternalLink size={14} />}
                  onClick={() => {
                    onClose();
                    navigate("/approval-withdrawal");
                  }}
                >
                  Lihat di Approval
                </Button>
              </Group>

              {/* Case 1: Already processed - show status from notification data */}
              {isAlreadyProcessed && (
                <Paper
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: dark ? "#252525" : "#f8f9fa",
                    borderColor: dark ? "#333" : "#e0e0e0",
                  }}
                >
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>Status:</Text>
                      <StatusBadge status={notifData.status as string || (notification.message.includes("✅") ? "APPROVED" : "REJECTED")} />
                    </Group>
                    
                    {notifData.amount && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Jumlah:</Text>
                        <Text size="md" fw={700} c="blue">
                          {formatCurrency(Number(notifData.amount))}
                        </Text>
                      </Group>
                    )}
                    
                    {notifData.bankName && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Bank:</Text>
                        <Text size="sm" fw={500}>
                          {notifData.bankName}{notifData.accountNumber ? ` - ${notifData.accountNumber}` : ""}
                        </Text>
                      </Group>
                    )}

                    {notification.isProcessed && notification.processedAt && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Diproses pada:</Text>
                        <Text size="sm" fw={500}>
                          {formatDate(notification.processedAt)}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Paper>
              )}

              {/* Case 2: Has withdrawalId and not processed - fetch real-time data */}
              {!isAlreadyProcessed && hasWithdrawalId && (
                <>
                  {isLoadingWithdrawal && (
                    <Paper p="md" radius="md" style={{ backgroundColor: dark ? "#252525" : "#f8f9fa" }}>
                      <Group>
                        <Loader size="sm" />
                        <Text size="sm" c="dimmed">Memuat data pencairan...</Text>
                      </Group>
                    </Paper>
                  )}

                  {withdrawalError && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                      Gagal memuat data pencairan
                    </Alert>
                  )}

                  {withdrawal && (
                    <Paper
                      p="md"
                      radius="md"
                      withBorder
                      style={{
                        backgroundColor: dark ? "#252525" : "#f8f9fa",
                        borderColor: dark ? "#333" : "#e0e0e0",
                      }}
                    >
                      <Stack gap="md">
                        {/* Current Status */}
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>Status Saat Ini:</Text>
                          <StatusBadge status={withdrawal.status} />
                        </Group>

                        <Divider />

                        {/* Withdrawal Details */}
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">Jumlah:</Text>
                          <Text size="md" fw={700} c="blue">
                            {formatCurrency(withdrawal.amount)}
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">Bank:</Text>
                          <Text size="sm" fw={500}>
                            {withdrawal.bankName} - {withdrawal.accountNumber}
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">Atas Nama:</Text>
                          <Text size="sm" fw={500}>{withdrawal.accountHolder}</Text>
                        </Group>

                        {/* Timeline */}
                        <Divider />
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                          Riwayat Status
                        </Text>
                        <Timeline active={getTimelineActive(withdrawal.status)} bulletSize={20} lineWidth={2}>
                          <Timeline.Item
                            bullet={<IconCash size={12} />}
                            title="Permintaan Dibuat"
                          >
                            <Text size="xs" c="dimmed">
                              {formatDate(withdrawal.requestedAt || withdrawal.createdAt)}
                            </Text>
                          </Timeline.Item>

                          {(withdrawal.status === "APPROVED" || withdrawal.status === "COMPLETED") && (
                            <Timeline.Item
                              bullet={<IconCircleCheck size={12} />}
                              title="Disetujui"
                              color="blue"
                            >
                              <Text size="xs" c="dimmed">
                                {formatDate(withdrawal.approvedAt)}
                              </Text>
                            </Timeline.Item>
                          )}

                          {withdrawal.status === "REJECTED" && (
                            <Timeline.Item
                              bullet={<IconCircleX size={12} />}
                              title="Ditolak"
                              color="red"
                            >
                              <Text size="xs" c="dimmed">
                                {withdrawal.notes || "Tidak ada catatan"}
                              </Text>
                            </Timeline.Item>
                          )}

                          {withdrawal.status === "COMPLETED" && (
                            <Timeline.Item
                              bullet={<IconCircleCheck size={12} />}
                              title="Selesai"
                              color="green"
                            >
                              <Text size="xs" c="dimmed">
                                {formatDate(withdrawal.completedAt)}
                              </Text>
                            </Timeline.Item>
                          )}
                        </Timeline>
                      </Stack>
                    </Paper>
                  )}
                </>
              )}

              {/* Case 3: No withdrawalId and not processed - show data from notification.data */}
              {!isAlreadyProcessed && !hasWithdrawalId && Object.keys(notifData).length > 0 && (
                <Paper
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: dark ? "#252525" : "#f8f9fa",
                    borderColor: dark ? "#333" : "#e0e0e0",
                  }}
                >
                  <Stack gap="sm">
                    {notifData.status && (
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>Status:</Text>
                        <StatusBadge status={notifData.status as string} />
                      </Group>
                    )}
                    
                    {notifData.amount && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Jumlah:</Text>
                        <Text size="md" fw={700} c="blue">
                          {formatCurrency(Number(notifData.amount))}
                        </Text>
                      </Group>
                    )}
                    
                    {notifData.bankName && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Bank:</Text>
                        <Text size="sm" fw={500}>
                          {notifData.bankName}{notifData.accountNumber ? ` - ${notifData.accountNumber}` : ""}
                        </Text>
                      </Group>
                    )}

                    {notifData.accountHolder && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Atas Nama:</Text>
                        <Text size="sm" fw={500}>{notifData.accountHolder}</Text>
                      </Group>
                    )}
                  </Stack>
                </Paper>
              )}
            </Box>
          </>
        )}

        {/* Additional Data if exists (for non-withdrawal notifications) */}
        {!isWithdrawalType && notification.data && Object.keys(notification.data).length > 0 && (
          <>
            <Divider />
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={8}>
                Informasi Tambahan
              </Text>
              <Paper
                p="md"
                radius="md"
                style={{
                  backgroundColor: dark ? "#252525" : "#f8f9fa",
                }}
              >
                <Stack gap="xs">
                  {Object.entries(notification.data).map(([key, value]) => (
                    <Group key={key} justify="space-between">
                      <Text size="sm" c="dimmed" tt="capitalize">
                        {formatDataKey(key)}:
                      </Text>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>
                          {formatDataValue(key, value)}
                        </Text>
                        <CopyButton value={String(value)}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? "Tersalin!" : "Salin"}>
                              <ActionIcon
                                size="xs"
                                variant="subtle"
                                color={copied ? "green" : "gray"}
                                onClick={copy}
                              >
                                <IconCopy size={12} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Box>
          </>
        )}

        {/* Close Button */}
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} leftSection={<IconX size={16} />}>
            Tutup
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// Helper: Get timeline active step based on status
const getTimelineActive = (status: string): number => {
  switch (status) {
    case "PENDING":
      return 0;
    case "APPROVED":
      return 1;
    case "REJECTED":
      return 1;
    case "COMPLETED":
      return 2;
    default:
      return 0;
  }
};

// Helper: Format data key for display
const formatDataKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    withdrawalId: "ID Pencairan",
    commissionId: "ID Komisi",
    amount: "Jumlah",
    bankName: "Bank",
    accountNumber: "No. Rekening",
    accountHolder: "Atas Nama",
    status: "Status",
    userId: "ID User",
  };
  return keyMap[key] || key.replace(/_/g, " ");
};

// Helper: Format data value for display
const formatDataValue = (key: string, value: any): string => {
  if (key === "amount" && typeof value === "number") {
    return formatCurrency(value);
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

// ==================== FILTERS ====================

interface NotificationFiltersProps {
  searchValue: string;
  statusFilter: NotificationFilter;
  typeFilter: NotificationTypeFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: NotificationFilter) => void;
  onTypeFilterChange: (value: NotificationTypeFilter) => void;
  onRefresh: () => void;
  onMarkAllAsRead: () => void;
  unreadCount: number;
  isMarkingAllAsRead: boolean;
  dark: boolean;
  isMobile: boolean;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  searchValue,
  statusFilter,
  typeFilter,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onRefresh,
  onMarkAllAsRead,
  unreadCount,
  isMarkingAllAsRead,
  dark,
  isMobile,
}) => {
  return (
    <Paper
      p={isMobile ? "sm" : "md"}
      radius="md"
      withBorder
      mb="lg"
      style={{
        backgroundColor: dark ? "#1a1a1a" : "#ffffff",
      }}
    >
      {isMobile ? (
        /* Mobile Layout - Stacked */
        <Stack gap="sm">
          <TextInput
            placeholder="Cari notifikasi..."
            leftSection={<IconSearch size={16} />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            size="sm"
          />
          <Group gap="xs" grow>
            <Select
              placeholder="Status"
              leftSection={<IconFilter size={14} />}
              data={statusFilterOptions}
              value={statusFilter}
              onChange={(value) =>
                onStatusFilterChange((value as NotificationFilter) || "all")
              }
              size="sm"
              clearable={false}
            />
            <Select
              placeholder="Tipe"
              leftSection={<IconBell size={14} />}
              data={notificationTypeOptions}
              value={typeFilter}
              onChange={(value) =>
                onTypeFilterChange((value as NotificationTypeFilter) || "ALL")
              }
              size="sm"
              clearable={false}
            />
          </Group>
          <Group gap="xs" justify="space-between">
            <ActionIcon size="md" variant="light" onClick={onRefresh}>
              <IconRefresh size={16} />
            </ActionIcon>
            {unreadCount > 0 && (
              <Button
                leftSection={<IconChecks size={14} />}
                variant="light"
                size="xs"
                onClick={onMarkAllAsRead}
                loading={isMarkingAllAsRead}
              >
                Tandai Dibaca ({unreadCount})
              </Button>
            )}
          </Group>
        </Stack>
      ) : (
        /* Desktop Layout */
        <Group justify="space-between" wrap="wrap" gap="md">
          {/* Search & Filters */}
          <Group gap="md" wrap="wrap" style={{ flex: 1 }}>
            <TextInput
              placeholder="Cari notifikasi..."
              leftSection={<IconSearch size={16} />}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ minWidth: 250 }}
            />
            <Select
              placeholder="Status"
              leftSection={<IconFilter size={16} />}
              data={statusFilterOptions}
              value={statusFilter}
              onChange={(value) =>
                onStatusFilterChange((value as NotificationFilter) || "all")
              }
              style={{ minWidth: 150 }}
              clearable={false}
            />
            <Select
              placeholder="Tipe"
              leftSection={<IconBell size={16} />}
              data={notificationTypeOptions}
              value={typeFilter}
              onChange={(value) =>
                onTypeFilterChange((value as NotificationTypeFilter) || "ALL")
              }
              style={{ minWidth: 200 }}
              clearable={false}
            />
          </Group>

          {/* Actions */}
          <Group gap="sm">
            <Tooltip label="Refresh" withArrow>
              <ActionIcon size="lg" variant="light" onClick={onRefresh}>
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            {unreadCount > 0 && (
              <Button
                leftSection={<IconChecks size={16} />}
                variant="light"
                size="sm"
                onClick={onMarkAllAsRead}
                loading={isMarkingAllAsRead}
              >
                Tandai Semua Dibaca ({unreadCount})
              </Button>
            )}
          </Group>
        </Group>
      )}
    </Paper>
  );
};

// ==================== STATS CARDS ====================

interface NotificationStatsProps {
  total: number;
  unread: number;
  read: number;
  dark: boolean;
}

export const NotificationStats: React.FC<NotificationStatsProps> = ({
  total,
  unread,
  read,
  dark,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const stats = [
    {
      label: "Total",
      value: total,
      color: "#3b82f6",
      bgColor: dark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)",
      icon: IconBell,
    },
    {
      label: "Belum Dibaca",
      value: unread,
      color: "#ef4444",
      bgColor: dark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)",
      icon: IconInbox,
    },
    {
      label: "Sudah Dibaca",
      value: read,
      color: "#22c55e",
      bgColor: dark ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.1)",
      icon: IconCheck,
    },
  ];

  if (isMobile) {
    // Mobile: Simple horizontal pills
    return (
      <Group gap={8} mb="md" style={{ overflowX: "auto", flexWrap: "nowrap" }}>
        {stats.map((stat) => (
          <Box
            key={stat.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 20,
              backgroundColor: stat.bgColor,
              flexShrink: 0,
            }}
          >
            <stat.icon size={14} color={stat.color} />
            <Text size="xs" fw={500} style={{ color: dark ? "#a1a1a1" : "#666" }}>
              {stat.label}
            </Text>
            <Text size="sm" fw={700} style={{ color: stat.color }}>
              {stat.value}
            </Text>
          </Box>
        ))}
      </Group>
    );
  }

  // Desktop: Card layout
  return (
    <SimpleGrid cols={3} spacing="md" mb="lg">
      {stats.map((stat) => (
        <Paper
          key={stat.label}
          p="md"
          radius="md"
          withBorder
          style={{
            backgroundColor: dark ? "#1a1a1a" : "#ffffff",
          }}
        >
          <Group gap="sm" wrap="nowrap">
            <ActionIcon
              size="lg"
              variant="light"
              color={stat.color === "#3b82f6" ? "blue" : stat.color === "#ef4444" ? "red" : "green"}
              radius="md"
            >
              <stat.icon size={18} />
            </ActionIcon>
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                {stat.label}
              </Text>
              <Text size="xl" fw={700}>
                {stat.value}
              </Text>
            </Box>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
};

// ==================== EMPTY STATE ====================

interface EmptyStateProps {
  dark: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ dark }) => {
  return (
    <Paper
      p="xl"
      radius="md"
      withBorder
      style={{
        backgroundColor: dark ? "#1a1a1a" : "#ffffff",
        textAlign: "center",
      }}
    >
      <IconInbox
        size={64}
        color={dark ? "#666666" : COLORS.text.tertiary}
        stroke={1.5}
        style={{ margin: "0 auto 16px" }}
      />
      <Text size="lg" fw={600} mb={4}>
        Tidak ada notifikasi
      </Text>
      <Text size="sm" c="dimmed">
        Anda sudah up-to-date dengan semua notifikasi
      </Text>
    </Paper>
  );
};

// ==================== LOADING STATE ====================

export const LoadingState: React.FC = () => {
  return (
    <Box>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} height={100} radius="md" mb="md" />
      ))}
    </Box>
  );
};

// ==================== ERROR STATE ====================

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  dark: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  dark,
}) => {
  return (
    <Paper
      p="xl"
      radius="md"
      withBorder
      style={{
        backgroundColor: dark ? "#1a1a1a" : "#ffffff",
        textAlign: "center",
      }}
    >
      <Text size="lg" fw={600} c="red" mb={8}>
        Terjadi Kesalahan
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        {message}
      </Text>
      <Button variant="light" onClick={onRetry}>
        Coba Lagi
      </Button>
    </Paper>
  );
};

// ==================== HELPERS ====================

export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    WITHDRAWAL_REQUEST: "Permintaan Pencairan",
    ACTIVATION_REQUEST: "Permintaan Aktivasi",
    SUPPORT_REQUEST: "Permintaan Bantuan",
    WITHDRAWAL_APPROVED: "Pencairan Disetujui",
    WITHDRAWAL_REJECTED: "Pencairan Ditolak",
    COMMISSION_APPROVED: "Komisi Disetujui",
    COMMISSION_PAID: "Komisi Dibayar",
    ACCOUNT_ACTIVATED: "Akun Diaktifkan",
    SYSTEM_ANNOUNCEMENT: "Pengumuman",
    NEW_REFERRAL: "Referral Baru",
    NEW_COMMISSION: "Komisi Baru",
  };
  return labels[type] || type;
};
