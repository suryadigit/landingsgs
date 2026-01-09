import React from 'react';
import {
  Box,
  Container,
  Group,
  Text,
  Title,
  TextInput,
  Select,
  Table,
  Badge,
  ActionIcon,
  Center,
  Stack,
  Grid,
  ThemeIcon,
  useMantineColorScheme,
  Loader,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconSearch,
  IconReceipt,
  IconFileText,
  IconEye,
  IconClock,
  IconCreditCard,
} from '@tabler/icons-react';
import { DashboardLayout } from '../../components/dashboardlayout/dashboard.layout';
import { COLORS } from '../../types/colors';
import { useCommission } from './useCommission';
import { Pagination } from '../../components/common';

interface Commission {
  id: string;
  transactionId: string;
  from: string;
  level: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
}

const CommissionPage: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const dark = colorScheme === "dark";

  const {
    filteredCommissions,
    isLoading,
    error,
    searchValue,
    setSearchValue,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    totalItems,
    getStatusColor,
    getStatusBg,
    getStatusIcon,
    pendingAmount,
    approvedAmount,
  } = useCommission();

  // Helper function to render icon component
  const renderStatusIcon = (status: string) => {
    const IconComponent = getStatusIcon(status);
    if (!IconComponent) return null;
    return <IconComponent size={16} />;
  };

  const content = (
    <Box style={{ backgroundColor: dark ? "#0d0d0d" : COLORS.bg.primary, minHeight: '100vh', padding: '40px 0' }}>
      <Container size="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start" mb={32}>
          <Box>
            <Title
              order={1}
              style={{
                color: dark ? "#ffffff" : COLORS.text.dark,
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              Riwayat Komisi
            </Title>
            <Text
              style={{
                color: dark ? "#a1a1a1" : COLORS.text.tertiary,
                fontSize: 14,
                marginTop: 4,
              }}
            >
              Lacak semua penghasilan komisi Anda
            </Text>
          </Box>
          <ActionIcon
            size={40}
            radius={8}
            style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              color: '#d4af37',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
            }}
          >
            <IconFileText size={20} />
          </ActionIcon>
        </Group>

        {/* Stats Cards */}
        <Grid gutter="lg" mb={32}>
          {/* Pending */}
          <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
            <Box
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                border: '1px solid #f97316',
                borderRadius: 12,
                padding: 20,
                transition: 'all 0.2s ease',
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Text
                    style={{
                      color: '#f97316',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    PENDING (Menunggu Approval)
                  </Text>
                  <Text
                    style={{
                      color: '#f97316',
                      fontSize: 24,
                      fontWeight: 700,
                      marginTop: 8,
                    }}
                  >
                    Rp {pendingAmount.toLocaleString('id-ID')}
                  </Text>
                </Box>
                <ThemeIcon
                  size={48}
                  radius={8}
                  style={{
                    backgroundColor: '#f97316',
                    color: 'white',
                  }}
                >
                  <IconClock size={24} />
                </ThemeIcon>
              </Group>
            </Box>
          </Grid.Col>

          {/* Approved */}
          <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
            <Box
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid #10b981',
                borderRadius: 12,
                padding: 20,
                transition: 'all 0.2s ease',
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Text
                    style={{
                      color: '#10b981',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    APPROVED (Siap Dicairkan)
                  </Text>
                  <Text
                    style={{
                      color: '#10b981',
                      fontSize: 24,
                      fontWeight: 700,
                      marginTop: 8,
                    }}
                  >
                    Rp {approvedAmount.toLocaleString('id-ID')}
                  </Text>
                </Box>
                <ThemeIcon
                  size={48}
                  radius={8}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                  }}
                >
                  <IconCreditCard size={24} />
                </ThemeIcon>
              </Group>
            </Box>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Box
          style={{
            backgroundColor: dark ? "#1a1a1a" : "#ffffff",
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Group grow>
            <TextInput
              placeholder="Cari berdasarkan ID Transaksi atau Dari..."
              leftSection={<IconSearch size={16} />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.currentTarget.value)}
              styles={{
                input: {
                  backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  border: `1px solid ${COLORS.border}`,
                  color: dark ? "#ffffff" : COLORS.text.dark,
                  '&::placeholder': {
                    color: COLORS.text.tertiary,
                  },
                },
              }}
            />

            <Select
              placeholder="Filter berdasarkan status"
              data={[
                { value: 'ALL', label: 'All Status' },
                { value: 'PENDING', label: 'Pending (Menunggu Review)' },
                { value: 'APPROVED', label: 'Approved (Siap Dicairkan)' },
                { value: 'PAID', label: 'Paid (Sudah Dicairkan)' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              searchable
              styles={{
                input: {
                  backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  border: `1px solid ${COLORS.border}`,
                  color: dark ? "#ffffff" : COLORS.text.dark,
                },
                option: {
                  color: COLORS.text.dark,
                },
              }}
            />
          </Group>
        </Box>
        {/* Loading State */}
        {isLoading && (
          <Center style={{ padding: '60px 20px' }}>
            <Stack gap={12} align="center">
              <Loader />
              <Text style={{ color: dark ? "#a1a1a1" : COLORS.text.tertiary }}>
                Loading commissions...
              </Text>
            </Stack>
          </Center>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Box
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <Text style={{ color: '#ef4444', fontWeight: 500 }}>
              Error: {error}
            </Text>
          </Box>
        )}
        {/* Error state removed - no error handling needed */}

        {/* Desktop Table View */}
        {!isMobile && !isLoading && (
          <Box
            style={{
              backgroundColor: dark ? "#1a1a1a" : "#ffffff",
              borderRadius: 12,
              border: `1px solid ${COLORS.border}`,
              overflow: 'auto',
            }}
          >
            <Table striped style={{ minWidth: 900 }}>
              <Table.Thead
                style={{
                  backgroundColor: dark ? "#0d0d0d" : "rgba(59, 130, 246, 0.05)",
                  position: 'sticky',
                  top: 0,
                }}
              >
                <Table.Tr>
                  <Table.Th style={{ color: dark ? "#ffffff" : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    TRANSACTION ID
                  </Table.Th>
                  <Table.Th style={{ color: dark ? "#ffffff" : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    FROM
                  </Table.Th>
                  <Table.Th style={{ color: dark ? "#ffffff" : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    LEVEL
                  </Table.Th>
                  <Table.Th style={{ color: dark ? "#ffffff" : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    AMOUNT
                  </Table.Th>
                  <Table.Th style={{ color: dark ? "#ffffff" : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    STATUS
                  </Table.Th>
                  <Table.Th style={{ color: dark ? "#ffffff" : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    DATE
                  </Table.Th>
                  <Table.Th style={{ color: dark ? "#ffffff" : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center' }}>
                    ACTION
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {filteredCommissions.length > 0 ? (
                  filteredCommissions.map((commission: Commission) => (
                    <Table.Tr key={commission.id}>
                      <Table.Td>
                        <Text size="sm" style={{ color: dark ? "#ffffff" : COLORS.text.dark, whiteSpace: 'nowrap' }}>
                          {commission.transactionId}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text size="sm" style={{ color: dark ? "#ffffff" : COLORS.text.dark, whiteSpace: 'nowrap' }}>
                          {commission.from}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text size="sm" style={{ color: dark ? "#ffffff" : COLORS.text.dark, whiteSpace: 'nowrap' }}>
                          Level {commission.level}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text
                          size="sm"
                          fw={600}
                          style={{ color: '#10b981', whiteSpace: 'nowrap' }}
                        >
                          Rp {commission.amount.toLocaleString('id-ID')}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Badge
                          leftSection={renderStatusIcon(commission.status)}
                          style={{
                            backgroundColor: getStatusBg(commission.status),
                            color: getStatusColor(commission.status),
                            fontWeight: 600,
                            border: `1px solid ${getStatusColor(commission.status)}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {commission.status}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        <Text size="sm" style={{ color: dark ? "#a1a1a1" : COLORS.text.tertiary, whiteSpace: 'nowrap' }}>
                          {new Date(commission.createdAt).toLocaleDateString('id-ID')}
                        </Text>
                      </Table.Td>

                      <Table.Td style={{ textAlign: 'center' }}>
                        <ActionIcon
                          size="sm"
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: COLORS.accent.primary,
                          }}
                        >
                          <IconEye size={14} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Center style={{ padding: '60px 20px' }}>
                        <Stack gap={12} align="center">
                          <IconReceipt size={48} color={dark ? "#a1a1a1" : COLORS.text.tertiary} />
                          <Text style={{ color: dark ? "#a1a1a1" : COLORS.text.tertiary, fontSize: 16 }}>
                            No commissions found
                          </Text>
                        </Stack>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Box>
        )}

        {/* Mobile Card View */}
        {isMobile && !isLoading && (
          <Stack gap="md">
            {filteredCommissions.length > 0 ? (
              filteredCommissions.map((commission: Commission) => (
                <Box
                  key={commission.id}
                  style={{
                    backgroundColor: dark ? "#1a1a1a" : "#ffffff",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <Group justify="space-between" align="flex-start" mb={12}>
                    <Box>
                      <Text size="xs" style={{ color: COLORS.text.tertiary, fontWeight: 700, letterSpacing: 1 }}>
                        TRANSACTION ID
                      </Text>
                      <Text size="sm" fw={600} style={{ color: dark ? "#ffffff" : COLORS.text.dark, marginTop: 4 }}>
                        {commission.transactionId}
                      </Text>
                    </Box>
                    <Badge
                      leftSection={renderStatusIcon(commission.status)}
                      style={{
                        backgroundColor: getStatusBg(commission.status),
                        color: getStatusColor(commission.status),
                        fontWeight: 600,
                        border: `1px solid ${getStatusColor(commission.status)}`,
                      }}
                    >
                      {commission.status}
                    </Badge>
                  </Group>

                  <Stack gap={12}>
                    <Box>
                      <Text size="xs" style={{ color: COLORS.text.tertiary, fontWeight: 700, letterSpacing: 1 }}>
                        FROM
                      </Text>
                      <Text size="sm" style={{ color: dark ? "#ffffff" : COLORS.text.dark, marginTop: 4 }}>
                        {commission.from}
                      </Text>
                    </Box>

                    <Group grow>
                      <Box>
                        <Text size="xs" style={{ color: COLORS.text.tertiary, fontWeight: 700, letterSpacing: 1 }}>
                          LEVEL
                        </Text>
                        <Text size="sm" style={{ color: dark ? "#ffffff" : COLORS.text.dark, marginTop: 4 }}>
                          Level {commission.level}
                        </Text>
                      </Box>
                    </Group>

                    <Box
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid #10b981',
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <Text size="xs" style={{ color: COLORS.text.tertiary, fontWeight: 700, letterSpacing: 1 }}>
                        AMOUNT
                      </Text>
                      <Text size="md" fw={700} style={{ color: '#10b981', marginTop: 6 }}>
                        Rp {commission.amount.toLocaleString('id-ID')}
                      </Text>
                    </Box>

                    <Box>
                      <Text size="xs" style={{ color: COLORS.text.tertiary, fontWeight: 700, letterSpacing: 1 }}>
                        DATE
                      </Text>
                      <Text size="sm" style={{ color: dark ? "#a1a1a1" : COLORS.text.tertiary, marginTop: 4 }}>
                        {new Date(commission.createdAt).toLocaleDateString('id-ID')}
                      </Text>
                    </Box>

                    <Group justify="flex-end">
                      <ActionIcon
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: COLORS.accent.primary,
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Box>
              ))
            ) : (
              <Center style={{ padding: '60px 20px' }}>
                <Stack gap={12} align="center">
                  <IconReceipt size={48} color={dark ? "#a1a1a1" : COLORS.text.tertiary} />
                  <Text style={{ color: dark ? "#a1a1a1" : COLORS.text.tertiary, fontSize: 16 }}>
                    No commissions found
                  </Text>
                </Stack>
              </Center>
            )}
          </Stack>
        )}

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            dark={dark}
            isMobile={isMobile ?? false}
          />
        )}
      </Container>
    </Box>
  );

  return <DashboardLayout>{content}</DashboardLayout>;
};

export default CommissionPage;