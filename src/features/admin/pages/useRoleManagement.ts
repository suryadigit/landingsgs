import { useState, useCallback } from 'react';
import {
  getRoleConfig,
  updateRoleMenus,
  updateRolePermissions,
  type RoleType,
  type RoleMenuItem,
  type RolePermissionItem,
} from '../../../features/roles';

interface UseRoleManagementReturn {
  selectedRole: RoleType;
  menus: RoleMenuItem[];
  permissions: RolePermissionItem[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  hasChanges: boolean;
  menuUpdates: Map<string, boolean>;
  permissionUpdates: Map<string, boolean>;
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

  const [menuUpdates, setMenuUpdates] = useState<Map<string, boolean>>(new Map());
  const [permissionUpdates, setPermissionUpdates] = useState<Map<string, boolean>>(new Map());
  
  const [originalMenus, setOriginalMenus] = useState<Map<string, boolean>>(new Map());
  const [originalPermissions, setOriginalPermissions] = useState<Map<string, boolean>>(new Map());

  const hasChanges = (() => {
    for (const [key, value] of menuUpdates) {
      if (originalMenus.get(key) !== value) return true;
    }
    for (const [key, value] of permissionUpdates) {
      if (originalPermissions.get(key) !== value) return true;
    }
    return false;
  })();

  const fetchRoleConfig = useCallback(async (role: RoleType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRoleConfig(role);
      const menuList = response.menus || [];
      const permList = response.permissions || [];
      
      
      setMenus(menuList);
      setPermissions(permList);

      const menuMap = new Map<string, boolean>();
      menuList.forEach(menu => {
        menuMap.set(menu.menuDbId, menu.isEnabled);
      });
      setMenuUpdates(menuMap);
      setOriginalMenus(new Map(menuMap)); 

      const permMap = new Map<string, boolean>();
      permList.forEach(perm => {
        permMap.set(perm.permissionDbId, perm.isEnabled);
      });
      setPermissionUpdates(permMap);
      setOriginalPermissions(new Map(permMap)); 
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

  const toggleMenu = useCallback((menuDbId: string) => {
    setMenuUpdates(prev => {
      const currentValue = prev.get(menuDbId);
      const newMap = new Map(prev);
      newMap.set(menuDbId, !currentValue);
      return newMap;
    });
  }, []);

  const togglePermission = useCallback((permissionDbId: string) => {
    setPermissionUpdates(prev => {
      const currentValue = prev.get(permissionDbId);
      const newMap = new Map(prev);
      newMap.set(permissionDbId, !currentValue);
      return newMap;
    });
  }, []);

  const saveAll = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const enabledMenuIds = menus
        .filter(menu => menuUpdates.get(menu.menuDbId) === true)
        .map(menu => menu.menuDbId); 

      const enabledPermissionIds = permissions
        .filter(perm => permissionUpdates.get(perm.permissionDbId) === true)
        .map(perm => perm.permissionDbId); 

      await Promise.all([
        updateRoleMenus(selectedRole, { menuIds: enabledMenuIds }),
        updateRolePermissions(selectedRole, { permissionIds: enabledPermissionIds }),
      ]);

      setSuccess('Konfigurasi role berhasil disimpan');
      
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
