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
} from '../../../features/admin';

interface UseUserManagementReturn {
  users: UserListItem[];
  isLoadingUsers: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  selectedUser: UserDetail | null;
  isLoadingDetail: boolean;
  availableMenus: AvailableMenu[];
  availablePermissions: AvailablePermission[];
  
  isDetailModalOpen: boolean;
  
  isSaving: boolean;
  
  error: string | null;
  success: string | null;
  
  searchQuery: string;
  roleFilter: string;
  
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
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [availableMenus, setAvailableMenus] = useState<AvailableMenu[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermission[]>([]);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
    setAvailableMenus([]);
    setAvailablePermissions([]);
  }, []);

  const updateUser = useCallback(async (data: UpdateUserAccessRequest): Promise<boolean> => {
    if (!selectedUser) return false;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateUserAccess(selectedUser.id, data);
      setSuccess('Akses user berhasil diperbarui');
      
      await fetchUsers();
      
      const response = await getUserDetail(selectedUser.id);
      setSelectedUser(response.user);
      setAvailableMenus(response.availableMenus);
      setAvailablePermissions(response.availablePermissions);
      
      const currentUserProfile = localStorage.getItem('user_profile');
      if (currentUserProfile) {
        try {
          const profile = JSON.parse(currentUserProfile);
          console.log('Checking profile update:', { profileId: profile.id, selectedUserId: selectedUser.id });
          
          if (profile.id === selectedUser.id) {
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
              
              
              window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
                detail: { user: profile }
              }));
            }
          }
        } catch (e) {
          console.warn('Failed to update current user sidebar:', e);
        }
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui akses user');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedUser, fetchUsers]);

  const toggleUserStatus = useCallback(async (userId: string, isActive: boolean): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    
    try {
      await updateUserStatus(userId, isActive);
      setSuccess(`User berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      
      await fetchUsers();
      
      setTimeout(() => setSuccess(null), 3000);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status user');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchUsers]);

  const quickChangeRole = useCallback(async (userId: string, role: "MEMBER" | "ADMIN" | "SUPERADMIN"): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    
    try {
      await changeUserRole(userId, role);
      setSuccess(`Role user berhasil diubah ke ${role}`);
      
      await fetchUsers();
      
      setTimeout(() => setSuccess(null), 3000);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah role user');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchUsers]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  return {
    users,
    isLoadingUsers,
    pagination,
    selectedUser,
    isLoadingDetail,
    availableMenus,
    availablePermissions,
    isDetailModalOpen,
    isSaving,
    error,
    success,
    searchQuery,
    roleFilter,
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
