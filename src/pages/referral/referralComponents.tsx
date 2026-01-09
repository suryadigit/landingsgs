/**
 * Reusable UI Components untuk Referral Page
 */

import React, { useMemo } from 'react';
import {
  Box,
  Group,
  Text,
  Badge,
  ActionIcon,
  Table,
  Stack,
  TextInput,
  Select,
  Center,
  Loader,
  Button,
} from '@mantine/core';
import {
  IconSearch,
  IconUsers,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { COLORS } from '../../types/colors';
import { formatCurrency } from './useReferral';
import type { TransformedReferral, RawReferralData } from './useReferral';

// ============================================
// Helper Functions
// ============================================

/**
 * Determine font size based on the length of the currency string
 * Reduces font size when numbers get too large
 */
const getFontSizeForCurrency = (currencyString: string): 'xs' | 'sm' | 'md' | 'lg' => {
  const length = currencyString.replace(/[^0-9]/g, '').length; // Count only digits
  
  if (length > 12) return 'xs';      // Very large numbers: extra small
  if (length > 10) return 'xs';      // Large numbers: extra small
  if (length > 8) return 'sm';       // Medium numbers: small
  return 'md';                       // Normal numbers: medium
};

interface StatusColorConfig {
  color: string;
  bgColor: string;
}

const getStatusColors = (status: 'Active' | 'Pending' | 'Inactive'): StatusColorConfig => {
  switch (status) {
    case 'Active':
      return { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    case 'Pending':
      return { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' };
    default:
      return { color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
  }
};

// ============================================
// Filter Components
// ============================================

interface ReferralFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusChange: (value: string | null) => void;
  levelFilter: string | null;
  onLevelChange: (value: string | null) => void;
  levelOptions: Array<{ value: string; label: string }>;
  isMobile: boolean;
  dark: boolean;
}

export const ReferralFilters: React.FC<ReferralFiltersProps> = ({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
  levelFilter,
  onLevelChange,
  levelOptions,
  isMobile,
  dark,
}) => {
  return (
    <Box
      style={{
        backgroundColor: dark ? '#0d0d0d' : '#f9fafb',
        borderRadius: 12,
        padding: isMobile ? 16 : 24,
        marginBottom: 24,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <Group grow={!isMobile} mb={16}>
        <TextInput
          placeholder="Cari nama atau kode referral"
          leftSection={<IconSearch size={16} />}
          leftSectionWidth={36}
          value={searchValue}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          styles={{
            input: {
              backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              border: `1px solid ${COLORS.border}`,
              color: dark ? '#ffffff' : COLORS.text.dark,
              '&::placeholder': {
                color: COLORS.text.tertiary,
              },
            },
          }}
        />

        {!isMobile && (
          <Group grow>
            <Select
              placeholder="All Status"
              data={[
                { value: 'Active', label: 'Active' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              value={statusFilter}
              onChange={onStatusChange}
              clearable
              searchable
              styles={{
                input: {
                  backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  border: `1px solid ${COLORS.border}`,
                  color: dark ? '#ffffff' : COLORS.text.dark,
                },
              }}
            />

            <Select
              placeholder="All Levels"
              data={levelOptions}
              value={levelFilter}
              onChange={onLevelChange}
              clearable
              searchable
              styles={{
                input: {
                  backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  border: `1px solid ${COLORS.border}`,
                  color: dark ? '#ffffff' : COLORS.text.dark,
                },
              }}
            />
          </Group>
        )}
      </Group>

      {isMobile && (
        <Stack gap={12}>
          <Select
            placeholder="All Status"
            data={[
              { value: 'Active', label: 'Active' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={onStatusChange}
            clearable
            searchable
            styles={{
              input: {
                backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                border: `1px solid ${COLORS.border}`,
                color: dark ? '#ffffff' : COLORS.text.dark,
              },
            }}
          />

          <Select
            placeholder="All Levels"
            data={levelOptions}
            value={levelFilter}
            onChange={onLevelChange}
            clearable
            searchable
            styles={{
              input: {
                backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                border: `1px solid ${COLORS.border}`,
                color: dark ? '#ffffff' : COLORS.text.dark,
              },
            }}
          />
        </Stack>
      )}
    </Box>
  );
};

// ============================================
// Status Badge Component
// ============================================

interface StatusBadgeProps {
  status: 'Active' | 'Pending' | 'Inactive';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { color, bgColor } = getStatusColors(status);

  return (
    <Badge
      style={{
        backgroundColor: bgColor,
        color: color,
        fontWeight: 600,
        border: `1px solid ${color}`,
        textTransform: 'uppercase',
        fontSize: 11,
      }}
    >
      {status}
    </Badge>
  );
};

// ============================================
// Nested Sub-Referrals Component - Redesigned for Mobile
// Uses vertical line indicator instead of margin indent
// ============================================

interface NestedSubReferralsProps {
  subRefs: RawReferralData[];
  depth?: number;
  parentLevel?: number;
  expandedRows: string[];
  onToggleRow: (id: string) => void;
  userName: string;
  dark: boolean;
}

// Level color mapping for visual distinction
const getLevelColor = (level: number): string => {
  const colors: Record<number, string> = {
    1: '#3b82f6', // Blue
    2: '#8b5cf6', // Purple
    3: '#ec4899', // Pink
    4: '#f97316', // Orange
    5: '#14b8a6', // Teal
    6: '#eab308', // Yellow
    7: '#ef4444', // Red
    8: '#06b6d4', // Cyan
    9: '#84cc16', // Lime
    10: '#6366f1', // Indigo
  };
  return colors[level] || colors[1];
};

export const NestedSubReferrals: React.FC<NestedSubReferralsProps> = ({
  subRefs,
  depth = 0,
  parentLevel = 1,
  expandedRows,
  onToggleRow,
  userName,
  dark,
}) => {
  const transformedRefs = useMemo(() => {
    return subRefs.map((ref) => {
      const normalizedStatus = ref.status?.toUpperCase() || 'PENDING';
      const statusDisplay: 'Active' | 'Pending' | 'Inactive' = normalizedStatus === 'ACTIVE' ? 'Active' : 'Pending';

      // Use level from API directly - convert to number
      const refLevel = typeof ref.level === 'number' ? ref.level : parseInt(String(ref.level || parentLevel + 1), 10);
      const hasEarnings = (ref.totalEarnings || 0) > 0;
      const isActive = normalizedStatus === 'ACTIVE';

      let displayEarnings = 0;
      if (refLevel === 1) {
        displayEarnings = ref.totalEarnings || 0;
      } else if (refLevel >= 2 && (hasEarnings || isActive)) {
        displayEarnings = 12500;
      }

      return {
        ...ref,
        status: statusDisplay,
        totalEarnings: displayEarnings,
        displayEarnings: formatCurrency(displayEarnings),
        level: refLevel,
      };
    });
  }, [subRefs, parentLevel]);

  // TIDAK ADA INDENT - semua card full width
  // Visual hierarchy ditunjukkan dengan:
  // 1. Border left color sesuai level
  // 2. Badge level di dalam card
  // 3. Connector line di atas card

  return (
    <Stack gap={4}>
      {transformedRefs.map((subRef, index) => {
        const currentLevelColor = getLevelColor(subRef.level);
        const hasChildren = subRef.referrals && subRef.referrals.length > 0;
        const isExpanded = expandedRows.includes(subRef.id);
        
        return (
          <Box key={subRef.id}>
            {/* Connector visual - menunjukkan ini adalah child */}
            {depth > 0 && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 2,
                  paddingLeft: 8,
                }}
              >
                <Box
                  style={{
                    width: 12,
                    height: 12,
                    borderLeft: `2px solid ${currentLevelColor}`,
                    borderBottom: `2px solid ${currentLevelColor}`,
                    borderBottomLeftRadius: 4,
                    opacity: 0.6,
                  }}
                />
                <Box
                  style={{
                    flex: 1,
                    height: 2,
                    background: `linear-gradient(to right, ${currentLevelColor}60, transparent)`,
                    marginLeft: 2,
                  }}
                />
              </Box>
            )}

            {/* Card container - FULL WIDTH, no indent */}
            <Box
              style={{
                backgroundColor: dark ? 'rgba(30, 30, 35, 0.95)' : '#ffffff',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : COLORS.border}`,
                borderLeft: `4px solid ${currentLevelColor}`,
                borderRadius: 8,
                padding: '10px 12px',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Header row */}
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap={8}>
                {/* Left: Name and Code */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap" align="center">
                    {/* Depth indicator dots */}
                    {depth > 0 && (
                      <Group gap={2} style={{ flexShrink: 0 }}>
                        {Array.from({ length: Math.min(depth, 4) }).map((_, i) => (
                          <Box
                            key={i}
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              backgroundColor: getLevelColor(parentLevel - depth + i + 2),
                              opacity: 0.7,
                            }}
                          />
                        ))}
                      </Group>
                    )}
                    <Text
                      size="sm"
                      fw={600}
                      style={{ 
                        color: dark ? '#ffffff' : COLORS.text.dark,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                      }}
                    >
                      {subRef.name}
                    </Text>
                  </Group>
                  <Text 
                    size="xs" 
                    style={{ 
                      color: COLORS.text.tertiary,
                      fontSize: 10,
                      marginTop: 2,
                    }}
                  >
                    {subRef.code}
                  </Text>
                </Box>

                {/* Right: Level badge dan expand */}
                <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
                  <Badge
                    size="xs"
                    variant="light"
                    style={{
                      backgroundColor: `${currentLevelColor}20`,
                      color: currentLevelColor,
                      border: `1px solid ${currentLevelColor}50`,
                      fontWeight: 700,
                      padding: '3px 8px',
                      fontSize: 10,
                    }}
                  >
                    LV.{subRef.level}
                  </Badge>

                  {hasChildren && (
                    <ActionIcon
                      variant="light"
                      size="sm"
                      radius="xl"
                      onClick={() => onToggleRow(subRef.id)}
                      style={{
                        backgroundColor: isExpanded 
                          ? `${currentLevelColor}30` 
                          : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${currentLevelColor}40`,
                        width: 24,
                        height: 24,
                      }}
                    >
                      {isExpanded ? (
                        <IconChevronUp size={14} color={currentLevelColor} />
                      ) : (
                        <IconChevronDown size={14} color={currentLevelColor} />
                      )}
                    </ActionIcon>
                  )}
                </Group>
              </Group>

              {/* Info row */}
              <Group justify="space-between" align="center" mt={8} gap={8}>
                <Group gap={8} wrap="nowrap">
                  <StatusBadge status={subRef.status} />
                  {hasChildren && (
                    <Group gap={3} style={{ 
                      backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}>
                      <IconUsers size={11} style={{ color: COLORS.text.tertiary }} />
                      <Text size="xs" style={{ color: COLORS.text.tertiary, fontSize: 10, fontWeight: 500 }}>
                        {subRef.referrals?.length || 0} member
                      </Text>
                    </Group>
                  )}
                </Group>
                
                <Text 
                  size="sm" 
                  fw={700} 
                  style={{ 
                    color: dark ? '#10b981' : '#059669',
                    fontSize: 12,
                  }}
                >
                  {subRef.displayEarnings}
                </Text>
              </Group>
            </Box>

            {/* Nested children - recursive, TANPA tambahan indent */}
            {isExpanded && hasChildren && (
              <Box 
                style={{ 
                  marginTop: 4,
                  marginLeft: 8,
                  paddingLeft: 8,
                  borderLeft: `2px dashed ${currentLevelColor}40`,
                }}
              >
                <NestedSubReferrals
                  subRefs={subRef.referrals!}
                  depth={depth + 1}
                  parentLevel={subRef.level}
                  expandedRows={expandedRows}
                  onToggleRow={onToggleRow}
                  userName={userName}
                  dark={dark}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

// ============================================
// Table Row Component
// ============================================

interface ReferralTableRowProps {
  referral: TransformedReferral;
  isExpanded: boolean;
  onToggle: () => void;
  userName: string;
  dark: boolean;
  expandedRows: string[];
  onToggleSubRow: (id: string) => void;
}

export const ReferralTableRow: React.FC<ReferralTableRowProps> = ({
  referral,
  isExpanded,
  onToggle,
  userName,
  dark,
  expandedRows,
  onToggleSubRow,
}) => {
  const levelNumber = parseInt(referral.level.split(' ')[1], 10);

  return (
    <>
      <Table.Tr>
        <Table.Td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
          {referral.subReferrals > 0 && (
            <ActionIcon variant="light" size="sm" onClick={onToggle}>
              {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          )}
        </Table.Td>

        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Box>
            <Text size="sm" fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
              {referral.name}
            </Text>
            <Text size="xs" style={{ color: COLORS.text.tertiary }}>
              {referral.code}
            </Text>
          </Box>
        </Table.Td>

        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Text size="sm" style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
            {referral.level}
          </Text>
        </Table.Td>

        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <StatusBadge status={referral.status} />
        </Table.Td>

        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Text size={getFontSizeForCurrency(referral.earnings)} fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
            {referral.earnings}
          </Text>
        </Table.Td>

        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Text size="sm" style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
            {referral.registered}
          </Text>
        </Table.Td>

        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Text size="sm" style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
            {referral.subReferrals}
          </Text>
        </Table.Td>
      </Table.Tr>

      {isExpanded && referral.subReferralsList.length > 0 && (
        <Table.Tr style={{ backgroundColor: dark ? '#0d0d0d' : '#ffffff' }}>
          <Table.Td colSpan={7}>
            <Box style={{ padding: '12px' }}>
              <NestedSubReferrals
                subRefs={referral.subReferralsList}
                depth={0}
                parentLevel={levelNumber}
                expandedRows={expandedRows}
                onToggleRow={onToggleSubRow}
                userName={userName}
                dark={dark}
              />
            </Box>
          </Table.Td>
        </Table.Tr>
      )}
    </>
  );
};

// ============================================
// Mobile Card Component
// ============================================

interface ReferralMobileCardProps {
  referral: TransformedReferral;
  isExpanded: boolean;
  onToggle: () => void;
  userName: string;
  dark: boolean;
  expandedRows: string[];
  onToggleSubRow: (id: string) => void;
}

export const ReferralMobileCard: React.FC<ReferralMobileCardProps> = ({
  referral,
  isExpanded,
  onToggle,
  userName,
  dark,
  expandedRows,
  onToggleSubRow,
}) => {
  const levelNumber = parseInt(referral.level.split(' ')[1], 10);

  return (
    <Box
      style={{
        backgroundColor: dark ? '#1a1a1a' : '#ffffff',
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        padding: 16,
      }}
    >
      <Group justify="space-between" align="flex-start" mb={12}>
        <Group gap={12}>
          <Box>
            <Text fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
              {referral.name}
            </Text>
            <Text size="xs" style={{ color: COLORS.text.tertiary }}>
              {referral.code}
            </Text>
          </Box>
        </Group>
        {referral.subReferrals > 0 && (
          <ActionIcon variant="light" size="sm" onClick={onToggle}>
            {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        )}
      </Group>

      <Stack gap={12}>
        <Group justify="space-between">
          <Text size="xs" style={{ color: COLORS.text.tertiary }}>
            Level
          </Text>
          <Text size="sm" fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
            {referral.level}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text size="xs" style={{ color: COLORS.text.tertiary }}>
            Status
          </Text>
          <StatusBadge status={referral.status} />
        </Group>

        <Group justify="space-between" align="center">
          <Text size="xs" style={{ color: COLORS.text.tertiary }}>
            Total Omset
          </Text>
          <Text size={getFontSizeForCurrency(referral.earnings)} fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
            {referral.earnings}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text size="xs" style={{ color: COLORS.text.tertiary }}>
            Mendaftar
          </Text>
          <Text size="sm" style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
            {referral.registered}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text size="xs" style={{ color: COLORS.text.tertiary }}>
            Total Member
          </Text>
          <Text size="sm" style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
            {referral.subReferrals}
          </Text>
        </Group>
      </Stack>

      {isExpanded && referral.subReferralsList.length > 0 && (
        <Box
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <NestedSubReferrals
            subRefs={referral.subReferralsList}
            depth={0}
            parentLevel={levelNumber}
            expandedRows={expandedRows}
            onToggleRow={onToggleSubRow}
            userName={userName}
            dark={dark}
          />
        </Box>
      )}
    </Box>
  );
};

// ============================================
// Empty State Component
// ============================================

interface EmptyStateProps {
  dark: boolean;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  dark,
  message = 'No referrals found',
}) => (
  <Center style={{ padding: '60px 20px' }}>
    <Stack gap={12} align="center">
      <IconUsers size={48} color={dark ? '#a1a1a1' : COLORS.text.tertiary} />
      <Text style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary, fontSize: 16 }}>
        {message}
      </Text>
    </Stack>
  </Center>
);

// ============================================
// Loading State Component
// ============================================

export const LoadingState: React.FC = () => (
  <Center style={{ padding: '60px 20px' }}>
    <Stack gap={12} align="center">
      <Loader size="lg" color={COLORS.accent.primary} />
      <Text style={{ color: COLORS.text.tertiary }}>
        Loading referral data...
      </Text>
    </Stack>
  </Center>
);

// ============================================
// Error State Component
// ============================================

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleOpenDiagnostics = async () => {
    // Dynamically import diagnostics to avoid circular dependency
    const { runFullDiagnostic } = await import('../../api/diagnostics');
    await runFullDiagnostic();
  };

  // Check if this is an admin/superadmin access error
  const isAdminAccessError = message.includes('akses') || message.includes('Forbidden');

  return (
    <Center style={{ padding: '60px 20px' }}>
      <Stack gap={12} align="center" style={{ maxWidth: '500px' }}>
        <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: 600 }}>
          ⚠️ Error Loading Data
        </Text>
        <Text style={{ color: '#666', fontSize: 14, textAlign: 'center' }}>
          {message}
        </Text>
        {isAdminAccessError && (
          <Text style={{ color: '#f97316', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
            💡 Halaman ini hanya untuk role Member/Affiliate. Admin dan SuperAdmin tidak memiliki jaringan referral sendiri.
          </Text>
        )}
        <Stack gap={8} style={{ width: '100%', marginTop: 12 }}>
          <Button
            onClick={handleRetry}
            color="blue"
            size="sm"
            fullWidth
          >
            Retry
          </Button>
          <Button
            onClick={handleOpenDiagnostics}
            variant="light"
            size="sm"
            fullWidth
          >
            Run Diagnostics (Check browser console)
          </Button>
        </Stack>
        <Text style={{ color: '#999', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
          If the problem persists, please contact support and check your browser console (F12) for detailed error information.
        </Text>
      </Stack>
    </Center>
  );
};
