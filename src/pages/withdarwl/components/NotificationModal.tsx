import React from 'react'
import { Modal, Stack, Text, ThemeIcon, Button } from '@mantine/core'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'
import { COLORS } from '../../../types/colors'
import type { NotificationState } from '../useWithdrawalPage'

interface NotificationModalProps {
  dark: boolean
  notification: NotificationState
  onClose: () => void
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  dark,
  notification,
  onClose,
}) => {
  const getIconColor = () => {
    switch (notification.type) {
      case 'success': return '#10b981'
      case 'error': return '#ef4444'
      default: return '#3b82f6'
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'success': return 'rgba(16, 185, 129, 0.1)'
      case 'error': return 'rgba(239, 68, 68, 0.1)'
      default: return 'rgba(59, 130, 246, 0.1)'
    }
  }

  return (
    <Modal
      opened={notification.show}
      onClose={onClose}
      title={notification.title}
      centered
      size="sm"
      styles={{
        title: { color: dark ? '#ffffff' : COLORS.text.dark, fontWeight: 700, fontSize: 18 },
        content: { backgroundColor: dark ? '#1a1a1a' : '#ffffff' },
      }}
    >
      <Stack gap={20} align="center">
        <ThemeIcon
          size={80}
          radius="50%"
          style={{ backgroundColor: getBgColor(), color: getIconColor() }}
        >
          {notification.type === 'success' ? (
            <IconCheck size={40} stroke={2} />
          ) : (
            <IconAlertCircle size={40} stroke={2} />
          )}
        </ThemeIcon>

        <Text style={{ color: dark ? '#ffffff' : COLORS.text.dark, fontSize: 15, lineHeight: 1.6, textAlign: 'center' }}>
          {notification.message}
        </Text>

        <Button
          onClick={onClose}
          style={{ backgroundColor: getIconColor(), color: '#ffffff', height: 40, borderRadius: 8, fontWeight: 700, width: '100%' }}
        >
          {notification.type === 'success' ? 'Lanjutkan' : 'Tutup'}
        </Button>
      </Stack>
    </Modal>
  )
}
