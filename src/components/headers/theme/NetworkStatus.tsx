import { ActionIcon, Tooltip, Box, Text } from '@mantine/core';
import {
  IconWifi,
  IconWifi2,
  IconWifi1,
  IconWifiOff,
} from '@tabler/icons-react';
import { useNetworkStatus } from './useNetworkStatus';

interface NetworkStatusProps {
  dark: boolean;
  textColor: string;
}

type ConnectionQuality = 'excellent' | 'good' | 'weak' | 'offline';

const getConnectionInfo = (quality: ConnectionQuality) => {
  switch (quality) {
    case 'excellent':
      return {
        icon: IconWifi,
        color: '#10b981', // green
        label: 'Koneksi Sangat Baik',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        pulseColor: 'rgba(16, 185, 129, 0.4)',
      };
    case 'good':
      return {
        icon: IconWifi2,
        color: '#3b82f6', // blue
        label: 'Koneksi Normal',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        pulseColor: 'rgba(59, 130, 246, 0.4)',
      };
    case 'weak':
      return {
        icon: IconWifi1,
        color: '#f59e0b', // amber
        label: 'Koneksi Lemah',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        pulseColor: 'rgba(245, 158, 11, 0.4)',
      };
    case 'offline':
      return {
        icon: IconWifiOff,
        color: '#ef4444', // red
        label: 'Tidak Ada Koneksi',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        pulseColor: 'rgba(239, 68, 68, 0.4)',
      };
  }
};

export function NetworkStatus({  }: NetworkStatusProps) {
  const { quality, effectiveType, downlink, rtt } = useNetworkStatus();
  const info = getConnectionInfo(quality);
  const IconComponent = info.icon;

  const getDetailedInfo = () => {
    if (quality === 'offline') return 'Tidak terhubung ke internet';
    
    const details: string[] = [];
    if (effectiveType) details.push(`Tipe: ${effectiveType.toUpperCase()}`);
    if (downlink) details.push(`Kecepatan: ${downlink} Mbps`);
    if (rtt) details.push(`Latency: ${rtt}ms`);
    
    return details.length > 0 ? details.join(' • ') : info.label;
  };

  return (
    <>
      <style>
        {`
          @keyframes network-pulse-excellent {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
            }
            50% {
              box-shadow: 0 0 8px 4px rgba(16, 185, 129, 0.2);
            }
          }
          @keyframes network-pulse-good {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
            }
            50% {
              box-shadow: 0 0 8px 4px rgba(59, 130, 246, 0.2);
            }
          }
          @keyframes network-pulse-weak {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 8px 4px rgba(245, 158, 11, 0.2);
              transform: scale(1.05);
            }
          }
          @keyframes network-pulse-offline {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
              opacity: 1;
            }
            50% {
              box-shadow: 0 0 12px 6px rgba(239, 68, 68, 0.3);
              opacity: 0.7;
            }
          }
          @keyframes icon-wave {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
          @keyframes signal-bars {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
      
      <Tooltip
        label={
          <Box style={{ textAlign: 'center' }}>
            <Text size="sm" fw={600}>{info.label}</Text>
            <Text size="xs" c="dimmed">{getDetailedInfo()}</Text>
          </Box>
        }
        position="bottom"
        withArrow
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        <ActionIcon
          variant="transparent"
          color="gray"
          size="xl"
          style={{
            padding: 8,
            borderRadius: 10,
            transition: 'all 0.3s ease',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            position: 'relative',
            overflow: 'visible',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {/* Icon with animation */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: quality === 'weak' || quality === 'offline' 
                ? `icon-wave 1s infinite ease-in-out` 
                : undefined,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <IconComponent 
              size={24} 
              color={info.color}
              stroke={2}
              style={{
                filter: `drop-shadow(0 0 8px ${info.color})`,
              }}
            />
          </Box>

          {/* Status dot indicator */}
          <Box
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: info.color,
              boxShadow: `0 0 6px ${info.color}`,
            }}
          />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
