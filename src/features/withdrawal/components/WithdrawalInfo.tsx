import React from 'react'
import { Box, Title, List, Text, ThemeIcon } from '@mantine/core'
import { COLORS } from '../../../shared/types'
import { WITHDRAWAL_INFO } from '../constants/withdrawalConstants'

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
        padding: 16,
        marginTop: 0,
        alignSelf: 'flex-start',
        maxWidth: 520,
      }}
    >
      <Title order={3} mb={12} style={{ color: COLORS.accent.primary, fontSize: 15, fontWeight: 700 }}>
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
          <List.Item key={index} style={{ alignItems: 'flex-start' }}>
            <Text style={{ color: COLORS.accent.primary, fontSize: 13, lineHeight: 1.5 }}>
              {info}
            </Text>
          </List.Item>
        ))}
      </List>
    </Box>
  )
}
