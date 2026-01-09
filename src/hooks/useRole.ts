/**
 * useRole Hook
 * 
 * Untuk check user role dan permissions
 * Backend route pattern:
 * - GET /affiliate/dashboard/komisi → requireAdmin (ADMIN users only)
 */

import { useAuth } from '../store/auth.context';
import type { UserRole } from '../api/auth';

interface UseRoleReturn {
  role: UserRole | undefined;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isMember: boolean;
  can: (requiredRole: UserRole | UserRole[]) => boolean;
  hasPermission: (permissionKey: string) => boolean;
  permissions: string[];
}

export const useRole = (): UseRoleReturn => {
  const { user } = useAuth();
  
  const role = user?.role || 'MEMBER';

  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';
  const isSuperAdmin = role === 'SUPERADMIN';
  const isMember = role === 'MEMBER';

  // Get permissions from user profile (stored in localStorage)
  const getPermissions = (): string[] => {
    try {
      const cachedProfile = localStorage.getItem('user_profile');
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        const perms = profile.permissions;
        
        // Handle both array and object format
        if (Array.isArray(perms)) {
          return perms;
        } else if (perms && typeof perms === 'object') {
          // Object format: { "edit_profile": true, "view_profile": true }
          return Object.entries(perms)
            .filter(([, value]) => value === true)
            .map(([key]) => key);
        }
      }
    } catch {
      // Silent fail
    }
    return [];
  };

  const permissions = getPermissions();

  /**
   * Check jika user punya required role(s)
   * @param requiredRole - Role atau array of roles yang allowed
   * @returns true jika user role match
   */
  const can = (requiredRole: UserRole | UserRole[]): boolean => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role as UserRole);
    }
    return role === requiredRole;
  };

  /**
   * Check jika user punya permission tertentu
   * @param permissionKey - Key permission (e.g., 'edit_profile', 'view_commission')
   * @returns true jika user punya permission tersebut
   */
  const hasPermission = (permissionKey: string): boolean => {
    // SUPERADMIN has all permissions
    if (isSuperAdmin) return true;
    
    // Check exact match first
    if (permissions.includes(permissionKey)) return true;
    
    // Also check with variations (lowercase, underscore vs camelCase)
    const normalizedKey = permissionKey.toLowerCase().replace(/-/g, '_');
    return permissions.some(p => 
      p.toLowerCase().replace(/-/g, '_') === normalizedKey
    );
  };

  return {
    role: user?.role,
    isAdmin,
    isSuperAdmin,
    isMember,
    can,
    hasPermission,
    permissions,
  };
};
