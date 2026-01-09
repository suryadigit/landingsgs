import { Box, Group, Text, Menu, Divider, Avatar } from '@mantine/core';
import {
  IconSettings,
  IconLogout,
  IconUser,
  IconChevronDown,
} from '@tabler/icons-react';
import { COLORS } from '../../types/colors';
import { LevelBadge } from './LevelBadge';
import type { UserRole } from '../../api/auth';

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userLevel?: number;
  userRole?: UserRole;
  onLogout: () => void;
  isMobile: boolean | undefined;
  textColor: string;
}

export function UserMenu({
  userName,
  userEmail,
  userLevel = 1,
  userRole = 'MEMBER',
  onLogout,
  isMobile,
  textColor,
}: UserMenuProps) {
  return (
    <Menu 
      shadow="md" 
      width={isMobile ? 200 : 240} 
      position={isMobile ? "bottom" : "bottom-end"}
      styles={isMobile ? {
        dropdown: {
          maxWidth: 'calc(100vw - 24px)',
        }
      } : undefined}
    >
      <Menu.Target>
        {isMobile ? (
          <Group gap={8}>
            <LevelBadge level={userLevel} role={userRole} size="sm" />
            <Avatar
              name={userName}
              size={32}
              radius="md"
              style={{ cursor: 'pointer', flexShrink: 0 }}
            />
          </Group>
        ) : (
          <Group
            gap={10}
            style={{
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: 6,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LevelBadge level={userLevel} role={userRole} size="md" />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                fw={600}
                size="xs"
                style={{
                  color: textColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName}
              </Text>
              <Text
                size="xs"
                style={{
                  color: COLORS.text.tertiary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userEmail}
              </Text>
            </Box>
            <IconChevronDown
              size={14}
              color={COLORS.text.tertiary}
              style={{ transition: 'transform 0.2s', flexShrink: 0 }}
            />
          </Group>
        )}
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Profil</Menu.Label>
        <Menu.Item leftSection={<IconUser size={14} />}>Lihat Profil</Menu.Item>
        <Menu.Item leftSection={<IconSettings size={14} />}>
          Pengaturan Akun
        </Menu.Item>

        <Divider my="sm" />

        <Menu.Label>Pengaturan</Menu.Label>
        <Menu.Item leftSection={<IconSettings size={14} />}>Preferensi</Menu.Item>

        <Divider my="sm" />

        <Menu.Item
          leftSection={<IconLogout size={14} />}
          color="red"
          onClick={onLogout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
