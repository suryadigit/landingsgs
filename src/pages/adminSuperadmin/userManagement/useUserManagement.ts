import { useState, useEffect, useCallback } from 'react';
import { 
  getUsers, 
  getUserDetail, 
  updateUserAccess,
  updateUserStatus,
  changeUserRole,
  type UserListItem, 
  type UserDetail,
  type UpdateUserAccessRequest,
  type AvailableMenu,
  type AvailablePermission 
} from '../../../api/admin';

interface UseUserManagementReturn {
  // List state
  users: UserListItem[];
  isLoadingUsers: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Detail state
  selectedUser: UserDetail | null;
  isLoadingDetail: boolean;
  availableMenus: AvailableMenu[];
  availablePermissions: AvailablePermission[];
  
  // Modal state
  isDetailModalOpen: boolean;
  
  // Saving state
  isSaving: boolean;
  
  // Messages
  error: string | null;
  success: string | null;
  
  // Filters
  searchQuery: string;
  roleFilter: string;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: string) => void;
  setPage: (page: number) => void;
  fetchUsers: () => Promise<void>;
  openUserDetail: (userId: string) => Promise<void>;
  closeDetailModal: () => void;
  updateUser: (data: UpdateUserAccessRequest) => Promise<boolean>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<boolean>;
  quickChangeRole: (userId: string, role: "MEMBER" | "ADMIN" | "SUPERADMIN") => Promise<boolean>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

export function useUserManagement(): UseUserManagementReturn {
  // List state
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // Detail state
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [availableMenus, setAvailableMenus] = useState<AvailableMenu[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermission[]>([]);
  
  // Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  
  // Messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setError(null); 
    
    try {
      const response = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
      });
      
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data user');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, roleFilter]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open user detail modal
  const openUserDetail = useCallback(async (userId: string) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true);
    setError(null);
    
    try {
      const response = await getUserDetail(userId);
      setSelectedUser(response.user);
      setAvailableMenus(response.availableMenus);
      setAvailablePermissions(response.availablePermissions);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat detail user');
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // Close detail modal
  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
    setAvailableMenus([]);
    setAvailablePermissions([]);
  }, []);

  // Update user access
  const updateUser = useCallback(async (data: UpdateUserAccessRequest): Promise<boolean> => {
    if (!selectedUser) return false;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateUserAccess(selectedUser.id, data);
      setSuccess('Akses user berhasil diperbarui');
      
      // Refresh users list
      await fetchUsers();
      
      // Refresh selected user detail
      const response = await getUserDetail(selectedUser.id);
      setSelectedUser(response.user);
      setAvailableMenus(response.availableMenus);
      setAvailablePermissions(response.availablePermissions);
      
      // Check if updating current logged-in user - refresh sidebar immediately
      const currentUserProfile = localStorage.getItem('user_profile');
      if (currentUserProfile) {
        try {
          const profile = JSON.parse(currentUserProfile);
          console.log('Checking profile update:', { profileId: profile.id, selectedUserId: selectedUser.id });
          
          if (profile.id === selectedUser.id) {
            // Update localStorage with new menus from availableMenus (filtered by menuAccess)
            const enabledMenus = response.availableMenus
              .filter((menu: AvailableMenu) => menu.isEnabled)
              .map((menu: AvailableMenu, index: number) => ({
                key: menu.menuId,
                id: menu.id,
                menuId: menu.menuId,
                label: menu.label,
                path: menu.link,
                icon: menu.icon,
                order: menu.order || index + 1,
                isAdmin: menu.isAdmin,
              }));
            
            if (enabledMenus.length > 0) {
              profile.sidebarMenu = enabledMenus;
              localStorage.setItem('user_profile', JSON.stringify(profile));
              
              console.log('Updated sidebar menus:', enabledMenus);
              
              // Dispatch event to update sidebar immediately
              window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
                detail: { user: profile }
              }));
            }
          }
        } catch (e) {
          console.warn('Failed to update current user sidebar:', e);
        }
      }
      
      // Clear success after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui akses user');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedUser, fetchUsers]);

  // Toggle user status (activate/deactivate)
  const toggleUserStatus = useCallback(async (userId: string, isActive: boolean): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    
    try {
      await updateUserStatus(userId, isActive);
      setSuccess(`User berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      
      // Refresh users list
      await fetchUsers();
      
      // Clear success after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status user');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchUsers]);

  // Quick change role
  const quickChangeRole = useCallback(async (userId: string, role: "MEMBER" | "ADMIN" | "SUPERADMIN"): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    
    try {
      await changeUserRole(userId, role);
      setSuccess(`Role user berhasil diubah ke ${role}`);
      
      // Refresh users list
      await fetchUsers();
      
      // Clear success after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah role user');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchUsers]);

  // Set page
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  return {
    // List state
    users,
    isLoadingUsers,
    pagination,
    
    // Detail state
    selectedUser,
    isLoadingDetail,
    availableMenus,
    availablePermissions,
    
    // Modal state
    isDetailModalOpen,
    
    // Saving state
    isSaving,
    
    // Messages
    error,
    success,
    
    // Filters
    searchQuery,
    roleFilter,
    
    // Actions
    setSearchQuery,
    setRoleFilter,
    setPage,
    fetchUsers,
    openUserDetail,
    closeDetailModal,
    updateUser,
    toggleUserStatus,
    quickChangeRole,
    setError,
    setSuccess,
  };
}
