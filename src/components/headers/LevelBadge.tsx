import { Box, Tooltip, Text, Group, useMantineColorScheme } from '@mantine/core';
import { 
  IconCrown, 
  IconShieldCheck, 
} from '@tabler/icons-react';
import type { UserRole } from '../../api/auth';

// Level configuration with colors - Crown Hexagon Style
// Each level has both dark mode and light mode colors for better visibility
const LEVEL_CONFIG: Record<number, {
  name: string;
  title: string;
  colors: {
    hexLight: string;
    hexDark: string;
    crownLight: string;
    crownDark: string;
    sparkle: string;
    glow: string;
  };
  // Enhanced colors for light mode - more saturated and vibrant
  lightModeColors: {
    hexLight: string;
    hexDark: string;
    crownLight: string;
    crownDark: string;
    sparkle: string;
    glow: string;
  };
}> = {
  1: {
    name: 'Starter',
    title: 'Pemula',
    colors: {
      hexLight: '#8B7355',
      hexDark: '#5D4E3A',
      crownLight: '#A08060',
      crownDark: '#6B5344',
      sparkle: '#D4C4B0',
      glow: 'rgba(139, 115, 85, 0.5)',
    },
    lightModeColors: {
      hexLight: '#A67C52',
      hexDark: '#8B5A2B',
      crownLight: '#C49A6C',
      crownDark: '#8B6914',
      sparkle: '#FFE4B5',
      glow: 'rgba(139, 90, 43, 0.6)',
    },
  },
  2: {
    name: 'Bronze',
    title: 'Perunggu',
    colors: {
      hexLight: '#CD7F32',
      hexDark: '#8B4513',
      crownLight: '#E8A04C',
      crownDark: '#A0522D',
      sparkle: '#FFD699',
      glow: 'rgba(205, 127, 50, 0.6)',
    },
    lightModeColors: {
      hexLight: '#E8943D',
      hexDark: '#CD7F32',
      crownLight: '#FFAA33',
      crownDark: '#CC7722',
      sparkle: '#FFE0A0',
      glow: 'rgba(205, 127, 50, 0.7)',
    },
  },
  3: {
    name: 'Silver',
    title: 'Perak',
    colors: {
      hexLight: '#C0C0C0',
      hexDark: '#808080',
      crownLight: '#E8E8E8',
      crownDark: '#A0A0A0',
      sparkle: '#FFFFFF',
      glow: 'rgba(192, 192, 192, 0.6)',
    },
    lightModeColors: {
      hexLight: '#9CA3AF',
      hexDark: '#6B7280',
      crownLight: '#D1D5DB',
      crownDark: '#9CA3AF',
      sparkle: '#F3F4F6',
      glow: 'rgba(107, 114, 128, 0.5)',
    },
  },
  4: {
    name: 'Silver Elite',
    title: 'Perak Elite',
    colors: {
      hexLight: '#D8D8D8',
      hexDark: '#909090',
      crownLight: '#F0F0F0',
      crownDark: '#B0B0B0',
      sparkle: '#FFFFFF',
      glow: 'rgba(216, 216, 216, 0.7)',
    },
    lightModeColors: {
      hexLight: '#A8B5C4',
      hexDark: '#7B8A9A',
      crownLight: '#C8D4E0',
      crownDark: '#A0AEBB',
      sparkle: '#E8F0F8',
      glow: 'rgba(123, 138, 154, 0.6)',
    },
  },
  5: {
    name: 'Gold',
    title: 'Emas',
    colors: {
      hexLight: '#FFD700',
      hexDark: '#CC9900',
      crownLight: '#FFEC4D',
      crownDark: '#E6B800',
      sparkle: '#FFFACD',
      glow: 'rgba(255, 215, 0, 0.6)',
    },
    lightModeColors: {
      hexLight: '#F59E0B',
      hexDark: '#D97706',
      crownLight: '#FCD34D',
      crownDark: '#F59E0B',
      sparkle: '#FEF3C7',
      glow: 'rgba(245, 158, 11, 0.6)',
    },
  },
  6: {
    name: 'Gold Elite',
    title: 'Emas Elite',
    colors: {
      hexLight: '#FFBF00',
      hexDark: '#B38600',
      crownLight: '#FFD54F',
      crownDark: '#D4A000',
      sparkle: '#FFF59D',
      glow: 'rgba(255, 191, 0, 0.7)',
    },
    lightModeColors: {
      hexLight: '#EAB308',
      hexDark: '#CA8A04',
      crownLight: '#FACC15',
      crownDark: '#EAB308',
      sparkle: '#FEF08A',
      glow: 'rgba(234, 179, 8, 0.7)',
    },
  },
  7: {
    name: 'Platinum',
    title: 'Platinum',
    colors: {
      hexLight: '#E5E4E2',
      hexDark: '#95A5A6',
      crownLight: '#F5F5F5',
      crownDark: '#BDC3C7',
      sparkle: '#FFFFFF',
      glow: 'rgba(229, 228, 226, 0.8)',
    },
    lightModeColors: {
      hexLight: '#64748B',
      hexDark: '#475569',
      crownLight: '#94A3B8',
      crownDark: '#64748B',
      sparkle: '#E2E8F0',
      glow: 'rgba(71, 85, 105, 0.6)',
    },
  },
  8: {
    name: 'Diamond',
    title: 'Berlian',
    colors: {
      hexLight: '#00CED1',
      hexDark: '#008B8B',
      crownLight: '#40E0D0',
      crownDark: '#20B2AA',
      sparkle: '#E0FFFF',
      glow: 'rgba(0, 206, 209, 0.6)',
    },
    lightModeColors: {
      hexLight: '#06B6D4',
      hexDark: '#0891B2',
      crownLight: '#22D3EE',
      crownDark: '#06B6D4',
      sparkle: '#CFFAFE',
      glow: 'rgba(6, 182, 212, 0.6)',
    },
  },
  9: {
    name: 'Master',
    title: 'Master',
    colors: {
      hexLight: '#9B59B6',
      hexDark: '#6C3483',
      crownLight: '#BB8FCE',
      crownDark: '#8E44AD',
      sparkle: '#E8DAEF',
      glow: 'rgba(155, 89, 182, 0.7)',
    },
    lightModeColors: {
      hexLight: '#A855F7',
      hexDark: '#9333EA',
      crownLight: '#C084FC',
      crownDark: '#A855F7',
      sparkle: '#F3E8FF',
      glow: 'rgba(168, 85, 247, 0.6)',
    },
  },
  10: {
    name: 'Legend',
    title: 'Legenda',
    colors: {
      hexLight: '#FF6B6B',
      hexDark: '#C0392B',
      crownLight: '#FF8E8E',
      crownDark: '#E74C3C',
      sparkle: '#FFEAA7',
      glow: 'rgba(255, 107, 107, 0.7)',
    },
    lightModeColors: {
      hexLight: '#EF4444',
      hexDark: '#DC2626',
      crownLight: '#F87171',
      crownDark: '#EF4444',
      sparkle: '#FEE2E2',
      glow: 'rgba(239, 68, 68, 0.6)',
    },
  },
};

