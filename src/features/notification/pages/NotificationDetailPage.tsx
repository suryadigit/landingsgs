import React, { useEffect } from "react";
import {
  Box,
  Text,
  Group,
  Badge,
  Paper,
  Stack,
  Button,
  Divider,
  Loader,
  Center,
  Timeline,
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
  ThemeIcon,
  SimpleGrid,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconArrowLeft,
  IconCash,
  IconAlertCircle,
  IconCircleCheck,
  IconCircleX,
  IconHourglass,
  IconExternalLink,
  IconTrash,
  IconClock,
  IconUser,
  IconBuildingBank,
  IconReceipt,
  IconCheck,
  IconWallet,
  IconBell,
  IconGift,
  IconUserPlus,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { DashboardLayout } from "../../../components/dashboardlayout/dashboard.layout";
import { getNotificationById, deleteNotification, type Notification } from "../api";
import { getWithdrawalDetail } from "../../withdrawal";
import { COLORS } from "../../../shared/types";

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    WITHDRAWAL_REQUEST: <IconWallet size={22} />,
    WITHDRAWAL_APPROVED: <IconCircleCheck size={22} />,
    WITHDRAWAL_REJECTED: <IconCircleX size={22} />,
    WITHDRAWAL_COMPLETED: <IconCheck size={22} />,
    COMMISSION_EARNED: <IconCash size={22} />,
    COMMISSION_APPROVED: <IconReceipt size={22} />,
    REFERRAL_JOINED: <IconUserPlus size={22} />,
    NEW_REFERRAL: <IconUserPlus size={22} />,
    NEW_COMMISSION: <IconCash size={22} />,
    SYSTEM: <IconBell size={22} />,
    SYSTEM_ANNOUNCEMENT: <IconSpeakerphone size={22} />,
    WELCOME: <IconGift size={22} />,
    PROMO: <IconGift size={22} />,
  };
  return iconMap[type] || <IconBell size={22} />;
};

const getTypeColor = (type: string): string => {
  if (type.includes("APPROVED") || type.includes("COMPLETED") || type.includes("EARNED")) return "teal";
  if (type.includes("REJECTED")) return "red";
  if (type.includes("REQUEST") || type.includes("PENDING")) return "yellow";
  if (type.includes("REFERRAL") || type.includes("COMMISSION")) return "blue";
  if (type.includes("WELCOME") || type.includes("PROMO")) return "grape";
  return "gray";
};

const getNotificationTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    WITHDRAWAL_REQUEST: "Permintaan Penarikan",
    WITHDRAWAL_APPROVED: "Penarikan Disetujui",
    WITHDRAWAL_REJECTED: "Penarikan Ditolak",
    WITHDRAWAL_COMPLETED: "Penarikan Selesai",
    COMMISSION_EARNED: "Komisi Diterima",
    COMMISSION_APPROVED: "Komisi Disetujui",
    COMMISSION_PAID: "Komisi Dibayar",
    NEW_COMMISSION: "Komisi Baru",
    REFERRAL_JOINED: "Referral Bergabung",
    NEW_REFERRAL: "Referral Baru",
    SYSTEM: "Sistem",
    SYSTEM_ANNOUNCEMENT: "Pengumuman",
    WELCOME: "Selamat Datang",
    PROMO: "Promo",
    ACCOUNT_ACTIVATED: "Akun Diaktifkan",
  };
  return labels[type] || type.replace(/_/g, " ");
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    PENDING: { color: "yellow", label: "Menunggu", icon: <IconHourglass size={14} /> },
    APPROVED: { color: "teal", label: "Disetujui", icon: <IconCircleCheck size={14} /> },
    REJECTED: { color: "red", label: "Ditolak", icon: <IconCircleX size={14} /> },
    COMPLETED: { color: "green", label: "Selesai", icon: <IconCircleCheck size={14} /> },
    PAID: { color: "green", label: "Dibayar", icon: <IconCash size={14} /> },
  };

  const config = statusConfig[status] || { color: "gray", label: status, icon: null };

  return (
    <Badge size="md" color={config.color} variant="filled" leftSection={config.icon}>
      {config.label}
    </Badge>
  );
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

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

const formatFullDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimelineActive = (status: string): number => {
  switch (status) {
    case "PENDING": return 0;
    case "APPROVED": return 1;
    case "REJECTED": return 1;
    case "COMPLETED": return 2;
    default: return 0;
  }
};

const NotificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    data: notificationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notification", id],
    queryFn: () => getNotificationById(id!),
    enabled: !!id,
  });

  const notification: Notification | undefined = notificationData?.notification;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      navigate("/notifications");
    },
  });

  useEffect(() => {
    if (notification) {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  }, [notification?.id]);

  const withdrawalId = notification?.data?.withdrawalId as string | undefined;
  const isWithdrawalType = notification?.type?.includes("WITHDRAWAL");
  const hasWithdrawalId = !!withdrawalId;
  const isAlreadyProcessed = notification?.isProcessed || 
    notification?.message?.includes("✅") || 
    notification?.message?.includes("❌");

  const { data: withdrawalData, isLoading: isLoadingWithdrawal } = useQuery({
    queryKey: ["withdrawal", withdrawalId],
    queryFn: () => getWithdrawalDetail(withdrawalId!),
    enabled: !!notification && hasWithdrawalId && !isAlreadyProcessed,
    staleTime: 10 * 1000,
  });

  const withdrawal = withdrawalData?.withdrawal;
  const notifData = notification?.data || {};

  if (isLoading) {
    return (
      <DashboardLayout>
        <Center h="60vh">
          <Stack align="center" gap="md">
            <Loader size="md" />
            <Text c="dimmed" size="sm">Memuat notifikasi...</Text>
          </Stack>
        </Center>
      </DashboardLayout>
    );
  }

  if (error || !notification) {
    return (
      <DashboardLayout>
        <Box p={24}>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/notifications")}
            mb="lg"
            size="sm"
          >
            Kembali
          </Button>
          <Center h="40vh">
            <Stack align="center" gap="md">
              <ThemeIcon size={48} color="red" variant="light">
                <IconAlertCircle size={24} />
              </ThemeIcon>
              <Text size="md" fw={600}>Notifikasi Tidak Ditemukan</Text>
              <Text c="dimmed" size="sm" ta="center">
                Notifikasi yang Anda cari tidak ada atau sudah dihapus.
              </Text>
              <Button size="sm" onClick={() => navigate("/notifications")}>
                Kembali ke Notifikasi
              </Button>
            </Stack>
          </Center>
        </Box>
      </DashboardLayout>
    );
  }

  const typeColor = getTypeColor(notification.type);
  const fullDate = formatFullDate(notification.createdAt);

  return (
    <DashboardLayout>
      <Box
        p={{ base: 16, sm: 24 }}
        style={{
          backgroundColor: dark ? "#0d0d0d" : "#ffffff",
          minHeight: "100vh",
        }}
      >
        <Group justify="space-between" mb="md">
          <Group 
            gap={6} 
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/notifications")}
          >
            <IconArrowLeft size={18} color={dark ? "#909296" : "#666"} />
            <Text size="sm" c="dimmed">
              Kembali
            </Text>
          </Group>
          <Tooltip label="Hapus">
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={() => {
                if (confirm("Hapus notifikasi ini?")) {
                  deleteMutation.mutate(notification.id);
                }
              }}
              loading={deleteMutation.isPending}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Paper
          p={isMobile ? "md" : "xl"}
          radius="sm"
          withBorder
          style={{
            backgroundColor: dark ? "#1a1a1a" : "#ffffff",
            borderColor: dark ? "#2d2d2d" : "#e0e0e0",
          }}
        >
          <Group gap="md" align="flex-start" mb="lg">
            <ThemeIcon
              size={48}
              color={typeColor}
              variant="light"
            >
              {getNotificationIcon(notification.type)}
            </ThemeIcon>

            <Box style={{ flex: 1 }}>
              <Group gap="xs" mb={6}>
                <Badge size="sm" color={typeColor} variant="filled">
                  {getNotificationTypeLabel(notification.type)}
                </Badge>
                {!notification.isRead && (
                  <Badge size="sm" color="blue" variant="light">
                    Baru
                  </Badge>
                )}
              </Group>
              <Text size="lg" fw={600} mb={4} style={{ color: dark ? "#fff" : COLORS.text.dark }}>
                {notification.title}
              </Text>
              <Group gap="md">
                <Group gap={4}>
                  <IconUser size={14} color={dark ? "#666" : "#888"} />
                  <Text size="xs" c="dimmed">
                    {notification.fromUser?.fullName || notification.fromUser?.email || "Sistem"}
                  </Text>
                </Group>
                <Group gap={4}>
                  <IconClock size={14} color={dark ? "#666" : "#888"} />
                  <Text size="xs" c="dimmed">
                    {fullDate}
                  </Text>
                </Group>
              </Group>
            </Box>
          </Group>

          <Divider mb="lg" color={dark ? "#2d2d2d" : "#e8e8e8"} />

          <Box mb="lg">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">
              Pesan
            </Text>
            <Text
              size="sm"
              style={{
                color: dark ? "#ccc" : COLORS.text.dark,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {notification.message}
            </Text>
          </Box>

          {isWithdrawalType && (
            <>
              <Divider mb="lg" color={dark ? "#2d2d2d" : "#e8e8e8"} />
              
              <Group justify="space-between" mb="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Detail Pencairan
                </Text>
                <Button
                  size="xs"
                  variant="subtle"
                  rightSection={<IconExternalLink size={12} />}
                  onClick={() => navigate("/withdrawal")}
                >
                  Lihat Riwayat
                </Button>
              </Group>

              {isLoadingWithdrawal && (
                <Center py="md">
                  <Loader size="sm" />
                </Center>
              )}

              {(withdrawal || Object.keys(notifData).length > 0) && (
                <Stack gap="md">
                  <Group justify="space-between" p="md" style={{
                    backgroundColor: dark ? "#222" : "#f5f5f5",
                    borderRadius: 8,
                  }}>
                    <Text size="sm" c="dimmed">Status</Text>
                    <StatusBadge status={withdrawal?.status || notifData.status as string || "PENDING"} />
                  </Group>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    <Paper p="md" withBorder style={{ 
                      backgroundColor: dark ? "#252525" : "#fafafa",
                      borderColor: dark ? "#333" : "#e0e0e0",
                    }}>
                      <Group gap="sm">
                        <ThemeIcon size={32} variant="light" color="blue">
                          <IconCash size={16} />
                        </ThemeIcon>
                        <Box>
                          <Text size="xs" c="dimmed">Jumlah</Text>
                          <Text size="sm" fw={600} c="blue">
                            {formatCurrency(withdrawal?.amount || Number(notifData.amount) || 0)}
                          </Text>
                        </Box>
                      </Group>
                    </Paper>

                    <Paper p="md" withBorder style={{ 
                      backgroundColor: dark ? "#252525" : "#fafafa",
                      borderColor: dark ? "#333" : "#e0e0e0",
                    }}>
                      <Group gap="sm">
                        <ThemeIcon size={32} variant="light" color="grape">
                          <IconBuildingBank size={16} />
                        </ThemeIcon>
                        <Box>
                          <Text size="xs" c="dimmed">Bank</Text>
                          <Text size="sm" fw={500}>
                            {withdrawal?.bankName || notifData.bankName || "-"}
                            {withdrawal?.accountNumber && ` ••••${withdrawal.accountNumber.slice(-4)}`}
                          </Text>
                        </Box>
                      </Group>
                    </Paper>

                    {(withdrawal?.accountHolder || notifData.accountHolder) && (
                      <Paper p="md" withBorder style={{ 
                        backgroundColor: dark ? "#252525" : "#fafafa",
                        borderColor: dark ? "#333" : "#e0e0e0",
                      }}>
                        <Group gap="sm">
                          <ThemeIcon size={32} variant="light" color="teal">
                            <IconUser size={16} />
                          </ThemeIcon>
                          <Box>
                            <Text size="xs" c="dimmed">Atas Nama</Text>
                            <Text size="sm" fw={500}>
                              {withdrawal?.accountHolder || notifData.accountHolder as string}
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    )}

                    {withdrawal?.createdAt && (
                      <Paper p="md" withBorder style={{ 
                        backgroundColor: dark ? "#252525" : "#fafafa",
                        borderColor: dark ? "#333" : "#e0e0e0",
                      }}>
                        <Group gap="sm">
                          <ThemeIcon size={32} variant="light" color="orange">
                            <IconClock size={16} />
                          </ThemeIcon>
                          <Box>
                            <Text size="xs" c="dimmed">Tanggal Permintaan</Text>
                            <Text size="sm" fw={500}>
                              {formatDate(withdrawal.createdAt)}
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    )}
                  </SimpleGrid>

                  {withdrawal && (
                    <Box mt="sm">
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="md">
                        Riwayat Status
                      </Text>
                      <Timeline active={getTimelineActive(withdrawal.status)} bulletSize={24} lineWidth={2}>
                        <Timeline.Item
                          bullet={<IconReceipt size={12} />}
                          title={<Text size="sm" fw={500}>Permintaan Dibuat</Text>}
                        >
                          <Text size="xs" c="dimmed">
                            {formatDate(withdrawal.requestedAt || withdrawal.createdAt)}
                          </Text>
                        </Timeline.Item>

                        {(withdrawal.status === "APPROVED" || withdrawal.status === "COMPLETED") && (
                          <Timeline.Item
                            bullet={<IconCircleCheck size={12} />}
                            title={<Text size="sm" fw={500}>Disetujui</Text>}
                            color="teal"
                          >
                            <Text size="xs" c="dimmed">
                              {formatDate(withdrawal.approvedAt)}
                            </Text>
                          </Timeline.Item>
                        )}

                        {withdrawal.status === "REJECTED" && (
                          <Timeline.Item
                            bullet={<IconCircleX size={12} />}
                            title={<Text size="sm" fw={500}>Ditolak</Text>}
                            color="red"
                          >
                            <Text size="xs" c="dimmed">
                              {withdrawal.notes || "Tidak ada catatan"}
                            </Text>
                          </Timeline.Item>
                        )}

                        {withdrawal.status === "COMPLETED" && (
                          <Timeline.Item
                            bullet={<IconCheck size={12} />}
                            title={<Text size="sm" fw={500}>Selesai</Text>}
                            color="green"
                          >
                            <Text size="xs" c="dimmed">
                              {formatDate(withdrawal.completedAt)}
                            </Text>
                          </Timeline.Item>
                        )}
                      </Timeline>
                    </Box>
                  )}
                </Stack>
              )}
            </>
          )}

          {!isWithdrawalType && notification.data && Object.keys(notification.data).length > 0 && (
            <>
              <Divider mb="lg" color={dark ? "#2d2d2d" : "#e8e8e8"} />
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="md">
                Informasi Tambahan
              </Text>
              <Stack gap="xs">
                {Object.entries(notification.data).map(([key, value]) => {
                  if (key === "withdrawalId") return null;
                  return (
                    <Group key={key} justify="space-between" p="sm" style={{
                      backgroundColor: dark ? "#222" : "#f8f8f8",
                      borderRadius: 6,
                    }}>
                      <Text size="sm" c="dimmed" tt="capitalize">
                        {key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim()}
                      </Text>
                      <Text size="sm" fw={500}>
                        {key === "amount" && typeof value === "number" 
                          ? formatCurrency(value)
                          : String(value)}
                      </Text>
                    </Group>
                  );
                })}
              </Stack>
            </>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default NotificationDetailPage;
