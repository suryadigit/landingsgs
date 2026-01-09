import {
  IconDashboard,
  IconFileText,
  IconMoneybagPlus,
  IconCards,
  IconReceipt,
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarLeftExpandFilled,
  IconLogout,
  IconBrandWhatsapp,
  IconWallet,
  IconCash,
  IconNetwork,
  IconUser,
  IconBell,
  IconShield,
  IconSettings,
  IconUsers,
  IconListCheck,
  IconBuildingBank,
  IconChecks,
} from '@tabler/icons-react';
import { Group, ScrollArea, Box, Text, Divider, Button } from '@mantine/core';
import { LinksGroup } from '../groupsSidebar/linkgroups';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useSidebar } from '../../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth.context';
import { useState, useEffect, useMemo } from 'react';
import { getUserMenus, type MenuItem } from '../../api/auth';
const dark = document.documentElement.getAttribute('data-theme') === 'dark';

// Icon mapping dari backend icon string ke Tabler Icons
const ICON_MAP: Record<string, any> = {
  'dashboard': IconDashboard,
  'dashboard-admin': IconDashboard,
  'cards': IconCards,
  'history': IconMoneybagPlus,
  'wallet': IconWallet,
  'money': IconCash,
  'network': IconNetwork,
  'user': IconUser,
  'bell': IconBell,
  'check-circle': IconChecks,
  'bank': IconBuildingBank,
  'list': IconListCheck,
  'users': IconUsers,
  'settings': IconSettings,
  'shield': IconShield,
  'file-text': IconFileText,
  'receipt': IconReceipt,
  'profile': IconUser,
};

// Fallback menu jika backend belum ready atau error (untuk MEMBER)
const FALLBACK_MENUS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', link: '/dashboard', order: 1 },
  { id: 'notifications', label: 'Notifikasi', icon: 'bell', link: '/notifications', order: 2 },
  { id: 'referral', label: 'Komisi Referral', icon: 'file-text', link: '/referral', order: 3 },
  { id: 'commission-history', label: 'Riwayat Komisi', icon: 'history', link: '/commission', order: 4 },
  { id: 'wallet', label: 'Dompet', icon: 'cards', link: '/withdrawal', order: 5 },
  { id: 'profile', label: 'Profil', icon: 'profile', link: '/profile', order: 99 },
];

// Fallback admin menus (untuk ADMIN/SUPERADMIN)
const FALLBACK_ADMIN_MENUS = [
  { id: 'dashboard-admin', label: 'Dashboard Admin', icon: 'dashboard-admin', link: '/admin/dashboard', order: 1, isAdmin: true },
  { id: 'notifications', label: 'Notifikasi', icon: 'bell', link: '/notifications', order: 2, isAdmin: true },
  { id: 'approval-commission', label: 'Approval Komisi', icon: 'check-circle', link: '/approval-commission', order: 3, isAdmin: true },
  { id: 'user-management', label: 'Kelola User', icon: 'users', link: '/admin/users', order: 4, isAdmin: true },
  { id: 'role-management', label: 'Manajemen Role', icon: 'shield', link: '/admin/roles', order: 5, isAdmin: true },
  { id: 'profile', label: 'Profil', icon: 'profile', link: '/profile', order: 99, isAdmin: true },
];

