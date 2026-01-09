/**
 * Referral Page - Main Layout & Rendering
 * 
 * Hanya menangani:
 * - UI Layout
 * - Component rendering
 * - State binding dari hook
 */

import React from 'react';
import {
  Box,
  Container,
  Group,
  Text,
  Title,
  Table,
  useMantineColorScheme,
  Stack,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { DashboardLayout } from '../../components/dashboardlayout/dashboard.layout';
import { COLORS } from '../../types/colors';
import { useAuth } from '../../store/auth.context';
import { useReferral } from './useReferral';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Pagination } from '../../components/common';
import {
  ReferralFilters,
  ReferralTableRow,
  ReferralMobileCard,
  EmptyState,
  LoadingState,
  ErrorState,
} from './referralComponents';

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
        backgroundColor: dark ? '#1a1a1a' : '#ffffff',
        minHeight: '100vh',
        padding: '40px 0',
      }}
    >
      <Container size="xl">
        {/* Header Section */}
        <Group justify="space-between" align="flex-start" mb={40}>
          <Box>
            <Title
              order={1}
              style={{
                color: dark ? '#ffffff' : COLORS.text.dark,
                fontSize: isMobile ? 24 : 32,
                fontWeight: 700,
              }}
            >
              Referral Program
            </Title>
            <Text
              style={{
                color: dark ? '#a1a1a1' : COLORS.text.tertiary,
                fontSize: 14,
                marginTop: 4,
              }}
            >
              {loading ? 'Loading...' : `Total ${filteredReferrals.length} referrals`}
            </Text>
          </Box>
        </Group>

        {/* Loading State */}
        {loading && <LoadingState />}

        {/* Error State */}
        {error && !loading && <ErrorState message={error} />}

        {/* Main Content */}
        {!loading && !error && (
          <>
            {/* Filters */}
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

            {/* Desktop Table View */}
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
                      <Table.Th
                        style={{
                          width: 40,
                          color: dark ? '#ffffff' : COLORS.text.dark,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {/* Expand column */}
                      </Table.Th>
                      <Table.Th
                        style={{
                          color: dark ? '#ffffff' : COLORS.text.dark,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        NAME / KODE
                      </Table.Th>
                      <Table.Th
                        style={{
                          color: dark ? '#ffffff' : COLORS.text.dark,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        LEVEL
                      </Table.Th>
                      <Table.Th
                        style={{
                          color: dark ? '#ffffff' : COLORS.text.dark,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        STATUS
                      </Table.Th>
                      <Table.Th
                        style={{
                          color: dark ? '#ffffff' : COLORS.text.dark,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        TOTAL PENGHASILAN
                      </Table.Th>
                      <Table.Th
                        style={{
                          color: dark ? '#ffffff' : COLORS.text.dark,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        MENDAFTAR
                      </Table.Th>
                      <Table.Th
                        style={{
                          color: dark ? '#ffffff' : COLORS.text.dark,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
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

            {/* Mobile View */}
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

            {/* Pagination */}
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
