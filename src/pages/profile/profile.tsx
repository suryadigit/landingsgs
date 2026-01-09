import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Avatar,
  Divider,
  Badge,
  Card,
  SimpleGrid,
  Loader,
  Center,
  Alert,
  Box,
} from '@mantine/core';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconEdit,
  IconCheck,
  IconX,
  IconShieldCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { DashboardLayout } from '../../components/dashboardlayout/dashboard.layout';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useProfile } from './useProfile';
import { useRole } from '../../hooks/useRole';

// Helper to get user level from localStorage
const getUserLevel = (): number => {
  try {
    const stored = localStorage.getItem('user_profile');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.level || 1;
    }
  } catch {
    // ignore
  }
  return 1;
};

// Border colors based on level/role
const getBorderStyle = (level: number, role?: string) => {
  // Admin/SuperAdmin special colors
  if (role === 'SUPERADMIN') {
    return {
      border: '4px solid transparent',
      background: 'linear-gradient(#1a1b1e, #1a1b1e) padding-box, linear-gradient(135deg, #9333EA, #EC4899, #9333EA) border-box',
      boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)',
    };
  }
  if (role === 'ADMIN') {
    return {
      border: '4px solid transparent',
      background: 'linear-gradient(#1a1b1e, #1a1b1e) padding-box, linear-gradient(135deg, #8B5CF6, #A78BFA, #8B5CF6) border-box',
      boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
    };
  }

  // Member levels
  const levelStyles: Record<number, { colors: string; shadow: string }> = {
    1: { // Bronze
      colors: 'linear-gradient(135deg, #CD853F, #DEB887, #CD853F)',
      shadow: '0 0 12px rgba(205, 133, 63, 0.4)',
    },
    2: { // Silver
      colors: 'linear-gradient(135deg, #A8A8A8, #E8E8E8, #A8A8A8)',
      shadow: '0 0 12px rgba(168, 168, 168, 0.4)',
    },
    3: { // Gold
      colors: 'linear-gradient(135deg, #FFD700, #FFF8DC, #FFD700)',
      shadow: '0 0 15px rgba(255, 215, 0, 0.5)',
    },
    4: { // Platinum
      colors: 'linear-gradient(135deg, #E5E4E2, #FFFFFF, #E5E4E2)',
      shadow: '0 0 15px rgba(229, 228, 226, 0.5)',
    },
    5: { // Emerald
      colors: 'linear-gradient(135deg, #50C878, #90EE90, #50C878)',
      shadow: '0 0 15px rgba(80, 200, 120, 0.5)',
    },
    6: { // Sapphire
      colors: 'linear-gradient(135deg, #0F52BA, #6495ED, #0F52BA)',
      shadow: '0 0 15px rgba(15, 82, 186, 0.5)',
    },
    7: { // Ruby
      colors: 'linear-gradient(135deg, #E0115F, #FF69B4, #E0115F)',
      shadow: '0 0 15px rgba(224, 17, 95, 0.5)',
    },
    8: { // Amethyst
      colors: 'linear-gradient(135deg, #9966CC, #DDA0DD, #9966CC)',
      shadow: '0 0 15px rgba(153, 102, 204, 0.5)',
    },
    9: { // Diamond
      colors: 'linear-gradient(135deg, #B9F2FF, #FFFFFF, #B9F2FF)',
      shadow: '0 0 20px rgba(185, 242, 255, 0.6)',
    },
    10: { // Legendary
      colors: 'linear-gradient(135deg, #FFD700, #FF8C00, #FF4500, #FFD700)',
      shadow: '0 0 25px rgba(255, 140, 0, 0.6)',
    },
  };

  const style = levelStyles[level] || levelStyles[1];
  return {
    border: '4px solid transparent',
    background: `linear-gradient(#1a1b1e, #1a1b1e) padding-box, ${style.colors} border-box`,
    boxShadow: style.shadow,
  };
};