// Role configuration for Admin/SuperAdmin
const ROLE_CONFIG: Record<string, {
  name: string;
  IconComponent: typeof IconCrown;
  colors: {
    hexLight: string;
    hexDark: string;
    crownLight: string;
    crownDark: string;
    sparkle: string;
    glow: string;
  };
  lightModeColors: {
    hexLight: string;
    hexDark: string;
    crownLight: string;
    crownDark: string;
    sparkle: string;
    glow: string;
  };
}> = {
  SUPERADMIN: {
    name: 'Super Admin',
    IconComponent: IconCrown,
    colors: {
      hexLight: '#FFD700',
      hexDark: '#B8860B',
      crownLight: '#FFEC4D',
      crownDark: '#DAA520',
      sparkle: '#FFFACD',
      glow: 'rgba(255, 215, 0, 0.7)',
    },
    lightModeColors: {
      hexLight: '#F59E0B',
      hexDark: '#D97706',
      crownLight: '#FCD34D',
      crownDark: '#F59E0B',
      sparkle: '#FEF3C7',
      glow: 'rgba(245, 158, 11, 0.7)',
    },
  },
  ADMIN: {
    name: 'Admin',
    IconComponent: IconShieldCheck,
    colors: {
      hexLight: '#3B82F6',
      hexDark: '#1D4ED8',
      crownLight: '#60A5FA',
      crownDark: '#2563EB',
      sparkle: '#DBEAFE',
      glow: 'rgba(59, 130, 246, 0.6)',
    },
    lightModeColors: {
      hexLight: '#2563EB',
      hexDark: '#1D4ED8',
      crownLight: '#3B82F6',
      crownDark: '#2563EB',
      sparkle: '#BFDBFE',
      glow: 'rgba(37, 99, 235, 0.6)',
    },
  },
};

