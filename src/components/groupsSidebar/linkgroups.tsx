import { useState } from 'react';
import { Group, Box, Collapse, ThemeIcon, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../shared/hooks';

interface LinksGroupProps {
  icon?: React.ComponentType<any>;
  label: string;
  initiallyOpened?: boolean;
  links?: Array<{ label: string; link: string }>;
  link?: string;
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links, link }: LinksGroupProps) {
  const [opened, setOpened] = useState(initiallyOpened || false);
  const location = useLocation();
  const navigate = useNavigate();
  const { COLORS, isDark } = useDarkMode();

  const isActive = link ? location.pathname === link : false;
  const isChildActive = links?.some((item) => location.pathname === item.link);
  const blueLogoColor = isDark ? "#0665fc" : "#3b82f6";

  const handleClick = () => {
    if (links) {
      setOpened(!opened);
    } else if (link) {
      navigate(link);
    }
  };

  return (
    <>
      <style>{`
        @keyframes drop-circle {
          0% { transform: translateY(-8px) scale(0); opacity: 0; }
          40% { transform: translateY(0) scale(1.12); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        @keyframes drop-ripple {
          0% { transform: scale(0); opacity: 0.28; }
          60% { transform: scale(1.6); opacity: 0.12; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
      <Group
        justify="space-between"
        className="menu-item"
        style={{
          position: 'relative',
          padding: '10px 12px',
          marginBottom: '8px',
          borderRadius: '12px',
          cursor: 'pointer',
          backgroundColor: isActive || isChildActive ? `rgba(59, 130, 246, 0.12)` : 'transparent',
          boxShadow: isActive || isChildActive ? '0 6px 20px rgba(59,130,246,0.06)' : 'none',
          transition: 'all 0.22s cubic-bezier(0.2, 0, 0.2, 1)',
          transform: isActive ? 'translateX(4px)' : 'translateX(0)',
        }}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!isActive && !isChildActive) {
            e.currentTarget.style.backgroundColor = isDark ? "#1a1b1e" : "#f3f4f6";
            e.currentTarget.style.transform = 'translateX(4px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive && !isChildActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateX(0)';
          }
        }}
      >
        {/* Active indicator removed to avoid duplicate edge indicator with sidebar resize handle */}

        <Group gap="sm" style={{ flex: 1 }}>
          {Icon && (
            <ThemeIcon
              variant="filled"
              size={40}
              radius={10}
              style={{
                backgroundColor: isActive || isChildActive ? 'white' : (isDark ? '#111217' : '#f1f5f9'),
                color: isActive || isChildActive ? blueLogoColor : (isDark ? COLORS.text.secondary : '#6b7280'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isActive || isChildActive ? 'inset 0 0 0 2px rgba(59,130,246,0.08)' : 'none',
              }}
            >
              <Icon size={18} />
            </ThemeIcon>
          )}
          <Text
            size="sm"
            fw={isActive || isChildActive ? 600 : 500}
            style={{
              color: isActive || isChildActive ? blueLogoColor : COLORS.text.primary,
              transition: 'all 0.2s ease',
            }}
          >
            {label}
          </Text>
        </Group>

        {links && (
          <IconChevronRight
            size={16}
            style={{
              transform: opened ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: COLORS.text.tertiary,
            }}
          />
        )}
      </Group>

      {links && (
        <Collapse in={opened}>
          <Box style={{ paddingLeft: '32px', paddingTop: '8px', paddingBottom: '8px' }}>
            {links.map((item) => {
              const isChildItemActive = location.pathname === item.link;
              return (
                <Group
                  key={item.link}
                  justify="space-between"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isChildItemActive ? `rgba(59, 130, 246, 0.1)` : 'transparent',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px',
                  }}
                  onClick={() => navigate(item.link)}
                  onMouseEnter={(e) => {
                    if (!isChildItemActive) {
                      e.currentTarget.style.backgroundColor = isDark ? "#1a1b1e" : "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isChildItemActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Group gap={8} style={{ flex: 1 }}>
                    <Box
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: isChildItemActive ? blueLogoColor : COLORS.text.tertiary,
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <Text
                      size="sm"
                      fw={isChildItemActive ? 600 : 500}
                      style={{
                        color: isChildItemActive ? blueLogoColor : COLORS.text.secondary,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </Text>
                  </Group>
                </Group>
              );
            })}
          </Box>
        </Collapse>
      )}
    </>
  );
}