import {
  Container,
  Title,
  Text,
  Paper,
  Table,
  TextInput,
  Select,
  Group,
  Badge,
  Loader,
  Center,
  Alert,
  Pagination,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconSearch,
  IconSettings,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { DashboardLayout } from '../../../components/dashboardlayout/dashboard.layout';
import { useDarkMode } from '../../../shared/hooks';
import { useUserManagement } from './useUserManagement';
import { UserAccessModal } from './UserAccessModal';

export default function UserManagementPage() {
  const { COLORS, isDark } = useDarkMode();
  const {
    users,
    isLoadingUsers,
    pagination,
    selectedUser,
    isLoadingDetail,
    availableMenus,
    availablePermissions,
    isDetailModalOpen,
    isSaving,
    error,
    success,
    searchQuery,
    roleFilter,
    setSearchQuery,
    setRoleFilter,
    setPage,
    openUserDetail,
    closeDetailModal,
    updateUser,
    setError,
  } = useUserManagement();

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

  const getAffiliateStatus = (user: typeof users[0]) => {
    if (!user.affiliateProfile) {
      return { isActive: false, label: 'No Profile' };
    }
    const status = user.affiliateProfile.status;
    return {
      isActive: status === 'ACTIVE',
      label: status,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <Container size="xl" py="xl">
        {/* Header */}
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2} c={COLORS.text.primary}>
              <Group gap="xs">
                Manajemen User
              </Group>
            </Title>
            <Text c={COLORS.text.secondary} mt="xs">
              Kelola role dan akses menu untuk setiap user
            </Text>
          </div>
        </Group>

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
          <Alert
            icon={<IconCheck size={16} />}
            color="green"
            mb="lg"
            withCloseButton
          >
            {success}
          </Alert>
        )}

        <Paper
          p="md"
          radius="md"
          mb="lg"
          style={{
            backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Group>
            <TextInput
              placeholder="Cari nama atau email..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter Role"
              clearable
              value={roleFilter}
              onChange={(value) => setRoleFilter(value || '')}
              data={[
                { value: 'MEMBER', label: 'Member' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'SUPERADMIN', label: 'Super Admin' },
              ]}
              w={150}
            />
          </Group>
        </Paper>

        <Paper
          radius="md"
          style={{
            backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
            border: `1px solid ${COLORS.border}`,
            overflow: 'hidden',
          }}
        >
          {isLoadingUsers ? (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          ) : users.length === 0 ? (
            <Center py="xl">
              <Text c={COLORS.text.secondary}>Tidak ada user ditemukan</Text>
            </Center>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Verifikasi</Table.Th>
                    <Table.Th>Bergabung</Table.Th>
                    <Table.Th style={{ width: 80 }}>Aksi</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((user) => {
                    const affiliateStatus = getAffiliateStatus(user);
                    return (
                    <Table.Tr key={user.id}>
                      <Table.Td>
                        <div>
                          <Text size="sm" fw={500} c={COLORS.text.primary}>
                            {user.fullName || 'Nama belum diisi'}
                          </Text>
                          <Text size="xs" c={COLORS.text.secondary}>
                            {user.email}
                          </Text>
                          {user.affiliateProfile && (
                            <Text size="xs" c="dimmed">
                              Code: {user.affiliateProfile.code}
                            </Text>
                          )}
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getRoleBadgeColor(user.role)}
                          variant="light"
                        >
                          {user.role}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={affiliateStatus.isActive ? 'green' : 'red'}
                          variant="dot"
                        >
                          {affiliateStatus.label}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4}>
                          <Tooltip label={user.isEmailVerified ? 'Email terverifikasi' : 'Email belum verifikasi'}>
                            <Badge
                              size="xs"
                              color={user.isEmailVerified ? 'green' : 'gray'}
                              variant="light"
                            >
                              Email
                            </Badge>
                          </Tooltip>
                          <Tooltip label={user.isPhoneVerified ? 'Phone terverifikasi' : 'Phone belum verifikasi'}>
                            <Badge
                              size="xs"
                              color={user.isPhoneVerified ? 'green' : 'gray'}
                              variant="light"
                            >
                              Phone
                            </Badge>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={COLORS.text.secondary}>
                          {formatDate(user.createdAt)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Tooltip label="Kelola Akses">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => openUserDetail(user.id)}
                          >
                            <IconSettings size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  );
                  })}
                </Table.Tbody>
              </Table>

              {pagination.totalPages > 1 && (
                <Group justify="center" py="md">
                  <Pagination
                    value={pagination.page}
                    onChange={setPage}
                    total={pagination.totalPages}
                  />
                </Group>
              )}
            </>
          )}
        </Paper>

        <UserAccessModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          user={selectedUser}
          isLoading={isLoadingDetail}
          isSaving={isSaving}
          availableMenus={availableMenus}
          availablePermissions={availablePermissions}
          onSave={updateUser}
          error={error}
        />
      </Container>
    </DashboardLayout>
  );
}
