import { useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Tabs,
  Checkbox,
  Button,
  Loader,
  Center,
  Alert,
  Badge,
  Divider,
  SegmentedControl,
  SimpleGrid,
  Box,
} from '@mantine/core';
import {
  IconMenu2,
  IconKey,
  IconAlertCircle,
  IconCheck,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { DashboardLayout } from '../../../components/dashboardlayout/dashboard.layout';
import { useDarkMode } from '../../../hooks/useDarkMode';
import { useRoleManagement } from './useRoleManagement';
import type { RoleType } from '../../../api/roles';

export default function RoleManagementPage() {
  const { COLORS, isDark } = useDarkMode();
  const {
    selectedRole,
    menus,
    permissions,
    isLoading,
    isSaving,
    error,
    success,
    hasChanges,
    menuUpdates,
    permissionUpdates,
    setSelectedRole,
    fetchRoleConfig,
    toggleMenu,
    togglePermission,
    saveAll,
    setError,
  } = useRoleManagement();

  // Fetch on mount and when role changes
  useEffect(() => {
    fetchRoleConfig(selectedRole);
  }, [selectedRole, fetchRoleConfig]);

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as RoleType);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'red';
      case 'ADMIN':
        return 'violet';
      default:
        return 'blue';
    }
  };

  // Separate menus by type
  const memberMenus = (menus || []).filter(m => !m.isAdmin);
  const adminMenus = (menus || []).filter(m => m.isAdmin);

  // Group permissions by category
  const permissionsByCategory = (permissions || [])
    .reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, typeof permissions>);

  return (
    <DashboardLayout>
      <Container size="xl" py="xl">
        {/* Header */}
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2} c={COLORS.text.primary}>
              <Group gap="xs">
                Manajemen Role
              </Group>
            </Title>
            <Text c={COLORS.text.secondary} mt="xs">
              Atur menu dan permission default untuk setiap role
            </Text>
          </div>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={saveAll}
            loading={isSaving}
            disabled={isLoading || !hasChanges}
          >
            Simpan Perubahan
          </Button>
        </Group>

        {/* Alerts */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="lg"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert icon={<IconCheck size={16} />} color="green" mb="lg" withCloseButton>
            {success}
          </Alert>
        )}

        {/* Role Selector */}
        <Paper
          p="md"
          radius="md"
          mb="lg"
          style={{
            backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Group justify="space-between" align="center">
            <div>
              <Text size="sm" fw={500} c={COLORS.text.primary}>
                Pilih Role
              </Text>
              <Text size="xs" c={COLORS.text.secondary}>
                Konfigurasi menu dan permission untuk role yang dipilih
              </Text>
            </div>
            <SegmentedControl
              value={selectedRole}
              onChange={handleRoleChange}
              data={[
                { value: 'MEMBER', label: 'Member' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'SUPERADMIN', label: 'Super Admin' },
              ]}
            />
          </Group>
        </Paper>

        {/* Current Role Info */}
        <Paper
          p="md"
          radius="md"
          mb="lg"
          style={{
            backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Group gap="md">
            <Badge color={getRoleBadgeColor(selectedRole)} size="lg" variant="light">
              {selectedRole}
            </Badge>
            <div>
              <Text size="sm" c={COLORS.text.primary}>
                {selectedRole === 'MEMBER' && 'User affiliate biasa dengan akses terbatas'}
                {selectedRole === 'ADMIN' && 'Administrator dengan akses ke fitur approval'}
                {selectedRole === 'SUPERADMIN' && 'Super Admin dengan akses penuh ke semua fitur'}
              </Text>
            </div>
          </Group>
        </Paper>

        {/* Config Content */}
        {isLoading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : (
          <Paper
            radius="md"
            style={{
              backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
              border: `1px solid ${COLORS.border}`,
              overflow: 'hidden',
            }}
          >
            <Tabs defaultValue="menus">
              <Tabs.List>
                <Tabs.Tab value="menus" leftSection={<IconMenu2 size={14} />}>
                  Menu Access ({menuUpdates.size})
                </Tabs.Tab>
                <Tabs.Tab value="permissions" leftSection={<IconKey size={14} />}>
                  Permissions ({permissionUpdates.size})
                </Tabs.Tab>
              </Tabs.List>

              {/* Menus Tab */}
              <Tabs.Panel value="menus" p="md">
                <Stack gap="lg">
                  {/* Member Menus */}
                  {memberMenus.length > 0 && (
                    <div>
                      <Text size="sm" fw={600} c={COLORS.text.primary} mb="sm">
                        Menu Member
                      </Text>
                      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="sm">
                        {memberMenus.map((menu) => (
                          <Paper
                            key={menu.menuDbId}
                            p="sm"
                            radius="sm"
                            style={{
                              backgroundColor: isDark ? COLORS.bg.tertiary : '#f8f9fa',
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <Checkbox
                              label={
                                <Box>
                                  <Text size="sm" fw={500}>{menu.label}</Text>
                                  <Text size="xs" c="dimmed">{menu.link}</Text>
                                </Box>
                              }
                              checked={menuUpdates.get(menu.menuDbId) || false}
                              onChange={() => toggleMenu(menu.menuDbId)}
                            />
                          </Paper>
                        ))}
                      </SimpleGrid>
                    </div>
                  )}

                  {/* Admin Menus */}
                  {adminMenus.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <Group gap="xs" mb="sm">
                          <Text size="sm" fw={600} c={COLORS.text.primary}>
                            Menu Admin
                          </Text>
                          <Badge size="xs" color="violet" variant="light">
                            Admin Only
                          </Badge>
                        </Group>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="sm">
                          {adminMenus.map((menu) => (
                            <Paper
                              key={menu.menuDbId}
                              p="sm"
                              radius="sm"
                              style={{
                                backgroundColor: isDark ? COLORS.bg.tertiary : '#f8f9fa',
                                border: `1px solid ${COLORS.border}`,
                                opacity: selectedRole === 'MEMBER' ? 0.5 : 1,
                              }}
                            >
                              <Checkbox
                                label={
                                  <Box>
                                    <Text size="sm" fw={500}>{menu.label}</Text>
                                    <Text size="xs" c="dimmed">{menu.link}</Text>
                                  </Box>
                                }
                                checked={menuUpdates.get(menu.menuDbId) || false}
                                onChange={() => toggleMenu(menu.menuDbId)}
                                disabled={selectedRole === 'MEMBER'}
                              />
                            </Paper>
                          ))}
                        </SimpleGrid>
                        {selectedRole === 'MEMBER' && (
                          <Text size="xs" c="dimmed" mt="sm">
                            * Menu admin tidak tersedia untuk role Member
                          </Text>
                        )}
                      </div>
                    </>
                  )}

                  {menus.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      Tidak ada menu tersedia. Silakan tambahkan menu di database.
                    </Text>
                  )}
                </Stack>
              </Tabs.Panel>

              {/* Permissions Tab */}
              <Tabs.Panel value="permissions" p="md">
                <Stack gap="lg">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category}>
                      <Group gap="xs" mb="sm">
                        <Text size="sm" fw={600} c={COLORS.text.primary} tt="capitalize">
                          {category}
                        </Text>
                        <Badge size="xs" variant="light">
                          {perms.length}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="sm">
                        {perms.map((perm) => (
                          <Paper
                            key={perm.permissionDbId}
                            p="sm"
                            radius="sm"
                            style={{
                              backgroundColor: isDark ? COLORS.bg.tertiary : '#f8f9fa',
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <Checkbox
                              label={
                                <Text size="sm">{perm.name}</Text>
                              }
                              checked={permissionUpdates.get(perm.permissionDbId) || false}
                              onChange={() => togglePermission(perm.permissionDbId)}
                            />
                          </Paper>
                        ))}
                      </SimpleGrid>
                    </div>
                  ))}

                  {permissions.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      Tidak ada permission tersedia. Silakan tambahkan permission di database.
                    </Text>
                  )}
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        )}
      </Container>
    </DashboardLayout>
  );
}
