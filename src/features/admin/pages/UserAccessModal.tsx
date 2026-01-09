import { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  Group,
  Stack,
  Badge,
  Divider,
  Button,
  Select,
  Checkbox,
  Loader,
  Center,
  Alert,
  Tabs,
  Paper,
  ScrollArea,
} from '@mantine/core';
import {
  IconUser,
  IconShield,
  IconMenu2,
  IconCheck,
  IconAlertCircle,
  IconKey,
} from '@tabler/icons-react';
import { useDarkMode } from '../../../shared/hooks';
import type { UserDetail, UpdateUserAccessRequest, AvailableMenu, AvailablePermission } from '../../../features/admin';

interface UserAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  availableMenus: AvailableMenu[];
  availablePermissions: AvailablePermission[];
  onSave: (data: UpdateUserAccessRequest) => Promise<boolean>;
  error: string | null;
}

export function UserAccessModal({
  isOpen,
  onClose,
  user,
  isLoading,
  isSaving,
  availableMenus,
  availablePermissions,
  onSave,
  error,
}: UserAccessModalProps) {
  const { COLORS, isDark } = useDarkMode();
  
  const [role, setRole] = useState<string>('');
  const [menuUpdates, setMenuUpdates] = useState<Map<string, boolean>>(new Map());
  const [permissionUpdates, setPermissionUpdates] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (user && availableMenus.length > 0) {
      setRole(user.role);
      
      const menuMap = new Map<string, boolean>();
      availableMenus.forEach(menu => {
        menuMap.set(menu.id, menu.isEnabled);
      });
      setMenuUpdates(menuMap);
      
      const permMap = new Map<string, boolean>();
      availablePermissions.forEach(perm => {
        permMap.set(perm.id, perm.isEnabled);
      });
      setPermissionUpdates(permMap);
    }
  }, [user, availableMenus, availablePermissions]);

  const handleSave = async () => {
    const menuAccessData = Array.from(menuUpdates.entries()).map(([menuId, isEnabled]) => ({
      menuId,
      isEnabled,
    }));

    const permissionsData = Array.from(permissionUpdates.entries()).map(([permissionId, isEnabled]) => ({
      permissionId,
      isEnabled,
    }));

    const success = await onSave({
      role: role as 'MEMBER' | 'ADMIN' | 'SUPERADMIN',
      menuAccess: menuAccessData,
      permissions: permissionsData,
    });
    
    if (success) {
      // Keep modal open to show success, user can close manually
    }
  };

  const toggleMenu = (menuId: string) => {
    setMenuUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(menuId, !prev.get(menuId));
      return newMap;
    });
  };

  const togglePermission = (permissionId: string) => {
    setPermissionUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(permissionId, !prev.get(permissionId));
      return newMap;
    });
  };

  const memberMenus = availableMenus.filter(m => !m.isAdmin);
  const adminMenus = availableMenus.filter(m => m.isAdmin);

  const permissionsByCategory = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, AvailablePermission[]>);

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconUser size={20} />
          <Text fw={600}>Kelola Akses User</Text>
        </Group>
      }
      size="lg"
      styles={{
        content: {
          backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
        },
        header: {
          backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
        },
      }}
    >
      {isLoading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : user ? (
        <Stack gap="md">
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: isDark ? COLORS.bg.tertiary : '#f8f9fa',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <Group justify="space-between">
              <div>
                <Text fw={600} c={COLORS.text.primary}>
                  {user.fullName || 'Nama belum diisi'}
                </Text>
                <Text size="sm" c={COLORS.text.secondary}>
                  {user.email}
                </Text>
              </div>
              <Badge
                color={user.isActive ? 'green' : 'red'}
                variant="light"
              >
                {user.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </Group>
          </Paper>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          )}

          <Tabs defaultValue="role">
            <Tabs.List>
              <Tabs.Tab value="role" leftSection={<IconShield size={14} />}>
                Role
              </Tabs.Tab>
              <Tabs.Tab value="menus" leftSection={<IconMenu2 size={14} />}>
                Menu Access
              </Tabs.Tab>
              <Tabs.Tab value="permissions" leftSection={<IconKey size={14} />}>
                Permissions
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="role" pt="md">
              <Stack gap="md">
                <Select
                  label="Role"
                  description="Pilih role untuk user ini"
                  value={role}
                  onChange={(value) => setRole(value || 'MEMBER')}
                  data={[
                    { value: 'MEMBER', label: 'Member (Affiliate)' },
                    { value: 'ADMIN', label: 'Admin' },
                    { value: 'SUPERADMIN', label: 'Super Admin' },
                  ]}
                />
                
                <Paper
                  p="sm"
                  radius="md"
                  style={{
                    backgroundColor: isDark ? COLORS.bg.tertiary : '#f8f9fa',
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Text size="xs" c="dimmed">
                    Status user (Aktif/Nonaktif) dikontrol melalui status affiliate profile.
                  </Text>
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="menus" pt="md">
              <ScrollArea h={300}>
                <Stack gap="md">
                  {memberMenus.length > 0 && (
                    <div>
                      <Text size="sm" fw={600} c={COLORS.text.primary} mb="xs">
                        Menu Member
                      </Text>
                      <Stack gap="xs">
                        {memberMenus.map((menu) => (
                          <Checkbox
                            key={menu.id}
                            label={`${menu.label} (${menu.link})`}
                            checked={menuUpdates.get(menu.id) || false}
                            onChange={() => toggleMenu(menu.id)}
                          />
                        ))}
                      </Stack>
                    </div>
                  )}

                  {adminMenus.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <Text size="sm" fw={600} c={COLORS.text.primary} mb="xs">
                          Menu Admin
                        </Text>
                        <Stack gap="xs">
                          {adminMenus.map((menu) => (
                            <Checkbox
                              key={menu.id}
                              label={`${menu.label} (${menu.link})`}
                              checked={menuUpdates.get(menu.id) || false}
                              onChange={() => toggleMenu(menu.id)}
                              disabled={role === 'MEMBER'}
                            />
                          ))}
                        </Stack>
                        {role === 'MEMBER' && (
                          <Text size="xs" c="dimmed" mt="xs">
                            * Menu admin hanya tersedia untuk role Admin/SuperAdmin
                          </Text>
                        )}
                      </div>
                    </>
                  )}

                  {availableMenus.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      Tidak ada menu tersedia
                    </Text>
                  )}
                </Stack>
              </ScrollArea>
            </Tabs.Panel>

            <Tabs.Panel value="permissions" pt="md">
              <ScrollArea h={300}>
                <Stack gap="md">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category}>
                      <Text size="sm" fw={600} c={COLORS.text.primary} mb="xs" tt="capitalize">
                        {category}
                      </Text>
                      <Stack gap="xs">
                        {perms.map((perm) => (
                          <Checkbox
                            key={perm.id}
                            label={
                              <div>
                                <Text size="sm">{perm.name}</Text>
                                {perm.description && (
                                  <Text size="xs" c="dimmed">{perm.description}</Text>
                                )}
                              </div>
                            }
                            checked={permissionUpdates.get(perm.id) || false}
                            onChange={() => togglePermission(perm.id)}
                          />
                        ))}
                      </Stack>
                    </div>
                  ))}

                  {availablePermissions.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      Tidak ada permission tersedia
                    </Text>
                  )}
                </Stack>
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>

          <Divider />

          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={onClose}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={handleSave}
              loading={isSaving}
            >
              Simpan Perubahan
            </Button>
          </Group>
        </Stack>
      ) : null}
    </Modal>
  );
}
