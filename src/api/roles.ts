import axiosClient from "./apis";

// ============================================
// Types
// ============================================

export type RoleType = "MEMBER" | "ADMIN" | "SUPERADMIN";

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

export interface RoleConfigResponse {
  message: string;
  role: RoleType;
  menus: RoleMenuItem[];
  permissions: RolePermissionItem[];
}

export interface UpdateRoleMenusRequest {
  menus: { menuId: string; isEnabled: boolean }[];
}

export interface UpdateRolePermissionsRequest {
  permissions: { permissionId: string; isEnabled: boolean }[];
}

export interface BulkUpdateRequest {
  menus?: { menuDbId: string; isEnabled: boolean }[];
  permissions?: { permissionDbId: string; isEnabled: boolean }[];
}

// ============================================
// API Functions
// ============================================

/**
 * Get role configuration (menus & permissions for a role)
 * Endpoint: GET /api/v1/admin/roles/:role/config
 */
export const getRoleConfig = async (role: RoleType): Promise<RoleConfigResponse> => {
  try {
    const response = await axiosClient.get<RoleConfigResponse>(`/v1/admin/roles/${role}/config`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch role config");
  }
};

/**
 * Update single role menu
 * Endpoint: PUT /api/v1/admin/roles/:role/menus/:menuId
 */
export const updateRoleMenu = async (
  role: RoleType,
  menuId: string,
  isEnabled: boolean
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.put(`/v1/admin/roles/${role}/menus/${menuId}`, { isEnabled });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update role menu");
  }
};

/**
 * Bulk update role menus
 * Endpoint: PUT /api/v1/admin/roles/:role/menus
 */
export const updateRoleMenus = async (
  role: RoleType,
  data: UpdateRoleMenusRequest
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.put(`/v1/admin/roles/${role}/menus`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update role menus");
  }
};

/**
 * Update single role permission
 * Endpoint: PUT /api/v1/admin/roles/:role/permissions/:permissionId
 */
export const updateRolePermission = async (
  role: RoleType,
  permissionId: string,
  isEnabled: boolean
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.put(`/v1/admin/roles/${role}/permissions/${permissionId}`, { isEnabled });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update role permission");
  }
};

/**
 * Bulk update role permissions
 * Endpoint: PUT /api/v1/admin/roles/:role/permissions
 */
export const updateRolePermissions = async (
  role: RoleType,
  data: UpdateRolePermissionsRequest
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.put(`/v1/admin/roles/${role}/permissions`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update role permissions");
  }
};
