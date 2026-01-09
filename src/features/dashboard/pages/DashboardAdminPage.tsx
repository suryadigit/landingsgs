import {
  Box,
  Container,
  Grid,
  Group,
  Text,
  Title,
  Card,
  ThemeIcon,
  useMantineColorScheme,
  Loader,
  Center,
  Alert,
  Badge,
  Progress,
  SimpleGrid,
} from '@mantine/core';
import {
  IconUsers,
  IconCash,
  IconReceipt,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconTrendingUp,
  IconUserCheck,
  IconCoins,
} from '@tabler/icons-react';
import { DashboardLayout } from '../../../components/dashboardlayout/dashboard.layout';
import { COLORS } from '../../../shared/types';
import { useAuth } from '../../auth';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  bgGradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, bgGradient }) => (
  <Card shadow="sm" padding="lg" radius="lg" style={{ background: bgGradient, border: 'none', minHeight: 140 }}>
    <Group justify="space-between" align="flex-start">
      <Box>
        <Text size="xs" tt="uppercase" fw={600} style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: 1 }}>
          {title}
        </Text>
        <Text size="xl" fw={700} style={{ color: '#ffffff', fontSize: 28, marginTop: 8 }}>
          {value}
        </Text>
        {subtitle && (
          <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            {subtitle}
          </Text>
        )}
      </Box>
      <ThemeIcon size={48} radius="xl" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
        {icon}
      </ThemeIcon>
    </Group>
  </Card>
);

interface ApprovalItemProps {
  label: string;
  count: number;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  dark: boolean;
}

const ApprovalItem: React.FC<ApprovalItemProps> = ({ label, count, amount, status, dark }) => (
  <Box
    style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
      marginBottom: 12,
    }}
  >
    <Group justify="space-between" align="center">
      <Box>
        <Text fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
          {label}
        </Text>
        <Text size="sm" style={{ color: COLORS.text.tertiary }}>
          {count} items • {amount}
        </Text>
      </Box>
      <Badge color={status === 'pending' ? 'yellow' : status === 'approved' ? 'green' : 'red'} variant="light">
        {status.toUpperCase()}
      </Badge>
    </Group>
  </Box>
);