// Light mode border styles
const getBorderStyleLight = (level: number, role?: string) => {
  if (role === 'SUPERADMIN') {
    return {
      border: '4px solid transparent',
      background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #9333EA, #EC4899, #9333EA) border-box',
      boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)',
    };
  }
  if (role === 'ADMIN') {
    return {
      border: '4px solid transparent',
      background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #8B5CF6, #A78BFA, #8B5CF6) border-box',
      boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
    };
  }

  const levelStyles: Record<number, { colors: string; shadow: string }> = {
    1: { colors: 'linear-gradient(135deg, #B8860B, #CD853F, #B8860B)', shadow: '0 0 12px rgba(184, 134, 11, 0.3)' },
    2: { colors: 'linear-gradient(135deg, #808080, #C0C0C0, #808080)', shadow: '0 0 12px rgba(128, 128, 128, 0.3)' },
    3: { colors: 'linear-gradient(135deg, #DAA520, #FFD700, #DAA520)', shadow: '0 0 15px rgba(218, 165, 32, 0.4)' },
    4: { colors: 'linear-gradient(135deg, #A9A9A9, #E5E4E2, #A9A9A9)', shadow: '0 0 15px rgba(169, 169, 169, 0.4)' },
    5: { colors: 'linear-gradient(135deg, #228B22, #50C878, #228B22)', shadow: '0 0 15px rgba(34, 139, 34, 0.4)' },
    6: { colors: 'linear-gradient(135deg, #000080, #0F52BA, #000080)', shadow: '0 0 15px rgba(0, 0, 128, 0.4)' },
    7: { colors: 'linear-gradient(135deg, #8B0000, #E0115F, #8B0000)', shadow: '0 0 15px rgba(139, 0, 0, 0.4)' },
    8: { colors: 'linear-gradient(135deg, #4B0082, #9966CC, #4B0082)', shadow: '0 0 15px rgba(75, 0, 130, 0.4)' },
    9: { colors: 'linear-gradient(135deg, #00BFFF, #B9F2FF, #00BFFF)', shadow: '0 0 20px rgba(0, 191, 255, 0.4)' },
    10: { colors: 'linear-gradient(135deg, #FF8C00, #FFD700, #FF4500)', shadow: '0 0 25px rgba(255, 140, 0, 0.4)' },
  };

  const style = levelStyles[level] || levelStyles[1];
  return {
    border: '4px solid transparent',
    background: `linear-gradient(#ffffff, #ffffff) padding-box, ${style.colors} border-box`,
    boxShadow: style.shadow,
  };
};

