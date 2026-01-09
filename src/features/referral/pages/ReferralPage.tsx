import React from 'react';
import {
  Box,
  Container,
  Group,
  Text,
  Title,
  Table,
  Skeleton,
  useMantineColorScheme,
  Stack,
  Grid,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { DashboardLayout } from '../../../components/dashboardlayout/dashboard.layout';
import { COLORS } from '../../../shared/types';
import { useAuth } from '../../auth';
import { useReferral } from '../hooks/useReferral';
import { ErrorBoundary } from '../../../components/core';
import { Pagination } from '../../../components/common';
import {
  ReferralFilters,
  ReferralTableRow,
  ReferralMobileCard,
  EmptyState,
  ErrorState,
} from '../components/ReferralComponents';

const ReferralPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const { user } = useAuth();

  const {
    filteredReferrals,
    paginatedReferrals,
    levelOptions,
    loading,
    error,
    searchValue,
    statusFilter,
    levelFilter,
    expandedRows,
    currentPage,
    itemsPerPage,
    totalPages,
    setSearchValue,
    setStatusFilter,
    setLevelFilter,
    setCurrentPage,
    setItemsPerPage,
    toggleRow,
  } = useReferral();

  const content = (
    <Box
      style={{
        backgroundColor: dark ? '#0d0d0d' : '#ffffff',
        minHeight: '100vh',
        paddingInlineStart: "10px",

      }}
    >
      <Container size="xl">
        {/* Header Section */}
        <Group justify="space-between" align="flex-start" mb={12}>
          <Box>
            <Title
              order={1}
              style={{
                color: dark ? '#ffffff' : COLORS.text.dark,
                fontSize: isMobile ? 22 : 22,
                fontWeight: 700,
              }}
            >
              Referral Program
            </Title>
            <Text
              style={{
                color: dark ? "#a1a1a1" : COLORS.text.tertiary,
                fontSize: 14,
                marginTop: 4,
              }}
            >
            Referral program per level anda
            </Text>
          </Box>
        </Group>

        {loading && (
          <Container size="xl">
            <Stack gap="xl" py={16}>
              <Skeleton height={36} width={420} radius="sm" />

              <Grid>
                <Grid.Col span={6}>
                  <Skeleton height={120} radius="md" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Skeleton height={120} radius="md" />
                </Grid.Col>
              </Grid>

              <Skeleton height={220} radius="lg" />

              <Stack gap="md">
                <Skeleton height={18} width="60%" radius="sm" />
                <Skeleton height={48} radius="sm" />
                <Skeleton height={200} radius="md" />
              </Stack>
            </Stack>
          </Container>
        )}

        {error && !loading && <ErrorState message={error} />}

        {!loading && !error && (
          <>
            <ReferralFilters
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              levelFilter={levelFilter}
              onLevelChange={setLevelFilter}
              levelOptions={levelOptions}
              isMobile={isMobile}
              dark={dark}
            />

            {!isMobile && (
              <Box
                style={{
                  backgroundColor: dark ? '#1a1a1a' : '#ffffff',
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  overflow: 'auto',
                }}
              >
                <Table striped style={{ minWidth: 900 }}>
                  <Table.Thead
                    style={{
                      backgroundColor: dark ? '#0d0d0d' : '#ffffff',
                      position: 'sticky',
                      top: 0,
                    }}
                  >
                    <Table.Tr>
                      <Table.Th style={{ width: 40, color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700 }} />
                      <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        NAME / KODE
                      </Table.Th>
                      <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        LEVEL
                      </Table.Th>
                      <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        STATUS
                      </Table.Th>
                      <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        TOTAL PENGHASILAN
                      </Table.Th>
                      <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        MENDAFTAR
                      </Table.Th>
                      <Table.Th style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        TOTAL MEMBER
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {paginatedReferrals.length > 0 ? (
                      paginatedReferrals.map((referral) => (
                        <ReferralTableRow
                          key={referral.id}
                          referral={referral}
                          isExpanded={expandedRows.includes(referral.id)}
                          onToggle={() => toggleRow(referral.id)}
                          userName={user?.fullName || 'Anda'}
                          dark={dark}
                          expandedRows={expandedRows}
                          onToggleSubRow={toggleRow}
                        />
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={7}>
                          <EmptyState dark={dark} />
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Box>
            )}

            {isMobile && (
              <Stack gap={16}>
                {paginatedReferrals.length > 0 ? (
                  paginatedReferrals.map((referral) => (
                    <ReferralMobileCard
                      key={referral.id}
                      referral={referral}
                      isExpanded={expandedRows.includes(referral.id)}
                      onToggle={() => toggleRow(referral.id)}
                      userName={user?.fullName || 'Anda'}
                      dark={dark}
                      expandedRows={expandedRows}
                      onToggleSubRow={toggleRow}
                    />
                  ))
                ) : (
                  <EmptyState dark={dark} />
                )}
              </Stack>
            )}

            {filteredReferrals.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReferrals.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                showItemsPerPage={!isMobile}
                dark={dark}
                isMobile={isMobile}
              />
            )}
          </>
        )}
      </Container>
    </Box>
  );

  return (
    <ErrorBoundary>
      <DashboardLayout>{content}</DashboardLayout>
    </ErrorBoundary>
  );
};

export default ReferralPage;
