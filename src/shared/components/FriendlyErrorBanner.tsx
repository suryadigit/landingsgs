import React from 'react';
import { Box, Button, Group, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useError } from '../../contexts/ErrorContext';

const FriendlyErrorBanner: React.FC = () => {
  const { error, setError } = useError();
  if (!error) return null;

  const code = error.code ?? 'N/A';
  const onRetry = () => setError(null);

  return (
    <Box mb={24} style={{ padding: 18, borderRadius: 12, backgroundColor: 'rgba(250,244,242,0.95)', border: '1px solid rgba(200,30,30,0.08)' }}>
      <Group gap="apart" align="flex-start">
        <Group align="flex-start">
          <Box style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(200,30,30,0.06), rgba(200,30,30,0.03))' }}>
            <IconAlertTriangle size={28} style={{ color: '#b91c1c' }} />
          </Box>

          <Box>
            <Title order={3} style={{ margin: 0, color: '#7f1d1d' }}>{error.title}</Title>
            <Text size="sm" style={{ color: '#5b2121', marginTop: 6 }}>{error.message}</Text>
            <Text size="xs" style={{ color: '#6b6b6b', marginTop: 8 }}>Error Code: <strong>{code}</strong></Text>
          </Box>
        </Group>

        <Group>
          <Button onClick={onRetry} variant="filled" style={{ backgroundColor: '#8b1a1a', color: '#fff' }}>Retry</Button>
          {error.requireLogin ? (
            <Button onClick={() => window.location.assign(error.redirectTo || '/signin')} variant="outline" style={{ borderColor: 'rgba(139,26,26,0.9)', color: '#8b1a1a' }}>Sign In</Button>
          ) : (
            <Button onClick={() => window.open(`https://wa.me/6285183292385?text=${encodeURIComponent(`${error.title} (code: ${code})`)}`)} variant="outline" style={{ borderColor: 'rgba(139,26,26,0.9)', color: '#8b1a1a' }}>Contact Support</Button>
          )}
        </Group>
      </Group>
    </Box>
  );
};

export default FriendlyErrorBanner;