export default function ProfilePage() {
  const { COLORS, isDark } = useDarkMode();
  const { hasPermission } = useRole();
  const userLevel = getUserLevel();
  const {
    profile,
    isLoading,
    isEditing,
    isSaving,
    error,
    success,
    fullName,
    phone,
    setFullName,
    setPhone,
    setError,
    setSuccess,
    startEditing,
    handleSave,
    handleCancel,
    formatDate,
  } = useProfile();

  if (isLoading) {
    return (
      <DashboardLayout>
        <Center h="60vh">
          <Loader size="lg" />
        </Center>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container size="lg" py="xl">
        <Title order={2} mb="xs" c={COLORS.text.primary}>
          Profil
        </Title>
        <Text c={COLORS.text.secondary} mb="xl">
          Kelola informasi profil Anda
        </Text>

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
          <Alert 
            icon={<IconCheck size={16} />} 
            color="green" 
            mb="lg"
            withCloseButton
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {/* Profile Card */}
          <Paper
            p="xl"
            radius="md"
            style={{
              backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <Stack align="center" mb="lg">
              {/* Avatar with Level/Role border */}
              <Box 
                style={{ 
                  position: 'relative', 
                  display: 'inline-block',
                  borderRadius: '50%',
                  padding: 2,
                  ...(isDark 
                    ? getBorderStyle(userLevel, profile?.role) 
                    : getBorderStyleLight(userLevel, profile?.role)
                  ),
                }}
              >
                <Avatar
                  size={100}
                  radius={100}
                  color="blue"
                  style={{
                    border: 'none',
                  }}
                >
                  <IconUser size={50} />
                </Avatar>
              </Box>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={600} c={COLORS.text.primary}>
                  {profile?.fullName || 'Nama belum diisi'}
                </Text>
                <Text size="sm" c={COLORS.text.secondary}>
                  {profile?.email}
                </Text>
                <Badge
                  mt="xs"
                  color={profile?.role === 'ADMIN' || profile?.role === 'SUPERADMIN' ? 'violet' : 'blue'}
                  variant="light"
                >
                  {profile?.role || 'MEMBER'}
                </Badge>
              </div>
            </Stack>

            <Divider my="md" />

            {/* Verification Status */}
            <Stack gap="sm">
              <Group gap="xs">
                <IconShieldCheck
                  size={18}
                  color={profile?.isEmailVerified ? '#22c55e' : '#ef4444'}
                />
                <Text size="sm" c={COLORS.text.secondary}>
                  Email: {profile?.isEmailVerified ? 'Terverifikasi' : 'Belum terverifikasi'}
                </Text>
              </Group>
              <Group gap="xs">
                <IconShieldCheck
                  size={18}
                  color={profile?.isPhoneVerified ? '#22c55e' : '#ef4444'}
                />
                <Text size="sm" c={COLORS.text.secondary}>
                  Telepon: {profile?.isPhoneVerified ? 'Terverifikasi' : 'Belum terverifikasi'}
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* Edit Profile Card */}
          <Paper
            p="xl"
            radius="md"
            style={{
              backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <Group justify="space-between" mb="lg">
              <Title order={4} c={COLORS.text.primary}>
                Informasi Pribadi
              </Title>
              {!isEditing && hasPermission('edit_profile') && (
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconEdit size={14} />}
                  onClick={startEditing}
                >
                  Edit
                </Button>
              )}
            </Group>

            <Stack gap="md">
              <TextInput
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                leftSection={<IconUser size={16} />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                styles={{
                  input: {
                    backgroundColor: isEditing ? undefined : (isDark ? COLORS.bg.tertiary : '#f8f9fa'),
                  },
                }}
              />

              <TextInput
                label="Email"
                leftSection={<IconMail size={16} />}
                value={profile?.email || ''}
                disabled
                styles={{
                  input: {
                    backgroundColor: isDark ? COLORS.bg.tertiary : '#f8f9fa',
                  },
                }}
              />

              <TextInput
                label="Nomor Telepon"
                placeholder="Contoh: 081234567890"
                leftSection={<IconPhone size={16} />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                styles={{
                  input: {
                    backgroundColor: isEditing ? undefined : (isDark ? COLORS.bg.tertiary : '#f8f9fa'),
                  },
                }}
              />

              {isEditing && (
                <Group justify="flex-end" mt="md">
                  <Button
                    variant="subtle"
                    color="gray"
                    leftSection={<IconX size={16} />}
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Batal
                  </Button>
                  <Button
                    leftSection={<IconCheck size={16} />}
                    onClick={handleSave}
                    loading={isSaving}
                  >
                    Simpan
                  </Button>
                </Group>
              )}
            </Stack>
          </Paper>
        </SimpleGrid>

        {/* Account Info */}
        <Card
          mt="lg"
          p="lg"
          radius="md"
          style={{
            backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Title order={4} c={COLORS.text.primary} mb="md">
            Informasi Akun
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Group gap="xs">
              <IconCalendar size={18} color={COLORS.text.secondary} />
              <Text size="sm" c={COLORS.text.secondary}>
                Bergabung: {profile?.createdAt ? formatDate(profile.createdAt) : '-'}
              </Text>
            </Group>
            <Group gap="xs">
              <IconCalendar size={18} color={COLORS.text.secondary} />
              <Text size="sm" c={COLORS.text.secondary}>
                Terakhir diperbarui: {profile?.updatedAt ? formatDate(profile.updatedAt) : '-'}
              </Text>
            </Group>
          </SimpleGrid>
        </Card>
      </Container>
    </DashboardLayout>
  );
}