const DashboardAdminPage: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const { user } = useAuth();

  const { isLoading, error, stats, pendingApprovals, recentActivity } = useAdminDashboard();

  const bgColor = dark ? '#0d0d0d' : '#f8f9fa';
  const cardBg = dark ? '#1a1a1a' : '#ffffff';

  const content = (
    <Box style={{ backgroundColor: bgColor, minHeight: '100vh', padding: '40px 0' }}>
      {isLoading && (
        <Center style={{ minHeight: '100vh' }}>
          <Loader />
        </Center>
      )}

      {error && !isLoading && (
        <Container size="xl">
          <Alert icon={<IconAlertTriangle />} title="Error" color="red" mb={24}>
            {error}
          </Alert>
        </Container>
      )}

      {!isLoading && (
        <Container size="xl">
          <Group justify="space-between" align="center" mb={32}>
            <Box>
              <Title order={1} style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 32, fontWeight: 700 }}>
                Admin Dashboard
              </Title>
              <Text style={{ color: COLORS.text.tertiary, marginTop: 8 }}>Kelola dan monitor sistem affiliate</Text>
            </Box>
            <Badge size="lg" variant="gradient" gradient={{ from: 'violet', to: 'grape' }} leftSection={<IconUserCheck size={14} />}>
              {user?.role || 'ADMIN'}
            </Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb={32}>
            <StatCard
              title="Total Member"
              value={stats.totalMembers}
              subtitle="Active affiliates"
              icon={<IconUsers size={24} />}
              bgGradient="linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)"
            />
            <StatCard
              title="Total Omset"
              value={`Rp ${stats.totalOmset.toLocaleString('id-ID')}`}
              subtitle="All time revenue"
              icon={<IconCash size={24} />}
              bgGradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
            />
            <StatCard
              title="Pending Approval"
              value={stats.pendingApprovals}
              subtitle="Menunggu persetujuan"
              icon={<IconClock size={24} />}
              bgGradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
            />
            <StatCard
              title="Komisi Dibayar"
              value={`Rp ${stats.totalCommissionPaid.toLocaleString('id-ID')}`}
              subtitle="Total paid out"
              icon={<IconCoins size={24} />}
              bgGradient="linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
            />
          </SimpleGrid>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="lg"
                style={{ backgroundColor: cardBg, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` }}
              >
                <Group justify="space-between" mb={16}>
                  <Title order={4} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
                    Pending Approvals
                  </Title>
                  <Badge color="yellow" variant="light">
                    {pendingApprovals.length} items
                  </Badge>
                </Group>

                {pendingApprovals.length === 0 ? (
                  <Center py={40}>
                    <Box ta="center">
                      <IconCheck size={48} color="#10b981" />
                      <Text mt={16} style={{ color: COLORS.text.tertiary }}>
                        Tidak ada pending approval
                      </Text>
                    </Box>
                  </Center>
                ) : (
                  pendingApprovals.map((item, index) => (
                    <ApprovalItem key={index} label={item.label} count={item.count} amount={item.amount} status={item.status} dark={dark} />
                  ))
                )}
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="lg"
                style={{ backgroundColor: cardBg, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` }}
              >
                <Title order={4} mb={16} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
                  Statistik Cepat
                </Title>

                <Box mb={20}>
                  <Group justify="space-between" mb={8}>
                    <Text size="sm" style={{ color: COLORS.text.tertiary }}>
                      Member Aktif
                    </Text>
                    <Text size="sm" fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
                      {stats.activeMembers}/{stats.totalMembers}
                    </Text>
                  </Group>
                  <Progress value={(stats.activeMembers / stats.totalMembers) * 100 || 0} color="green" size="md" radius="xl" />
                </Box>

                <Box mb={20}>
                  <Group justify="space-between" mb={8}>
                    <Text size="sm" style={{ color: COLORS.text.tertiary }}>
                      Approval Rate
                    </Text>
                    <Text size="sm" fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
                      {stats.approvalRate}%
                    </Text>
                  </Group>
                  <Progress value={stats.approvalRate} color="blue" size="md" radius="xl" />
                </Box>

                <Box mb={20}>
                  <Group justify="space-between" mb={8}>
                    <Text size="sm" style={{ color: COLORS.text.tertiary }}>
                      Target Bulanan
                    </Text>
                    <Text size="sm" fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
                      {stats.monthlyTargetProgress}%
                    </Text>
                  </Group>
                  <Progress value={stats.monthlyTargetProgress} color="violet" size="md" radius="xl" />
                </Box>
              </Card>

              <Card
                shadow="sm"
                padding="lg"
                radius="lg"
                mt={16}
                style={{ backgroundColor: cardBg, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` }}
              >
                <Title order={4} mb={16} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
                  Aktivitas Terbaru
                </Title>

                {recentActivity.map((activity, index) => (
                  <Group
                    key={index}
                    mb={12}
                    style={{ padding: 12, borderRadius: 8, backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  >
                    <ThemeIcon
                      size={32}
                      radius="xl"
                      color={activity.type === 'approval' ? 'green' : activity.type === 'withdrawal' ? 'blue' : 'violet'}
                      variant="light"
                    >
                      {activity.type === 'approval' ? (
                        <IconCheck size={16} />
                      ) : activity.type === 'withdrawal' ? (
                        <IconReceipt size={16} />
                      ) : (
                        <IconTrendingUp size={16} />
                      )}
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={500} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
                        {activity.title}
                      </Text>
                      <Text size="xs" style={{ color: COLORS.text.tertiary }}>
                        {activity.time}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      )}
    </Box>
  );

  return <DashboardLayout>{content}</DashboardLayout>;
};

export default DashboardAdminPage;
