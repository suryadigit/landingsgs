import { axiosClient } from '../../../shared/api';

export type RoleType = 'MEMBER' | 'ADMIN' | 'SUPERADMIN';

export interface RoleMenuItem {
  id: string;        
  label: string;
  icon: string;
  link: string;
  order: number;
  isAdmin: boolean;
  isEnabled: boolean;
  menuDbId: string;   
}

export interface RolePermissionItem {
  id: string;         
  name: string;
  category: string;
  isEnabled: boolean;
  permissionDbId: string; 
}

interface RoleConfigRawResponse {
  message: string;
  role: RoleType;
  menus: Array<{
    id: string;       
    menuId: string;  
    label: string;
    icon: string;
    link: string;
    order: number;
    isAdmin: boolean;
    isEnabled: boolean;
  }>;
  permissions: Array<{
    id: string;        
    permissionId: string;  
    name: string;
    description?: string;
    category: string;
    isEnabled: boolean;
  }>;
}

export interface RoleConfigResponse {
  message: string;
  role: RoleType;
  menus: RoleMenuItem[];
  permissions: RolePermissionItem[];
}

export interface UpdateRoleMenusRequest {
  menuIds: string[];
}

export interface UpdateRolePermissionsRequest {
  permissionIds: string[];
}

export interface BulkUpdateRequest {
  menus?: { menuDbId: string; isEnabled: boolean }[];
  permissions?: { permissionDbId: string; isEnabled: boolean }[];
}

export const getRoleConfig = async (role: RoleType): Promise<RoleConfigResponse> => {
  try {
    const response = await axiosClient.get<RoleConfigRawResponse>(`/v1/admin/roles/${role}/config`);
    const raw = response.data;
    
    return {
      message: raw.message,
      role: raw.role,
      menus: raw.menus.map(menu => ({
        id: menu.menuId,          
        menuDbId: menu.id,        
        label: menu.label,
        icon: menu.icon,
        link: menu.link,
        order: menu.order,
        isAdmin: menu.isAdmin,
        isEnabled: menu.isEnabled,
      })),
      permissions: raw.permissions.map(perm => ({
        id: perm.permissionId,   
        permissionDbId: perm.id,  
        name: perm.name,
        category: perm.category,
        isEnabled: perm.isEnabled,
      })),
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch role config');
  }
};

export const updateRoleMenu = async (
  role: RoleType,
  menuId: string,
  isEnabled: boolean
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.put(`/v1/admin/roles/${role}/menus/${menuId}`, { isEnabled });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update role menu');
  }
};

export const updateRoleMenus = async (
  role: RoleType,
  data: UpdateRoleMenusRequest
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.put(`/v1/admin/roles/${role}/menus`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update role menus');
  }
};

export const updateRolePermission = async (
  role: RoleType,
  permissionId: string,
  isEnabled: boolean
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.put(`/v1/admin/roles/${role}/permissions/${permissionId}`, { isEnabled });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update role permission');
  }
};

export const updateRolePermissions = async (
  role: RoleType,
  data: UpdateRolePermissionsRequest
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.put(`/v1/admin/roles/${role}/permissions`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update role permissions');
  }
};
