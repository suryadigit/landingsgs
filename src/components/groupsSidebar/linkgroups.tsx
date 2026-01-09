import { useState } from 'react';
import { Group, Box, Collapse, ThemeIcon, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';

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
      <Group
        justify="space-between"
        className="menu-item"
        style={{
          padding: '12px 12px',
          marginBottom: '8px',
          borderRadius: '8px',
          cursor: 'pointer',
          backgroundColor: isActive || isChildActive ? `rgba(59, 130, 246, 0.1)` : 'transparent',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
        <Group gap="sm" style={{ flex: 1 }}>
          {Icon && (
            <ThemeIcon
              variant="light"
              size="lg"
              radius="md"
              style={{
                backgroundColor: isActive || isChildActive ? blueLogoColor : (isDark ? "#2c2e33" : "#e5e7eb"),
                color: isActive || isChildActive ? 'white' : (isDark ? COLORS.text.secondary : "#6b7280"),
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