import React from "react";
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
  SimpleGrid,
  Stack,
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
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { COLORS } from "../../../shared/types";
import type { Notification } from "../api";
import { getWithdrawalDetail } from "../../withdrawal";
import type { NotificationFilter, NotificationTypeFilter } from "../types/notificationPageTypes";
import { notificationTypeOptions, statusFilterOptions, notificationTypeLabels } from "../constants/notificationConstants";


const getNotificationColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    WITHDRAWAL_REQUEST: "orange",
    WITHDRAWAL_APPROVED: "blue",
    WITHDRAWAL_REJECTED: "red",
    WITHDRAWAL_COMPLETED: "green",
    COMMISSION_EARNED: "teal",
    COMMISSION_APPROVED: "cyan",
    REFERRAL_JOINED: "violet",
    SYSTEM: "gray",
    WELCOME: "blue",
    PROMO: "pink",
  };
  return colorMap[type] || "gray";
};

const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID");
};

const getNotificationTypeLabel = (type: string): string => {
  return notificationTypeLabels[type] || type;
};


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
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const color = getNotificationColor(notification.type);
  const timeAgo = formatNotificationTime(notification.createdAt);

  const withdrawalId = notification.data?.withdrawalId as string | undefined;
  const isWithdrawalType = notification.type.includes("WITHDRAWAL");

  const { data: withdrawalData } = useQuery({
    queryKey: ["withdrawal-status", withdrawalId],
    queryFn: () => getWithdrawalDetail(withdrawalId!),
    enabled: isWithdrawalType && !!withdrawalId,
    staleTime: 30 * 1000,
  });

  const getFinalStatus = (): string | null => {
    if (withdrawalData?.withdrawal?.status) {
      return withdrawalData.withdrawal.status;
    }
    if (notification.data?.status) {
      return notification.data.status as string;
    }
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
    navigate(`/notifications/${notification.id}`);
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Paper
      p={isMobile ? "sm" : "md"}
      radius="md"
      withBorder
      style={{
        backgroundColor: notification.isRead
          ? dark ? "#1a1a1a" : "#ffffff"
          : dark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
        borderLeft: notification.isRead ? undefined : `4px solid ${COLORS.accent.primary}`,
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onClick={handleCardClick}
    >
      {isMobile ? (
        <Stack gap="xs">
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
              <Badge size="xs" color="blue" variant="filled">Baru</Badge>
            )}
          </Group>
          
          <Text size="xs" c="dimmed" lineClamp={2}>
            {notification.message}
          </Text>
          
          <Group justify="space-between" wrap="wrap" gap={4}>
            <Group gap={4}>
              <Text size="xs" c="dimmed">{timeAgo}</Text>
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
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>
              {notification.isRead ? (
                <IconMailOpened size={28} color={dark ? "#666" : "#999"} />
              ) : (
                <IconMail size={28} color={COLORS.accent.primary} />
              )}
            </Box>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" mb={4} wrap="nowrap">
                <Text
                  size="md"
                  fw={notification.isRead ? 500 : 700}
                  lineClamp={1}
                  style={{ color: dark ? "#ffffff" : COLORS.text.dark }}
                >
                  {notification.title}
                </Text>
                {!notification.isRead && (
                  <Badge size="sm" color="blue" variant="filled">Baru</Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed" lineClamp={1} mb={4}>
                {notification.message}
              </Text>
              <Group gap="xs">
                <Text size="xs" c="dimmed">{timeAgo}</Text>
                {notification.fromUser && (
                  <Text size="xs" c="dimmed">
                    • dari {notification.fromUser.fullName || notification.fromUser.email}
                  </Text>
                )}
              </Group>
            </Box>

            <Box style={{ flexShrink: 0, textAlign: "right" }}>
              <Group gap={6} justify="flex-end">
                {finalStatus && <SmallStatusBadge status={finalStatus} />}
                <Badge size="xs" variant="light" color={color}>
                  {getNotificationTypeLabel(notification.type)}
                </Badge>
              </Group>
            </Box>
          </Group>

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
  );
};


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
      style={{ backgroundColor: dark ? "#1a1a1a" : "#ffffff" }}
    >
      {isMobile ? (
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
              onChange={(value) => onStatusFilterChange((value as NotificationFilter) || "all")}
              size="sm"
              clearable={false}
            />
            <Select
              placeholder="Tipe"
              leftSection={<IconBell size={14} />}
              data={notificationTypeOptions}
              value={typeFilter}
              onChange={(value) => onTypeFilterChange((value as NotificationTypeFilter) || "ALL")}
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
        <Group justify="space-between" wrap="wrap" gap="md">
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
              onChange={(value) => onStatusFilterChange((value as NotificationFilter) || "all")}
              style={{ minWidth: 150 }}
              clearable={false}
            />
            <Select
              placeholder="Tipe"
              leftSection={<IconBell size={16} />}
              data={notificationTypeOptions}
              value={typeFilter}
              onChange={(value) => onTypeFilterChange((value as NotificationTypeFilter) || "ALL")}
              style={{ minWidth: 200 }}
              clearable={false}
            />
          </Group>

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
    { label: "Total", value: total, color: "#3b82f6", bgColor: dark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)", icon: IconBell },
    { label: "Belum Dibaca", value: unread, color: "#ef4444", bgColor: dark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)", icon: IconInbox },
    { label: "Sudah Dibaca", value: read, color: "#22c55e", bgColor: dark ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.1)", icon: IconCheck },
  ];

  if (isMobile) {
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
            <Text size="xs" fw={500} style={{ color: dark ? "#a1a1a1" : "#666" }}>{stat.label}</Text>
            <Text size="sm" fw={700} style={{ color: stat.color }}>{stat.value}</Text>
          </Box>
        ))}
      </Group>
    );
  }

  return (
    <SimpleGrid cols={3} spacing="md" mb="lg">
      {stats.map((stat) => (
        <Paper key={stat.label} p="md" radius="md" withBorder style={{ backgroundColor: dark ? "#1a1a1a" : "#ffffff" }}>
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
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{stat.label}</Text>
              <Text size="xl" fw={700}>{stat.value}</Text>
            </Box>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
};


export const EmptyState: React.FC<{ dark: boolean }> = ({ dark }) => (
  <Paper p="xl" radius="md" withBorder style={{ backgroundColor: dark ? "#1a1a1a" : "#ffffff", textAlign: "center" }}>
    <IconInbox size={64} color={dark ? "#666666" : COLORS.text.tertiary} stroke={1.5} style={{ margin: "0 auto 16px" }} />
    <Text size="lg" fw={600} mb={4}>Tidak ada notifikasi</Text>
    <Text size="sm" c="dimmed">Anda sudah up-to-date dengan semua notifikasi</Text>
  </Paper>
);


export const LoadingState: React.FC = () => (
  <Box>
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} height={100} radius="md" mb="md" />
    ))}
  </Box>
);


export const ErrorState: React.FC<{ message: string; onRetry: () => void; dark: boolean }> = ({ message, onRetry, dark }) => (
  <Paper p="xl" radius="md" withBorder style={{ backgroundColor: dark ? "#1a1a1a" : "#ffffff", textAlign: "center" }}>
    <Text size="lg" fw={600} c="red" mb={8}>Terjadi Kesalahan</Text>
    <Text size="sm" c="dimmed" mb="md">{message}</Text>
    <Button variant="light" onClick={onRetry}>Coba Lagi</Button>
  </Paper>
);
