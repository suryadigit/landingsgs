import React from 'react'
import { Box, Title, List, Text, ThemeIcon } from '@mantine/core'
import { COLORS } from '../../../types/colors'
import { WITHDRAWAL_INFO } from '../withdrawalConstants'

interface WithdrawalInfoProps {
  dark: boolean
}

export const WithdrawalInfo: React.FC<WithdrawalInfoProps> = ({ dark }) => {
  return (
    <Box
      style={{
        backgroundColor: dark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 12,
        padding: 24,
        marginTop: 32,
      }}
    >
      <Title order={3} mb={16} style={{ color: COLORS.accent.primary, fontSize: 16, fontWeight: 700 }}>
        Informasi Pencairan
      </Title>

      <List
        spacing="md"
        icon={
          <ThemeIcon size={20} radius="xl" variant="light" style={{ color: COLORS.accent.primary }}>
            <Box style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.accent.primary }} />
          </ThemeIcon>
        }
      >
        {WITHDRAWAL_INFO.map((info, index) => (
          <List.Item key={index}>
            <Text style={{ color: COLORS.accent.primary, fontSize: 14, lineHeight: 1.6 }}>
              {info}
            </Text>
          </List.Item>
        ))}
      </List>
    </Box>
  )
}