// Crown Hexagon Badge SVG Component - Level Number Prominent
const CrownHexagonBadge = ({ 
  level, 
  colors, 
  size,
  showLevel = true,
  labelText,
}: { 
  level: number; 
  colors: typeof LEVEL_CONFIG[1]['colors']; 
  size: number;
  showLevel?: boolean;
  labelText?: string; // For Admin ("A") or SuperAdmin ("SA")
}) => {
  const id = `badge-${level}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 4px 8px ${colors.glow})` }}
    >
      <defs>
        {/* Hexagon gradient */}
        <linearGradient id={`hexGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.hexLight} />
          <stop offset="100%" stopColor={colors.hexDark} />
        </linearGradient>
        
        {/* Crown gradient */}
        <linearGradient id={`crownGrad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.crownLight} />
          <stop offset="100%" stopColor={colors.crownDark} />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Shadow under hexagon */}
      <ellipse cx="50" cy="92" rx="25" ry="5" fill="rgba(0,0,0,0.15)">
        <animate attributeName="rx" values="25;27;25" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      
      {/* Main Hexagon - rounded style */}
      <path 
        d="M50 8 L85 28 L85 68 L50 88 L15 68 L15 28 Z" 
        fill={`url(#hexGrad-${id})`}
        stroke={colors.hexDark}
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <animate attributeName="d" 
          values="M50 8 L85 28 L85 68 L50 88 L15 68 L15 28 Z;M50 6 L87 27 L87 69 L50 90 L13 69 L13 27 Z;M50 8 L85 28 L85 68 L50 88 L15 68 L15 28 Z" 
          dur="3s" 
          repeatCount="indefinite"
        />
      </path>
      
      {/* Inner glow effect */}
      <path 
        d="M50 15 L78 32 L78 64 L50 81 L22 64 L22 32 Z" 
        fill="none"
        stroke={colors.sparkle}
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      
      {/* Small Crown at top */}
      <g filter={`url(#glow-${id})`} transform="translate(0, -8)">
        {/* Crown base - smaller */}
        <path 
          d="M35 35 L37 25 L42 30 L50 20 L58 30 L63 25 L65 35 Z" 
          fill={`url(#crownGrad-${id})`}
          stroke={colors.crownDark}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Crown band */}
        <rect x="35" y="35" width="30" height="5" rx="1" fill={colors.crownDark} />
        
        {/* Crown jewels */}
        <circle cx="50" cy="23" r="2" fill={colors.sparkle}>
          <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="42" cy="28" r="1.5" fill={colors.sparkle}>
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="58" cy="28" r="1.5" fill={colors.sparkle}>
          <animate attributeName="opacity" values="1;0.8;1" dur="1.3s" repeatCount="indefinite"/>
        </circle>
      </g>
      
      {/* Level Number or Label Text - PROMINENT in center */}
      {(showLevel || labelText) && (
        <g>
          {/* Background circle for number/text */}
          <circle cx="50" cy="55" r="22" fill={colors.hexDark} fillOpacity="0.3"/>
          <circle cx="50" cy="55" r="20" fill="none" stroke={colors.sparkle} strokeWidth="2" strokeOpacity="0.5"/>
          
          {labelText ? (
            /* Label Text for Admin/SuperAdmin */
            <text 
              x="50" 
              y="62" 
              textAnchor="middle" 
              fontSize={labelText.length > 1 ? "18" : "24"} 
              fontWeight="bold" 
              fill="#FFFFFF"
              style={{ 
                fontFamily: 'Arial Black, sans-serif',
                textShadow: `0 2px 4px ${colors.hexDark}`,
              }}
            >
              {labelText}
            </text>
          ) : (
            /* Level Number for Members */
            <>
              <text 
                x="50" 
                y="63" 
                textAnchor="middle" 
                fontSize={level >= 10 ? "24" : "28"} 
                fontWeight="bold" 
                fill="#FFFFFF"
                style={{ 
                  fontFamily: 'Arial Black, sans-serif',
                  textShadow: `0 2px 4px ${colors.hexDark}`,
                }}
              >
                {level}
              </text>
              
              {/* "LV" label above number */}
              <text 
                x="50" 
                y="42" 
                textAnchor="middle" 
                fontSize="9" 
                fontWeight="bold" 
                fill={colors.sparkle}
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                LV
              </text>
            </>
          )}
        </g>
      )}
      
      {/* Sparkles - more sparkles for higher levels with wiggle animation */}
      <g>
        {/* Top right sparkle - wiggle */}
        <path d="M78 18 L80 22 L84 24 L80 26 L78 30 L76 26 L72 24 L76 22 Z" fill={colors.sparkle}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="-10 78 24;15 78 24;-10 78 24" dur="1.2s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="scale" values="1;1.3;1" dur="1.5s" repeatCount="indefinite" additive="sum"/>
        </path>
        
        {/* Left sparkle - wiggle */}
        <path d="M12 45 L14 48 L17 49 L14 50 L12 53 L10 50 L7 49 L10 48 Z" fill={colors.sparkle}>
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="15 12 49;-20 12 49;15 12 49" dur="1.4s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="scale" values="1;1.2;0.9;1" dur="1.6s" repeatCount="indefinite" additive="sum"/>
        </path>
        
        {/* Bottom left sparkle - wiggle */}
        <path d="M20 78 L21 80 L23 81 L21 82 L20 84 L19 82 L17 81 L19 80 Z" fill={colors.sparkle}>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.4s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="-15 20 81;20 20 81;-15 20 81" dur="1.3s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="scale" values="0.9;1.2;0.9" dur="1.1s" repeatCount="indefinite" additive="sum"/>
        </path>
        
        {/* Top left sparkle - new wiggle */}
        <path d="M22 22 L23 24 L25 25 L23 26 L22 28 L21 26 L19 25 L21 24 Z" fill={colors.sparkle}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="20 22 25;-15 22 25;20 22 25" dur="1.5s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="scale" values="1;1.4;1" dur="1.8s" repeatCount="indefinite" additive="sum"/>
        </path>
        
        {/* Bottom right sparkle - new wiggle */}
        <path d="M80 75 L81 77 L83 78 L81 79 L80 81 L79 79 L77 78 L79 77 Z" fill={colors.sparkle}>
          <animate attributeName="opacity" values="0.7;0.4;1;0.7" dur="1.3s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="-20 80 78;25 80 78;-20 80 78" dur="1.1s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="scale" values="1.1;0.8;1.3;1.1" dur="1.4s" repeatCount="indefinite" additive="sum"/>
        </path>
        
        {/* Extra sparkles for level 5+ */}
        {level >= 5 && (
          <>
            <path d="M88 50 L89 52 L91 53 L89 54 L88 56 L87 54 L85 53 L87 52 Z" fill={colors.sparkle}>
              <animate attributeName="opacity" values="1;0.4;1" dur="1.1s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="rotate" values="10 88 53;-25 88 53;10 88 53" dur="0.9s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="scale" values="1;1.4;1" dur="1.0s" repeatCount="indefinite" additive="sum"/>
            </path>
            <path d="M55 5 L56 8 L59 9 L56 10 L55 13 L54 10 L51 9 L54 8 Z" fill={colors.sparkle}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="rotate" values="-15 55 9;20 55 9;-15 55 9" dur="1.3s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="scale" values="0.9;1.3;0.9" dur="1.1s" repeatCount="indefinite" additive="sum"/>
            </path>
          </>
        )}
        
        {/* Extra sparkles for level 8+ */}
        {level >= 8 && (
          <>
            <path d="M45 2 L46 4 L48 5 L46 6 L45 8 L44 6 L42 5 L44 4 Z" fill={colors.sparkle}>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="0.9s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="rotate" values="25 45 5;-20 45 5;25 45 5" dur="0.8s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="scale" values="1;1.5;1" dur="0.9s" repeatCount="indefinite" additive="sum"/>
            </path>
            <path d="M92 35 L93 37 L95 38 L93 39 L92 41 L91 39 L89 38 L91 37 Z" fill={colors.sparkle}>
              <animate attributeName="opacity" values="1;0.5;1" dur="1.3s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="rotate" values="-20 92 38;30 92 38;-20 92 38" dur="1.0s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="scale" values="1.2;0.8;1.2" dur="1.2s" repeatCount="indefinite" additive="sum"/>
            </path>
            <path d="M8 65 L9 67 L11 68 L9 69 L8 71 L7 69 L5 68 L7 67 Z" fill={colors.sparkle}>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.0s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="rotate" values="15 8 68;-25 8 68;15 8 68" dur="1.1s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="scale" values="0.9;1.4;0.9" dur="0.95s" repeatCount="indefinite" additive="sum"/>
            </path>
          </>
        )}
      </g>
    </svg>
  );
};

