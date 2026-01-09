import {
  Box,
  Text,
  Menu,
  Divider,
  ScrollArea,
  Loader,
  ActionIcon,
  Group,
  Badge,
  Tooltip,
} from "@mantine/core";
import {
  IconBell,
  IconCheck,
  IconChecks,
  IconInbox,
  IconMail,
  IconMailOpened,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../../shared/types";
import {
  useNotificationMenu,
  getNotificationColor,
  formatNotificationTime,
} from "../../../shared/hooks";
import type { Notification } from "../../../features/notification";

interface NotificationMenuProps {
  textColor: string;
  bgColor: string;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
  isMarkingAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick: () => void;
  isMarkingAsRead: boolean;
}) {
  const color = getNotificationColor(notification.type);
  const timeAgo = formatNotificationTime(notification.createdAt);

  return (
    <Menu.Item
      onClick={onClick}
      style={{
        backgroundColor: notification.isRead
          ? "transparent"
          : "rgba(59, 130, 246, 0.05)",
        borderLeft: notification.isRead
          ? "none"
          : `3px solid ${COLORS.accent.primary}`,
        cursor: "pointer",
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
          {notification.isRead ? (
            <IconMailOpened size={20} color="#999" />
          ) : (
            <IconMail size={20} color={COLORS.accent.primary} />
          )}
          
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" mb={2}>
              <Text
                size="sm"
                fw={notification.isRead ? 500 : 700}
                lineClamp={1}
                style={{ flex: 1 }}
              >
                {notification.title}
              </Text>
              {!notification.isRead && (
                <Badge size="xs" color={color} variant="filled">
                  Baru
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" lineClamp={1} mb={2}>
              {notification.message}
            </Text>
            <Text size="xs" c="dimmed">
              {timeAgo}
            </Text>
          </Box>
        </Group>
        
        {!notification.isRead && (
          <Tooltip label="Tandai sudah dibaca" withArrow position="left">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              loading={isMarkingAsRead}
            >
              <IconCheck size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Menu.Item>
  );
}

function EmptyNotifications() {
  return (
    <Box
      py="xl"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconInbox size={48} color={COLORS.text.secondary} stroke={1.5} />
      <Text size="sm" c="dimmed" mt="md" ta="center">
        Tidak ada notifikasi
      </Text>
      <Text size="xs" c="dimmed" ta="center">
        Anda sudah up-to-date!
      </Text>
    </Box>
  );
}

export function NotificationMenu({ textColor, bgColor }: NotificationMenuProps) {
  const navigate = useNavigate();
  const {
    unreadCount,
    notifications,
    isLoadingCount,
    isLoadingNotifications,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isOpen,
    handleOpen,
    handleClose,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotificationMenu();

  const handleNotificationClick = (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification && !notification.isRead) {
      handleMarkAsRead(notificationId);
    }
    handleClose();
    navigate("/notifications");
  };

  return (
    <Menu
      shadow="md"
      width={380}
      position="bottom-end"
      opened={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
    >
      <Menu.Target>
        <Box
          style={{
            position: "relative",
            cursor: "pointer",
            padding: 6,
            borderRadius: 6,
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <IconBell size={18} color={textColor} />
          {!isLoadingCount && unreadCount > 0 && (
            <Box
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 700,
                border: `2px solid ${bgColor}`,
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Box>
          )}
        </Box>
      </Menu.Target>
      <Menu.Dropdown>
        {/* Header */}
        <Group justify="space-between" px="sm" py="xs">
          <Group gap="xs">
            <Text size="sm" fw={600}>
              Notifikasi
            </Text>
            {unreadCount > 0 && (
              <Badge size="sm" color="red" variant="filled">
                {unreadCount}
              </Badge>
            )}
          </Group>
          {unreadCount > 0 && (
            <Tooltip label="Tandai semua sudah dibaca" withArrow>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="blue"
                onClick={handleMarkAllAsRead}
                loading={isMarkingAllAsRead}
              >
                <IconChecks size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        <Divider />

        <ScrollArea.Autosize mah={350} type="scroll">
          {isLoadingNotifications ? (
            <Box
              py="xl"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Loader size="sm" />
            </Box>
          ) : notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onClick={() => handleNotificationClick(notification.id)}
                isMarkingAsRead={isMarkingAsRead}
              />
            ))
          )}
        </ScrollArea.Autosize>

        <Divider />
        <Menu.Item
          onClick={() => {
            handleClose();
            navigate("/notifications");
          }}
          style={{
            textAlign: "center",
            color: COLORS.accent.primary,
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          Lihat Semua Notifikasi →
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
