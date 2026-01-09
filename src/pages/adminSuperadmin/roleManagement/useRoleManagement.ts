import { useState, useCallback } from 'react';
import {
  getRoleConfig,
  updateRoleMenus,
  updateRolePermissions,
  type RoleType,
  type RoleMenuItem,
  type RolePermissionItem,
} from '../../../api/roles';

interface UseRoleManagementReturn {
  // State
  selectedRole: RoleType;
  menus: RoleMenuItem[];
  permissions: RolePermissionItem[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  hasChanges: boolean;

  // Local edit state
  menuUpdates: Map<string, boolean>;
  permissionUpdates: Map<string, boolean>;

  // Actions
  setSelectedRole: (role: RoleType) => void;
  fetchRoleConfig: (role: RoleType) => Promise<void>;
  toggleMenu: (menuDbId: string) => void;
  togglePermission: (permissionDbId: string) => void;
  saveAll: () => Promise<boolean>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

export function useRoleManagement(): UseRoleManagementReturn {
  const [selectedRole, setSelectedRole] = useState<RoleType>('MEMBER');
  const [menus, setMenus] = useState<RoleMenuItem[]>([]);
  const [permissions, setPermissions] = useState<RolePermissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Local edit state
  const [menuUpdates, setMenuUpdates] = useState<Map<string, boolean>>(new Map());
  const [permissionUpdates, setPermissionUpdates] = useState<Map<string, boolean>>(new Map());
  
  // Original values for comparison
  const [originalMenus, setOriginalMenus] = useState<Map<string, boolean>>(new Map());
  const [originalPermissions, setOriginalPermissions] = useState<Map<string, boolean>>(new Map());

  // Check if there are changes
  const hasChanges = (() => {
    // Check menu changes
    for (const [key, value] of menuUpdates) {
      if (originalMenus.get(key) !== value) return true;
    }
    // Check permission changes
    for (const [key, value] of permissionUpdates) {
      if (originalPermissions.get(key) !== value) return true;
    }
    return false;
  })();

  // Fetch role config
  const fetchRoleConfig = useCallback(async (role: RoleType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRoleConfig(role);
      const menuList = response.menus || [];
      const permList = response.permissions || [];
      
      setMenus(menuList);
      setPermissions(permList);

      // Initialize menu updates from response
      const menuMap = new Map<string, boolean>();
      menuList.forEach(menu => {
        menuMap.set(menu.menuDbId, menu.isEnabled);
      });
      setMenuUpdates(menuMap);
      setOriginalMenus(new Map(menuMap)); // Save original

      // Initialize permission updates from response
      const permMap = new Map<string, boolean>();
      permList.forEach(perm => {
        permMap.set(perm.permissionDbId, perm.isEnabled);
      });
      setPermissionUpdates(permMap);
      setOriginalPermissions(new Map(permMap)); // Save original
    } catch (err: any) {
      setError(err.message || 'Gagal memuat konfigurasi role');
      setMenus([]);
      setPermissions([]);
      setMenuUpdates(new Map());
      setPermissionUpdates(new Map());
      setOriginalMenus(new Map());
      setOriginalPermissions(new Map());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle menu
  const toggleMenu = useCallback((menuDbId: string) => {
    setMenuUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(menuDbId, !prev.get(menuDbId));
      return newMap;
    });
  }, []);

  // Toggle permission
  const togglePermission = useCallback((permissionDbId: string) => {
    setPermissionUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(permissionDbId, !prev.get(permissionDbId));
      return newMap;
    });
  }, []);

  // Save all
  const saveAll = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      // Backend expects menuId (string ID like "dashboard") not menuDbId (UUID)
      // Map menuDbId back to menu.id (string ID)
      const menuData = menus.map(menu => ({
        menuId: menu.id, // string ID like "dashboard", "referral"
        isEnabled: menuUpdates.get(menu.menuDbId) ?? menu.isEnabled,
      }));

      // Backend expects permissionId (string ID) not permissionDbId (UUID)
      const permData = permissions.map(perm => ({
        permissionId: perm.id, // string ID like "view_commission"
        isEnabled: permissionUpdates.get(perm.permissionDbId) ?? perm.isEnabled,
      }));

      await Promise.all([
        updateRoleMenus(selectedRole, { menus: menuData }),
        updateRolePermissions(selectedRole, { permissions: permData }),
      ]);

      setSuccess('Konfigurasi role berhasil disimpan');
      
      // Refresh data
      await fetchRoleConfig(selectedRole);
      
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan konfigurasi');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedRole, menus, permissions, menuUpdates, permissionUpdates, fetchRoleConfig]);

  return {
    selectedRole,
    menus,
    permissions,
    isLoading,
    isSaving,
    error,
    success,
    hasChanges,
    menuUpdates,
    permissionUpdates,
    setSelectedRole,
    fetchRoleConfig,
    toggleMenu,
    togglePermission,
    saveAll,
    setError,
    setSuccess,
  };
}