interface LevelBadgeProps {
  level?: number;
  role?: UserRole;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level = 1, role = 'MEMBER', showLabel = false, size = 'md' }: LevelBadgeProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const levelConfig = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  const roleConfig = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
  
  // Select colors based on theme
  const levelColors = isDark ? levelConfig.colors : levelConfig.lightModeColors;
  
  // Size configurations
  const sizeConfig = {
    sm: { badge: 36, icon: 16 },
    md: { badge: 48, icon: 20 },
    lg: { badge: 60, icon: 24 },
  };
  
  const { badge: badgeSize } = sizeConfig[size];

  // For ADMIN and SUPERADMIN - use same Crown Hexagon badge with SA/A label
  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    const config = roleConfig;
    const roleColors = isDark ? config.colors : config.lightModeColors;
    const tooltipLabel = config.name;
    const labelText = role === 'SUPERADMIN' ? 'SA' : 'A';
    
    return (
      <Tooltip label={tooltipLabel} position="bottom" withArrow>
        <Box
          style={{
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <CrownHexagonBadge 
            level={0} 
            colors={roleColors} 
            size={badgeSize} 
            showLevel={false}
            labelText={labelText}
          />
        </Box>
      </Tooltip>
    );
  }
  
  // For MEMBER - Level badge with Crown Hexagon
  const tooltipLabel = `Level ${level} • ${levelConfig.name} (${levelConfig.title})`;
  
  const badgeContent = (
    <Box
      style={{
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <CrownHexagonBadge level={level} colors={levelColors} size={badgeSize} />
    </Box>
  );
  
  if (showLabel) {
    return (
      <Tooltip label={tooltipLabel} position="bottom" withArrow>
        <Group gap={8} style={{ cursor: 'pointer' }}>
          {badgeContent}
          <Box>
            <Text size="xs" fw={700} c={levelColors.hexLight} style={{ lineHeight: 1.2 }}>
              {levelConfig.name}
            </Text>
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.2, fontSize: 10 }}>
              Level {level}
            </Text>
          </Box>
        </Group>
      </Tooltip>
    );
  }
  
  return (
    <Tooltip label={tooltipLabel} position="bottom" withArrow>
      {badgeContent}
    </Tooltip>
  );
}

