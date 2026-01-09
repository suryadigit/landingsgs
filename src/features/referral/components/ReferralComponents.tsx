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
  Button,
  Collapse,
  Paper,
  Skeleton,
} from '@mantine/core';
import {
  IconSearch,
  IconUsers,
  IconChevronDown,
  IconChevronUp,
  IconCalendar,
  IconCoin,
  IconUserPlus,
} from '@tabler/icons-react';
import { COLORS } from '../../../shared/types';
import { 
  formatCurrency, 
  formatDate,
  getStatusColors, 
  getFontSizeForCurrency, 
  getLevelColor 
} from '../utils/referralUtils';
import type { TransformedReferral, RawReferralData } from '../types/referralTypes';

interface ReferralFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusChange: (value: string | null) => void;
  levelFilter: string | null;
  onLevelChange: (value: string | null) => void;
  levelOptions: Array<{ value: string; label: string }>;
  isMobile?: boolean;
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

interface NestedSubReferralsProps {
  subRefs: RawReferralData[];
  depth?: number;
  parentLevel?: number;
  expandedRows: string[];
  onToggleRow: (id: string) => void;
  userName: string;
  dark: boolean;
  isMobile?: boolean;
}

const MobileNestedReferrals: React.FC<NestedSubReferralsProps> = ({
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
      const refLevel = typeof ref.level === 'number' ? ref.level : parseInt(String(ref.level || parentLevel + 1), 10);
      const commissionFromRef = ref.commissionFromThisReferral?.total || 0;
      const displayEarnings = commissionFromRef > 0 ? commissionFromRef : (ref.totalEarnings || 0);

      return {
        ...ref,
        status: statusDisplay,
        totalEarnings: displayEarnings,
        displayEarnings: formatCurrency(displayEarnings),
        level: refLevel,
        commissionFromThisReferral: ref.commissionFromThisReferral,
      };
    });
  }, [subRefs, parentLevel]);

  return (
    <Stack gap={8}>
      {transformedRefs.map((subRef) => {
        const currentLevelColor = getLevelColor(subRef.level);
        const hasChildren = subRef.referrals && subRef.referrals.length > 0;
        const isExpanded = expandedRows.includes(subRef.id);

        return (
          <Box key={subRef.id}>
            <Box
              style={{
                backgroundColor: dark ? 'rgba(30, 30, 35, 0.8)' : '#ffffff',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
                borderLeft: `3px solid ${currentLevelColor}`,
                borderRadius: 8,
                padding: '10px 12px',
                marginLeft: depth * 12,
              }}
            >
              <Group justify="space-between" align="center" wrap="nowrap" mb={8}>
                <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
                      {subRef.name}
                    </Text>
                    <Text size="xs" style={{ color: COLORS.text.tertiary }}>
                      {subRef.code}
                    </Text>
                  </Box>
                </Group>
                <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
                  <Badge size="xs" variant="light" style={{ backgroundColor: `${currentLevelColor}15`, color: currentLevelColor, border: `1px solid ${currentLevelColor}40` }}>
                    Lv.{subRef.level}
                  </Badge>
                  <StatusBadge status={subRef.status} />
                  {hasChildren && (
                    <ActionIcon variant="subtle" size="xs" onClick={() => onToggleRow(subRef.id)} style={{ color: currentLevelColor }}>
                      {isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                    </ActionIcon>
                  )}
                </Group>
              </Group>

              <Group justify="space-between" gap={8}>
                <Text size="xs" fw={600} style={{ color: dark ? '#10b981' : '#059669' }}>
                  {subRef.displayEarnings}
                </Text>
                <Text size="xs" style={{ color: COLORS.text.tertiary }}>
                  {formatDate(subRef.registeredAt || subRef.joinDate)}
                </Text>
                {hasChildren && (
                  <Group gap={4}>
                    <IconUsers size={12} style={{ color: COLORS.text.tertiary }} />
                    <Text size="xs" style={{ color: COLORS.text.tertiary }}>{subRef.referrals?.length || 0}</Text>
                  </Group>
                )}
              </Group>
            </Box>

            {isExpanded && hasChildren && (
              <Box style={{ marginTop: 6 }}>
                <MobileNestedReferrals
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

export const NestedSubReferrals: React.FC<NestedSubReferralsProps> = ({
  subRefs,
  depth = 0,
  parentLevel = 1,
  expandedRows,
  onToggleRow,
  userName,
  dark,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <MobileNestedReferrals
        subRefs={subRefs}
        depth={depth}
        parentLevel={parentLevel}
        expandedRows={expandedRows}
        onToggleRow={onToggleRow}
        userName={userName}
        dark={dark}
      />
    );
  }

  const transformedRefs = useMemo(() => {
    return subRefs.map((ref) => {
      const normalizedStatus = ref.status?.toUpperCase() || 'PENDING';
      const statusDisplay: 'Active' | 'Pending' | 'Inactive' = normalizedStatus === 'ACTIVE' ? 'Active' : 'Pending';

      const refLevel = typeof ref.level === 'number' ? ref.level : parseInt(String(ref.level || parentLevel + 1), 10);

      const commissionFromRef = ref.commissionFromThisReferral?.total || 0;
      const displayEarnings = commissionFromRef > 0 ? commissionFromRef : (ref.totalEarnings || 0);

      return {
        ...ref,
        status: statusDisplay,
        totalEarnings: displayEarnings,
        displayEarnings: formatCurrency(displayEarnings),
        level: refLevel,
        commissionFromThisReferral: ref.commissionFromThisReferral,
      };
    });
  }, [subRefs, parentLevel]);

  return (
    <>
      {transformedRefs.map((subRef) => {
        const currentLevelColor = getLevelColor(subRef.level);
        const hasChildren = subRef.referrals && subRef.referrals.length > 0;
        const isExpanded = expandedRows.includes(subRef.id);
        
        return (
          <React.Fragment key={subRef.id}>
            <Table.Tr
              style={{
                backgroundColor: dark 
                  ? (depth % 2 === 0 ? 'rgba(30, 30, 35, 0.4)' : 'rgba(40, 40, 45, 0.4)')
                  : (depth % 2 === 0 ? '#f8fafc' : '#ffffff'),
              }}
            >
              <Table.Td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                {hasChildren ? (
                  <ActionIcon variant="light" size="sm" onClick={() => onToggleRow(subRef.id)}>
                    {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                  </ActionIcon>
                ) : null}
              </Table.Td>

              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Group gap={8} wrap="nowrap">
                  <Box
                    style={{
                      width: 3,
                      height: 36,
                      backgroundColor: currentLevelColor,
                      borderRadius: 2,
                      marginLeft: depth * 16,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Text size="sm" fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
                      {subRef.name}
                    </Text>
                    <Text size="xs" style={{ color: COLORS.text.tertiary }}>
                      {subRef.code}
                    </Text>
                  </Box>
                </Group>
              </Table.Td>

              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    backgroundColor: `${currentLevelColor}15`,
                    color: currentLevelColor,
                    border: `1px solid ${currentLevelColor}40`,
                    fontWeight: 600,
                  }}
                >
                  Level {subRef.level}
                </Badge>
              </Table.Td>

              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <StatusBadge status={subRef.status} />
              </Table.Td>

              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Text size="sm" fw={600} style={{ color: dark ? '#10b981' : '#059669' }}>
                  {subRef.displayEarnings}
                </Text>
              </Table.Td>

              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Text size="sm" style={{ color: dark ? '#a1a1a1' : COLORS.text.dark }}>
                  {formatDate(subRef.registeredAt || subRef.joinDate)}
                </Text>
              </Table.Td>

              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Text size="sm" style={{ color: dark ? '#a1a1a1' : COLORS.text.dark }}>
                  {subRef.referrals?.length || 0}
                </Text>
              </Table.Td>
            </Table.Tr>

            {isExpanded && hasChildren && (
              <NestedSubReferrals
                subRefs={subRef.referrals!}
                depth={depth + 1}
                parentLevel={subRef.level}
                expandedRows={expandedRows}
                onToggleRow={onToggleRow}
                userName={userName}
                dark={dark}
                isMobile={isMobile}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

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
        <NestedSubReferrals
          subRefs={referral.subReferralsList}
          depth={1}
          parentLevel={levelNumber}
          expandedRows={expandedRows}
          onToggleRow={onToggleSubRow}
          userName={userName}
          dark={dark}
        />
      )}
    </>
  );
};

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
  const levelColor = getLevelColor(levelNumber);

  return (
    <Paper
      shadow="sm"
      radius="lg"
      style={{
        backgroundColor: dark ? '#1e1e23' : '#ffffff',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
        borderLeft: `4px solid ${levelColor}`,
        overflow: 'hidden',
      }}
    >
      {/* Header Section */}
      <Box
        style={{
          padding: '14px 16px',
          backgroundColor: dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
          cursor: referral.subReferrals > 0 ? 'pointer' : 'default',
        }}
        onClick={() => referral.subReferrals > 0 && onToggle()}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap={10} align="center" wrap="nowrap">
              <Text 
                size="md" 
                fw={600} 
                style={{ 
                  color: dark ? '#ffffff' : COLORS.text.dark,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {referral.name}
              </Text>
              <Badge
                size="sm"
                variant="light"
                style={{
                  backgroundColor: `${levelColor}15`,
                  color: levelColor,
                  border: `1px solid ${levelColor}40`,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {referral.level}
              </Badge>
            </Group>
            <Text size="xs" style={{ color: COLORS.text.tertiary, marginTop: 4 }}>
              {referral.code}
            </Text>
          </Box>
          
          <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
            <StatusBadge status={referral.status} />
            {referral.subReferrals > 0 && (
              <ActionIcon variant="subtle" size="md" style={{ color: levelColor }}>
                {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
              </ActionIcon>
            )}
          </Group>
        </Group>
      </Box>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          padding: '12px 16px',
          gap: 8,
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#f0f0f0'}`,
        }}
      >
        <Box>
          <Group gap={4} align="center" mb={4}>
            <IconCoin size={14} style={{ color: COLORS.text.tertiary }} />
            <Text size="xs" style={{ color: COLORS.text.tertiary }}>Komisi</Text>
          </Group>
          <Text size="md" fw={700} style={{ color: dark ? '#10b981' : '#059669' }}>
            {referral.earnings}
          </Text>
          {referral.commissionFromThisReferral && referral.commissionFromThisReferral.pending > 0 && (
            <Badge size="xs" color="yellow" variant="light" mt={4}>
              Pending: {formatCurrency(referral.commissionFromThisReferral.pending)}
            </Badge>
          )}
        </Box>

        <Box style={{ textAlign: 'center' }}>
          <Group gap={4} align="center" justify="center" mb={4}>
            <IconCalendar size={14} style={{ color: COLORS.text.tertiary }} />
            <Text size="xs" style={{ color: COLORS.text.tertiary }}>Daftar</Text>
          </Group>
          <Text size="sm" fw={500} style={{ color: dark ? '#a1a1a1' : COLORS.text.dark }}>
            {referral.registered}
          </Text>
        </Box>

        {/* Total Member */}
        <Box style={{ textAlign: 'right' }}>
          <Group gap={4} align="center" justify="flex-end" mb={4}>
            <IconUserPlus size={14} style={{ color: COLORS.text.tertiary }} />
            <Text size="xs" style={{ color: COLORS.text.tertiary }}>Member</Text>
          </Group>
          <Text size="sm" fw={600} style={{ color: dark ? '#ffffff' : COLORS.text.dark }}>
            {referral.subReferrals}
          </Text>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        {referral.subReferralsList.length > 0 && (
          <Box
            style={{
              padding: '12px 16px 16px',
              borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#f0f0f0'}`,
              backgroundColor: dark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <Group gap={6} mb={12}>
              <IconUsers size={14} style={{ color: levelColor }} />
              <Text size="xs" fw={600} style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary }}>
                DOWNLINE
              </Text>
              <Badge size="xs" variant="light" color="blue">
                {referral.subReferralsList.length}
              </Badge>
            </Group>
            
            <NestedSubReferrals
              subRefs={referral.subReferralsList}
              depth={0}
              parentLevel={levelNumber}
              expandedRows={expandedRows}
              onToggleRow={onToggleSubRow}
              userName={userName}
              dark={dark}
              isMobile={true}
            />
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

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

const GridPlaceholder: React.FC = () => (
  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} height={56} radius="sm" />
    ))}
  </Box>
);

export const LoadingState: React.FC = () => (
  <Box style={{ padding: 24 }}>
    <Stack gap="lg">
      <Skeleton height={24} width={280} radius="sm" />
      <GridPlaceholder />
      <Skeleton height={200} radius="md" />
    </Stack>
  </Box>
);

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  const handleRetry = () => {
    window.location.reload();
  };

 

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
          <Button onClick={handleRetry} color="blue" size="sm" fullWidth>
            Retry
          </Button>
            Run Diagnostics (Check browser console)
        </Stack>
        <Text style={{ color: '#999', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
          If the problem persists, please contact support and check your browser console (F12) for detailed error information.
        </Text>
      </Stack>
    </Center>
  );
};
