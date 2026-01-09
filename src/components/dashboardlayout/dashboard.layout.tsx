import React, { useState } from 'react';
import { AppShell, Box, Drawer, ActionIcon } from '@mantine/core';
import { DesktopNavbar, MobileSidebarContent } from '../sidebars/sidebars';
import { DashboardHeader } from '../headers/headers';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useMediaQuery } from '@mantine/hooks';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  headerProps?: {
    userName?: string;
    userLevel?: string;
    notificationCount?: number;
  };
}

export function DashboardLayout({ 
  children,
  headerProps = {}
}: DashboardLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { COLORS } = useDarkMode();
  const { isOpen } = useSidebar();
  const location = useLocation();

  // Calculate navbar width based on sidebar state
  const navbarWidth = isOpen ? 280 : 60;

  return (
    <AppShell
      layout="alt"
      header={{
        height: isMobile ? 60 : 70,
      }}
      navbar={!isMobile ? {
        width: navbarWidth,
        breakpoint: 'sm',
        collapsed: { mobile: true, desktop: false },
      } : undefined}
      styles={{
        main: {
          backgroundColor: COLORS.bg.primary,
        },
      }}
    >
      <AppShell.Header
        style={{
          backgroundColor: COLORS.bg.primary,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: isMobile ? 12 : 0,
          paddingRight: isMobile ? 12 : 0,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Mobile Hamburger Menu */}
        {isMobile && (
          <ActionIcon
            variant="subtle"
            onClick={() => setSidebarOpen(true)}
            size="lg"
            radius="md"
            style={{ color: COLORS.text.dark, flexShrink: 0 }}
          >
            <IconMenu2 size={22} />
          </ActionIcon>
        )}

        <Box style={{ flex: 1, minWidth: 0 }}>
          <DashboardHeader {...(headerProps as any)} />
        </Box>
      </AppShell.Header>

      {/* Desktop Navbar */}
      {!isMobile && (
        <AppShell.Navbar
          style={{
            backgroundColor: COLORS.bg.primary,
            overflow: 'hidden',
            width: navbarWidth,
            transition: 'width 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
            willChange: 'width',
          }}
        >
          {/* Always show navbar content, even while loading user profile */}
          {/* The sidebar will handle showing/hiding based on token availability */}
          <DesktopNavbar />
        </AppShell.Navbar>
      )}

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Drawer
          opened={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          title={null}
          padding={0}
          size={280}
          styles={{
            content: {
              backgroundColor: COLORS.bg.primary,
            },
            header: {
              display: 'none',
            },
            body: {
              padding: 0,
              height: '100%',
            },
          }}
        >
          <Box style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
            {/* Header dengan Logo dan Close Button */}
            <Box
              style={{
                padding: '16px',
                borderBottom: `1px solid ${COLORS.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src="/LogoDMLC.webp"
                alt="DMLC Logo"
                style={{ width: 100, height: 32, objectFit: 'contain' }}
              />
              <ActionIcon
                variant="subtle"
                onClick={() => setSidebarOpen(false)}
                size="lg"
                radius="md"
                style={{ color: COLORS.text.dark }}
              >
                <IconX size={20} />
              </ActionIcon>
            </Box>

            {/* Menu Items */}
            <MobileSidebarContent onClose={() => setSidebarOpen(false)} />
          </Box>
        </Drawer>
      )}

      <AppShell.Main style={{ backgroundColor: COLORS.bg.primary }}>
        <Box 
          key={location.pathname}
          className="page-content"
          style={{
            animation: 'fadeIn 0.35s ease-out',
            height: '100%',
          }}
        >
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}