// ============================================
// CROWN BADGE - Premium Crown Emoji Style 👑
// ============================================

interface CrownBadgeProps {
  level?: number;
  size?: number;
}

// Crown colors based on level - Golden style with level-based accents
const CROWN_COLORS: Record<number, {
  base: string;
  dark: string;
  light: string;
  accent: string;
  accentDark: string;
  gem: string;
  gemShine: string;
}> = {
  1: { // Bronze
    base: '#CD853F',
    dark: '#8B4513',
    light: '#DEB887',
    accent: '#B8860B',
    accentDark: '#8B6914',
    gem: '#DC143C',
    gemShine: '#FF6B6B',
  },
  2: { // Silver  
    base: '#C0C0C0',
    dark: '#808080',
    light: '#E8E8E8',
    accent: '#A9A9A9',
    accentDark: '#696969',
    gem: '#4169E1',
    gemShine: '#87CEEB',
  },
  3: { // Gold
    base: '#FFD700',
    dark: '#B8860B',
    light: '#FFF8DC',
    accent: '#DAA520',
    accentDark: '#B8860B',
    gem: '#DC143C',
    gemShine: '#FF6B6B',
  },
  4: { // Platinum
    base: '#E5E4E2',
    dark: '#9E9E9E',
    light: '#FFFFFF',
    accent: '#B0C4DE',
    accentDark: '#778899',
    gem: '#00CED1',
    gemShine: '#7FFFD4',
  },
  5: { // Emerald
    base: '#FFD700',
    dark: '#B8860B',
    light: '#FFF8DC',
    accent: '#DAA520',
    accentDark: '#B8860B',
    gem: '#50C878',
    gemShine: '#98FB98',
  },
  6: { // Sapphire
    base: '#FFD700',
    dark: '#B8860B',
    light: '#FFF8DC',
    accent: '#DAA520',
    accentDark: '#B8860B',
    gem: '#0F52BA',
    gemShine: '#6495ED',
  },
  7: { // Ruby
    base: '#FFD700',
    dark: '#B8860B',
    light: '#FFF8DC',
    accent: '#DAA520',
    accentDark: '#B8860B',
    gem: '#E0115F',
    gemShine: '#FF69B4',
  },
  8: { // Amethyst
    base: '#FFD700',
    dark: '#B8860B',
    light: '#FFF8DC',
    accent: '#DAA520',
    accentDark: '#B8860B',
    gem: '#9966CC',
    gemShine: '#DDA0DD',
  },
  9: { // Diamond
    base: '#FFD700',
    dark: '#B8860B',
    light: '#FFF8DC',
    accent: '#DAA520',
    accentDark: '#B8860B',
    gem: '#B9F2FF',
    gemShine: '#FFFFFF',
  },
  10: { // Legendary
    base: '#FFD700',
    dark: '#FF8C00',
    light: '#FFFACD',
    accent: '#FFA500',
    accentDark: '#FF6347',
    gem: '#FF0000',
    gemShine: '#FF6B6B',
  },
};

