import {
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
  Center,
  Alert,
  Box,
  Modal,
  PinInput,
  Skeleton,
  Container,
  Grid,
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
  IconBrandWhatsapp,
  IconCashBanknoteFilled,
  IconHome,
} from '@tabler/icons-react';
import { DashboardLayout } from '../../../components/dashboardlayout/dashboard.layout';
import { useDarkMode } from '../../../shared/hooks';
import { useProfile } from '../hooks/useProfile';
import { getBorderStyle, getBorderStyleLight } from '../customLevelProfile';

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



export default function ProfilePage() {
  const { COLORS, isDark } = useDarkMode();
  const userLevel = getUserLevel();
  const {
    profile,
    isLoading,
    isEditing,
    isSaving,
    error,
    success,
    fullName,
    bank,
    alamat,
    phone,
    showOtpModal,
    otpCode,
    isRequestingOtp,
    isVerifyingOtp,
    otpCountdown,
    pendingPhone,
    setBank,
    setAlamat,
    setFullName,
    setPhone,
    setError,
    setSuccess,
    startEditing,
    handleSave,
    handleCancel,
    formatDate,
    setOtpCode,
    closeOtpModal,
    resendOtp,
    verifyOtp,
  } = useProfile();

  if (isLoading) {
    return (
      <DashboardLayout>
        <Container size="xl">
          <Stack gap="xl" py={16}>
            <Skeleton height={28} width={220} radius="sm" />
            <Skeleton height={14} width={300} radius="sm" />

            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 6 }}><Skeleton height={260} radius="md" /></Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}><Skeleton height={260} radius="md" /></Grid.Col>
            </Grid>

            <Skeleton height={140} radius="md" />
          </Stack>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box
        style={{
          paddingInlineStart: '10px',
          backgroundColor: COLORS.bg.primary,
          minHeight: '100vh',
        }}
      >
        <Container size="xl">
          <Title order={2} mb={4} c={isDark ? COLORS.text.light : COLORS.text.dark} style={{ fontSize: 22 }}>
            Profil
          </Title>
          <Text c={COLORS.text.secondary} mb="md">
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
                  <Text size="xl" fw={600} c={isDark ? COLORS.text.light : COLORS.text.dark}>
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
                <Title order={4} c={isDark ? COLORS.text.light : COLORS.text.dark}>
                  Informasi Pribadi
                </Title>
                {!isEditing && (
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

              
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <TextInput
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap"
                    leftSection={<IconUser size={16} />}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    styles={{
                      input: {
                        backgroundColor: isEditing ? undefined : (isDark ? COLORS.bg.secondary : '#f8f9fa'),
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
                        backgroundColor: isDark ? COLORS.bg.secondary : '#f8f9fa',
                      },
                    }}
                  />

                  <TextInput
                    label="Bank"
                    placeholder="Masukkan No Rekening bank anda"
                    leftSection={<IconCashBanknoteFilled size={16} />}
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    disabled={!isEditing}
                    styles={{
                      input: {
                        backgroundColor: isDark ? COLORS.bg.secondary : '#f8f9fa',
                      },
                    }}
                  />

                  <TextInput
                    label="Alamat"
                    placeholder="Masukkan Alamat anda"
                    leftSection={<IconHome size={16} />}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    disabled={!isEditing}
                    styles={{
                      input: {
                        backgroundColor: isDark ? COLORS.bg.secondary : '#f8f9fa',
                      },
                    }}
                  />
                </SimpleGrid>

                {isEditing ? (
                  <Box>
                    <Text size="sm" fw={500} mb={4}>
                      Nomor WhatsApp <Text component="span" c="red">*</Text>
                    </Text>
                    <Group gap="sm" align="flex-start">
                      <TextInput
                        placeholder="08123456789"
                        leftSection={<IconPhone size={16} />}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        variant="light"
                        onClick={handleSave}
                        loading={isSaving || isRequestingOtp}
                        disabled={!phone.trim() || phone.trim() === (profile?.phone || '')}
                      >
                        Send OTP
                      </Button>
                    </Group>
                    <Text size="xs" c={COLORS.text.tertiary} mt={6}>
                      <IconBrandWhatsapp size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      OTP akan dikirim ke nomor WhatsApp ini
                    </Text>
                  </Box>
                ) : (
                  <TextInput
                    label="Nomor Telepon"
                    placeholder="Contoh: 081234567890"
                    leftSection={<IconPhone size={16} />}
                    value={phone}
                    disabled
                    styles={{
                      input: {
                        backgroundColor: isDark ? COLORS.bg.secondary : '#f8f9fa',
                      },
                    }}
                  />
                )}

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
                      disabled={
                        isSaving ||
                        phone.trim() !== (profile?.phone || '') ||
                        (
                          fullName.trim() === (profile?.fullName || '') &&
                          bank.trim() === (profile?.bank || '') &&
                          alamat.trim() === (profile?.alamat || '')
                        )
                      }
                    >
                      Simpan
                    </Button>
                  </Group>
                )}
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
            <Title order={4} c={isDark ? COLORS.text.light : COLORS.text.dark} mb="md">
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

        {/* OTP Verification Modal */}
        <Modal
          opened={showOtpModal}
          onClose={closeOtpModal}
          title={
            <Group gap="xs">
              <IconBrandWhatsapp size={24} color="#25D366" />
              <Text fw={600}>Verifikasi Nomor Telepon</Text>
            </Group>
          }
          centered
          size="sm"
          styles={{
            content: {
              backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
            },
            header: {
              backgroundColor: isDark ? COLORS.bg.secondary : '#ffffff',
            },
          }}
        >
          <Stack gap="md">
            <Alert 
              icon={<IconBrandWhatsapp size={18} />} 
              color="green" 
              variant="light"
            >
              Kode OTP telah dikirim ke WhatsApp <strong>{pendingPhone}</strong>
            </Alert>

            <Text size="sm" c={COLORS.text.secondary} ta="center">
              Masukkan kode 6 digit yang dikirim ke WhatsApp Anda
            </Text>

            <Center>
              <PinInput
                length={6}
                type="number"
                value={otpCode}
                onChange={setOtpCode}
                size="lg"
                oneTimeCode
                styles={{
                  input: {
                    backgroundColor: isDark ? COLORS.bg.secondary : '#f8f9fa',
                    color: isDark ? COLORS.text.light : COLORS.text.dark,
                    borderColor: COLORS.border,
                  },
                }}
              />
            </Center>

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              onClick={verifyOtp}
              loading={isVerifyingOtp}
              disabled={otpCode.length < 6}
              leftSection={<IconCheck size={18} />}
            >
              Verifikasi & Simpan
            </Button>

            <Group justify="center" gap="xs">
              <Text size="sm" c={COLORS.text.secondary}>
                Tidak menerima kode?
              </Text>
              {otpCountdown > 0 ? (
                <Text size="sm" c={COLORS.text.tertiary}>
                  Kirim ulang dalam {otpCountdown}s
                </Text>
              ) : (
                <Button 
                  variant="subtle" 
                  size="xs" 
                  onClick={resendOtp}
                  loading={isRequestingOtp}
                >
                  Kirim Ulang
                </Button>
              )}
            </Group>

            <Button
              variant="subtle"
              color="gray"
              onClick={closeOtpModal}
            >
              Batal
            </Button>
          </Stack>
        </Modal>
      </Box>
    </DashboardLayout>
  );
}