export const SidebarContent = () => {
  const { COLORS, isDark } = useDarkMode();
  const { isOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Direct check from localStorage
  const tokenKey = import.meta.env.VITE_TOKEN_KEY || 'auth_token';
  const hasToken = !!localStorage.getItem(tokenKey);

  // State untuk menu dari backend
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [adminMenus, setAdminMenus] = useState<MenuItem[]>([]);

  // Helper: Convert sidebarMenu from login response to MenuItem format
  const convertSidebarMenuToMenuItem = (sidebarMenu: any[]): MenuItem[] => {
    return sidebarMenu.map(item => ({
      id: item.key || item.id,
      label: item.label,
      icon: item.icon,
      link: item.path || item.link,
      order: item.order,
      requiredPermission: '',
    }));
  };

  // Load menus: Priority 1 = sidebarMenu from login, Priority 2 = API, Priority 3 = fallback
  useEffect(() => {
    const loadMenus = async () => {
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
      console.log("🔄 Loading menus, isAdmin:", isAdmin, "user role:", user?.role);

      // Priority 1: Check if user has sidebarMenu from login response (stored in user_profile)
      try {
        const userProfileStr = localStorage.getItem('user_profile');
        if (userProfileStr) {
          const userProfile = JSON.parse(userProfileStr);
          console.log("📦 User profile from localStorage:", userProfile);
          
          // If sidebarMenu exists in user_profile, use it directly
          if (userProfile.sidebarMenu && userProfile.sidebarMenu.length > 0) {
            const convertedMenus = convertSidebarMenuToMenuItem(userProfile.sidebarMenu);
            console.log("📋 Converted member menus:", convertedMenus);
            setMenus(convertedMenus);
            
            // Also set admin menus if available
            if (userProfile.adminMenu && userProfile.adminMenu.length > 0) {
              const convertedAdminMenus = convertSidebarMenuToMenuItem(userProfile.adminMenu);
              console.log("👑 Converted admin menus:", convertedAdminMenus);
              setAdminMenus(convertedAdminMenus);
            } else if (isAdmin) {
              console.log("⚠️ No adminMenu in profile, using fallback for admin");
              setAdminMenus(FALLBACK_ADMIN_MENUS as MenuItem[]);
            }
            
            return; // Don't fetch from API if we have menu from login
          }
        }
      } catch (e) {
        console.error('Error parsing user_profile:', e);
      }

      // Priority 2: Fetch from API (only if no sidebarMenu in profile)
      if (hasToken) {
        try {
          const response = await getUserMenus();
          setMenus(response.menus);
          
          if (isAdmin && (!response.adminMenus || response.adminMenus.length === 0)) {
            setAdminMenus(FALLBACK_ADMIN_MENUS as MenuItem[]);
          } else {
            setAdminMenus(response.adminMenus || []);
          }
        } catch (error) {
          console.error('Failed to fetch menus:', error);
          // Priority 3: Fallback menus only on error
          setMenus(FALLBACK_MENUS as MenuItem[]);
          if (isAdmin) {
            setAdminMenus(FALLBACK_ADMIN_MENUS as MenuItem[]);
          }
        }
      }
    };

    loadMenus();
  }, [hasToken, user?.role]); // Depend on token and user role

  // Listen untuk event userProfileUpdated - reload menus from localStorage
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const userProfile = event.detail?.user;
      if (userProfile?.sidebarMenu && userProfile.sidebarMenu.length > 0) {
        const convertedMenus = convertSidebarMenuToMenuItem(userProfile.sidebarMenu);
        setMenus(convertedMenus);
        
        if (userProfile.adminMenu && userProfile.adminMenu.length > 0) {
          setAdminMenus(convertSidebarMenuToMenuItem(userProfile.adminMenu));
        }
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate as any);
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as any);
    };
  }, []);

  // Show sidebar if token exists OR if authenticated
  const shouldShowSidebar = hasToken || isAuthenticated;
  
  if (!shouldShowSidebar) {
    return null;
  }

  // Check if user is admin/superadmin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  // Convert backend menus to component format
  // For Admin/SuperAdmin: combine both menus (member menus they have access to + admin menus)
  // For Member: use menus only
  const menuToDisplay = useMemo(() => {
    let allMenus: MenuItem[];
    
    if (isAdmin) {
      // Admin uses both: member menus (that they have access to) + admin menus
      if (menus.length > 0 || adminMenus.length > 0) {
        allMenus = [...menus, ...adminMenus];
      } else {
        // Use fallback if no menus loaded
        allMenus = [...FALLBACK_ADMIN_MENUS as MenuItem[]];
      }
    } else {
      // Member uses regular menus only
      if (menus.length > 0) {
        allMenus = [...menus];
      } else {
        allMenus = [...FALLBACK_MENUS as MenuItem[]];
      }
    }
    
    // Sort by order
    allMenus.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return allMenus.map(menu => ({
      label: menu.label,
      icon: ICON_MAP[menu.icon] || IconDashboard,
      link: menu.link,
    }));
  }, [menus, adminMenus, isAdmin]);

  return (
    <>
      {/* Header */}
      <div style={{
        padding: isOpen ? '12px 16px' : '12px 8px',
        flexShrink: 0,
        backgroundColor: COLORS.bg.primary,
        display: 'flex',
        justifyContent: isOpen ? 'space-between' : 'center',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Box 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0, 
            padding: 0, 
            margin: 0,
            width: isOpen ? 'auto' : 0,
            opacity: isOpen ? 1 : 0,
            overflow: 'hidden',
            transition: isOpen ? 'opacity 0.25s cubic-bezier(0.25, 0.1, 0.25, 1) 0.15s' : 'none',
          }}
        >
          <img
            src="/LogoDMLC.webp"
            alt="DMLC Logo"
            style={{ width: 100, height: 32, objectFit: 'contain', borderRadius: 6, display: 'block' }}
          />
        </Box>

        {/* Toggle Button */}
        <Button
          variant="subtle"
          onClick={toggleSidebar}
          p={8}
          style={{
            color: COLORS.text.dark,
            minHeight: 'auto',
            width: 36,
            height: 36,
            borderRadius: 6,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = dark ? "#2c2e33" : "#e5e7eb";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
          title={isOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          {isOpen ? <IconLayoutSidebarLeftCollapseFilled size={18} /> : <IconLayoutSidebarLeftExpandFilled size={18} />}
        </Button>
      </div>

      {/* Links Container - Both views rendered */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Expanded view */}
        <ScrollArea 
          style={{ 
            position: 'absolute',
            inset: 0,
            padding: '8px 0',
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transition: isOpen ? 'opacity 0.25s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s' : 'none',
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
        >
          <div style={{ padding: '0 12px' }}>
            {menuToDisplay.map((item) => <LinksGroup {...item} key={item.label} />)}
          </div>
        </ScrollArea>
        
        {/* Collapsed view with icons only */}
        <div style={{ 
          position: 'absolute',
          inset: 0,
          padding: '8px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '6px',
          justifyContent: 'space-between',
          opacity: isOpen ? 0 : 1,
          visibility: isOpen ? 'hidden' : 'visible',
          transition: isOpen ? 'none' : 'opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1) 0.15s',
          pointerEvents: isOpen ? 'none' : 'auto',
        }}>
          {/* Menu Icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuToDisplay.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.link;
              return (
                <Box
                  key={item.label}
                  onClick={() => navigate(item.link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive 
                      ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                      : 'transparent',
                    color: isActive ? '#3b82f6' : (isDark ? '#a1a1a1' : '#64748b'),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    }
                  }}
                  title={item.label}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </Box>
              );
            })}
          </div>
          
          {/* Bottom Icons - WhatsApp & Logout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: 8 }}>
            {/* WhatsApp */}
            <a
              href={`https://wa.me/6281234567890?text=${encodeURIComponent('Halo, saya butuh bantuan terkait akun SGS Affiliate.')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(37, 211, 102, 0.1)',
                  color: '#25D366',
                  animation: 'wa-pulse-collapsed 2s infinite',
                }}
                title="WhatsApp Bantuan"
              >
                <IconBrandWhatsapp size={20} strokeWidth={1.5} />
              </Box>
            </a>
            
            {/* Logout */}
            <Box
              onClick={() => {
                localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY || 'auth_token');
                localStorage.removeItem('user_profile');
                window.location.href = '/login';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              title="Logout"
            >
              <IconLogout size={18} strokeWidth={1.5} />
            </Box>
            
            <style>
              {`
                @keyframes wa-pulse-collapsed {
                  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); }
                  50% { box-shadow: 0 0 8px 2px rgba(37, 211, 102, 0.2); }
                  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); }
                }
              `}
            </style>
          </div>
        </div>
      </div>

      {/* Footer - User Section with smooth transition */}
      <div
        style={{
          padding: '12px 12px 16px 12px',
          flexShrink: 0,
          backgroundColor: COLORS.bg.primary,
          opacity: isOpen ? 1 : 0,
          maxHeight: isOpen ? '150px' : '0px',
          overflow: 'hidden',
          transition: isOpen ? 'opacity 0.25s cubic-bezier(0.25, 0.1, 0.25, 1) 0.15s, max-height 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s' : 'none',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <Divider mb={12} />

          {/* WhatsApp Help Shortcut */}
          {(() => {
            const WA_NUMBER = '6281234567890';
            const WA_MESSAGE = 'Halo, saya butuh bantuan terkait akun SGS Affiliate.';
            const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Group
                  justify="space-between"
                  align="center"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(37, 211, 102, 0.1)',
                    border: '1px solid rgba(37, 211, 102, 0.2)',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(37, 211, 102, 0.15)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(37, 211, 102, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(37, 211, 102, 0.1)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(37, 211, 102, 0.2)';
                  }}
                >
                  <Group gap={12} align="center" style={{ flex: 1 }}>
                    <Box
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        flexShrink: 0,
                        animation: 'wa-pulse 2s infinite',
                      }}
                      aria-hidden
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </Box>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={600} size="sm" style={{ color: '#25D366', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        WhatsApp
                      </Text>
                      <Text size="xs" style={{ color: isDark ? 'rgba(37, 211, 102, 0.7)' : 'rgba(37, 211, 102, 0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Bantuan
                      </Text>
                    </Box>
                  </Group>

                  <Box style={{ color: '#25D366', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>›</Box>
                </Group>
                <style>
                  {`
                    @keyframes wa-pulse {
                      0% {
                        box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
                      }
                      50% {
                        box-shadow: 0 0 12px 4px rgba(37, 211, 102, 0.3);
                      }
                      100% {
                        box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
                      }
                    }
                  `}
                </style>
              </a>
            );
          })()}
        </div>
    </>
  );
};

export function DesktopNavbar() {
  const { COLORS } = useDarkMode();

  return (
    <nav style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: COLORS.bg.primary,
      padding: 0,
    }}>
      <SidebarContent />
    </nav>
  );
}

// Mobile Sidebar Content - Clean and Simple
interface MobileSidebarContentProps {
  onClose: () => void;
}

export function MobileSidebarContent({ onClose }: MobileSidebarContentProps) {
  const { COLORS, isDark } = useDarkMode();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const tokenKey = import.meta.env.VITE_TOKEN_KEY || 'auth_token';
  const hasToken = !!localStorage.getItem(tokenKey);

  // State untuk menu dari backend
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [adminMenus, setAdminMenus] = useState<MenuItem[]>([]);

  // Helper: Convert sidebarMenu from login response to MenuItem format
  const convertSidebarMenuToMenuItem = (sidebarMenu: any[]): MenuItem[] => {
    return sidebarMenu.map(item => ({
      id: item.key || item.id,
      label: item.label,
      icon: item.icon,
      link: item.path || item.link,
      order: item.order,
      requiredPermission: '',
    }));
  };

  // Load menus from user_profile or API
  useEffect(() => {
    // Only run once on mount
    if (menus.length > 0) return;
    
    const loadMenus = async () => {
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

      // Priority 1: Check sidebarMenu from user_profile
      try {
        const userProfileStr = localStorage.getItem('user_profile');
        if (userProfileStr) {
          const userProfile = JSON.parse(userProfileStr);
          if (userProfile.sidebarMenu && userProfile.sidebarMenu.length > 0) {
            setMenus(convertSidebarMenuToMenuItem(userProfile.sidebarMenu));
            if (userProfile.adminMenu && userProfile.adminMenu.length > 0) {
              setAdminMenus(convertSidebarMenuToMenuItem(userProfile.adminMenu));
            } else if (isAdmin) {
              setAdminMenus(FALLBACK_ADMIN_MENUS as MenuItem[]);
            }
            return;
          }
        }
      } catch {
        // Continue to API fetch
      }

      // Priority 2: Fetch from backend
      if (hasToken) {
        try {
          const response = await getUserMenus();
          setMenus(response.menus);
          setAdminMenus(response.adminMenus || []);
        } catch {
          // Use fallback menus
          setMenus(FALLBACK_MENUS as MenuItem[]);
          if (isAdmin) {
            setAdminMenus(FALLBACK_ADMIN_MENUS as MenuItem[]);
          }
        }
      }
    };

    loadMenus();
  }, [hasToken]); // Only depend on hasToken

  const shouldShowSidebar = hasToken || isAuthenticated;
  if (!shouldShowSidebar) return null;

  // Convert backend menus to component format
  const menuToDisplay = useMemo(() => {
    const allMenus = [...menus, ...adminMenus];
    return allMenus.map(menu => ({
      label: menu.label,
      icon: ICON_MAP[menu.icon] || IconDashboard,
      link: menu.link,
    }));
  }, [menus, adminMenus]);

  const handleNavigate = (link: string) => {
    navigate(link);
    onClose();
  };

  return (
    <>
      {/* Menu Items */}
      <ScrollArea style={{ flex: 1 }}>
        <Box p="md">
          {menuToDisplay.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.link;
            
            return (
              <Box
                key={item.label}
                onClick={() => handleNavigate(item.link)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  marginBottom: 4,
                  backgroundColor: isActive 
                    ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                    : 'transparent',
                  color: isActive ? '#3b82f6' : COLORS.text.dark,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={20} strokeWidth={1.5} />
                <Text size="sm" fw={isActive ? 600 : 500}>
                  {item.label}
                </Text>
              </Box>
            );
          })}
        </Box>
      </ScrollArea>

      {/* Footer - WhatsApp Help */}
      <Box
        style={{
          padding: '16px',
          borderTop: `1px solid ${COLORS.border}`,
          flexShrink: 0,
        }}
      >
        <a
          href={`https://wa.me/6281234567890?text=${encodeURIComponent('Halo, saya butuh bantuan terkait akun SGS Affiliate.')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              backgroundColor: 'rgba(37, 211, 102, 0.1)',
              border: '1px solid rgba(37, 211, 102, 0.2)',
            }}
          >
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                animation: 'wa-pulse-mobile 2s infinite',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </Box>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={600} style={{ color: '#25D366' }}>
                Butuh Bantuan?
              </Text>
              <Text size="xs" style={{ color: 'rgba(37, 211, 102, 0.7)' }}>
                Chat via WhatsApp
              </Text>
            </Box>
          </Box>
          <style>
            {`
              @keyframes wa-pulse-mobile {
                0% {
                  box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
                }
                50% {
                  box-shadow: 0 0 12px 4px rgba(37, 211, 102, 0.3);
                }
                100% {
                  box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
                }
              }
            `}
          </style>
        </a>
      </Box>
    </>
  );
}