export function CrownBadge({ level = 1, size = 60 }: CrownBadgeProps) {
  const colors = CROWN_COLORS[level] || CROWN_COLORS[3]; // Default to gold
  const id = `crown-${level}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg 
      width={size} 
      height={size * 0.75} 
      viewBox="0 0 120 90" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
      }}
    >
      <defs>
        {/* Main crown gradient - 3D effect */}
        <linearGradient id={`crownBody-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="30%" stopColor={colors.base} />
          <stop offset="70%" stopColor={colors.base} />
          <stop offset="100%" stopColor={colors.dark} />
        </linearGradient>
        
        {/* Side shading */}
        <linearGradient id={`crownSide-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.dark} />
          <stop offset="20%" stopColor={colors.base} />
          <stop offset="80%" stopColor={colors.base} />
          <stop offset="100%" stopColor={colors.dark} />
        </linearGradient>
        
        {/* Gem gradient */}
        <radialGradient id={`gem-${id}`} cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor={colors.gemShine} />
          <stop offset="50%" stopColor={colors.gem} />
          <stop offset="100%" stopColor={colors.gem} stopOpacity="0.8" />
        </radialGradient>
        
        {/* Band gradient */}
        <linearGradient id={`band-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.accent} />
          <stop offset="50%" stopColor={colors.accentDark} />
          <stop offset="100%" stopColor={colors.dark} />
        </linearGradient>
      </defs>
      
      {/* === CROWN MAIN BODY === */}
      {/* Smooth curved crown shape */}
      <path 
        d="M15 65 
           C15 65, 10 30, 20 25
           Q25 22, 30 35
           Q40 50, 45 40
           Q50 28, 60 20
           Q70 28, 75 40
           Q80 50, 90 35
           Q95 22, 100 25
           C110 30, 105 65, 105 65
           L15 65 Z" 
        fill={`url(#crownBody-${id})`}
      />
      
      {/* Crown body outline for depth */}
      <path 
        d="M15 65 
           C15 65, 10 30, 20 25
           Q25 22, 30 35
           Q40 50, 45 40
           Q50 28, 60 20
           Q70 28, 75 40
           Q80 50, 90 35
           Q95 22, 100 25
           C110 30, 105 65, 105 65" 
        fill="none"
        stroke={colors.dark}
        strokeWidth="2"
      />
      
      {/* Inner highlight curve */}
      <path 
        d="M22 55 
           Q25 35, 32 40
           Q42 50, 50 38
           Q58 50, 68 50
           Q78 50, 88 40
           Q95 35, 98 55" 
        fill="none"
        stroke={colors.light}
        strokeWidth="2"
        strokeOpacity="0.4"
      />
      
      {/* === CROWN BAND (底部) === */}
      <rect 
        x="12" 
        y="60" 
        width="96" 
        height="18" 
        rx="4" 
        fill={`url(#band-${id})`}
      />
      <rect 
        x="12" 
        y="60" 
        width="96" 
        height="18" 
        rx="4" 
        fill="none"
        stroke={colors.dark}
        strokeWidth="1.5"
      />
      
      {/* Band highlight */}
      <rect 
        x="16" 
        y="63" 
        width="88" 
        height="3" 
        rx="1.5" 
        fill={colors.light}
        fillOpacity="0.5"
      />
      
      {/* Band shadow line */}
      <rect 
        x="16" 
        y="72" 
        width="88" 
        height="2" 
        rx="1" 
        fill={colors.dark}
        fillOpacity="0.3"
      />
      
      {/* === TOP GEMS/BALLS === */}
      {/* Left ball */}
      <circle cx="20" cy="25" r="7" fill={`url(#gem-${id})`}>
        <animate attributeName="opacity" values="1;0.85;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="25" r="7" fill="none" stroke={colors.dark} strokeWidth="1"/>
      <circle cx="17" cy="22" r="2" fill="white" fillOpacity="0.8"/>
      
      {/* Center ball (top) */}
      <circle cx="60" cy="18" r="9" fill={`url(#gem-${id})`}>
        <animate attributeName="opacity" values="1;0.9;1" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="18" r="9" fill="none" stroke={colors.dark} strokeWidth="1.5"/>
      <circle cx="56" cy="14" r="2.5" fill="white" fillOpacity="0.9"/>
      
      {/* Right ball */}
      <circle cx="100" cy="25" r="7" fill={`url(#gem-${id})`}>
        <animate attributeName="opacity" values="0.9;1;0.9" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="100" cy="25" r="7" fill="none" stroke={colors.dark} strokeWidth="1"/>
      <circle cx="97" cy="22" r="2" fill="white" fillOpacity="0.8"/>
      
      {/* Mid-left ball */}
      <circle cx="38" cy="38" r="6" fill={`url(#gem-${id})`}>
        <animate attributeName="opacity" values="0.95;1;0.95" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="38" cy="38" r="6" fill="none" stroke={colors.dark} strokeWidth="1"/>
      <circle cx="36" cy="36" r="1.5" fill="white" fillOpacity="0.8"/>
      
      {/* Mid-right ball */}
      <circle cx="82" cy="38" r="6" fill={`url(#gem-${id})`}>
        <animate attributeName="opacity" values="1;0.92;1" dur="1.7s" repeatCount="indefinite"/>
      </circle>
      <circle cx="82" cy="38" r="6" fill="none" stroke={colors.dark} strokeWidth="1"/>
      <circle cx="80" cy="36" r="1.5" fill="white" fillOpacity="0.8"/>
      
      {/* === BAND GEMS === */}
      <circle cx="35" cy="69" r="4" fill={`url(#gem-${id})`}/>
      <circle cx="35" cy="69" r="4" fill="none" stroke={colors.dark} strokeWidth="0.8"/>
      <circle cx="33.5" cy="67.5" r="1" fill="white" fillOpacity="0.7"/>
      
      <circle cx="60" cy="69" r="5" fill={`url(#gem-${id})`}/>
      <circle cx="60" cy="69" r="5" fill="none" stroke={colors.dark} strokeWidth="0.8"/>
      <circle cx="58" cy="67" r="1.3" fill="white" fillOpacity="0.7"/>
      
      <circle cx="85" cy="69" r="4" fill={`url(#gem-${id})`}/>
      <circle cx="85" cy="69" r="4" fill="none" stroke={colors.dark} strokeWidth="0.8"/>
      <circle cx="83.5" cy="67.5" r="1" fill="white" fillOpacity="0.7"/>
    </svg>
  );
}

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 8px var(--glow-color, rgba(255,215,0,0.5)); }
    50% { box-shadow: 0 0 20px var(--glow-color, rgba(255,215,0,0.8)); }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('level-badge-styles')) {
  styleSheet.id = 'level-badge-styles';
  document.head.appendChild(styleSheet);
}
