import axiosClient from "../../../shared/api/axios";

export interface AffiliateProfile {
  id: string;
  code: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  totalEarnings?: number;
  totalPaid?: number;
}

export interface UserListItem {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: "MEMBER" | "ADMIN" | "SUPERADMIN";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  affiliateProfile: AffiliateProfile | null;
}

export interface UserDetail {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  bank: string | null;
  alamat: string | null;
  role: "MEMBER" | "ADMIN" | "SUPERADMIN";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  affiliateProfile: AffiliateProfile | null;
  permissions: string[];
  menuAccess: string[];
}

export interface AvailableMenu {
  id: string;
  menuId: string;
  label: string;
  icon: string;
  link: string;
  order: number;
  isAdmin: boolean;
  requiredPermission: string | null;
  isEnabled: boolean;
}

export interface AvailablePermission {
  id: string;
  permissionId: string;
  name: string;
  description: string | null;
  category: string;
  isEnabled: boolean;
}

export interface UsersListResponse {
  message: string;
  users: UserListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface UserDetailResponse {
  message: string;
  user: UserDetail;
  availableMenus: AvailableMenu[];
  availablePermissions: AvailablePermission[];
}

export interface MenuAccessUpdate {
  menuId: string;
  isEnabled: boolean;
}

export interface PermissionUpdate {
  permissionId: string;
  isEnabled: boolean;
}

export interface UpdateUserAccessRequest {
  role?: "MEMBER" | "ADMIN" | "SUPERADMIN";
  menuAccess?: MenuAccessUpdate[];
  permissions?: PermissionUpdate[];
}

export interface UpdateUserAccessResponse {
  message: string;
  user: { id: string; email: string; fullName: string | null; role: "MEMBER" | "ADMIN" | "SUPERADMIN" };
}

export const getUsers = async (params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<UsersListResponse> => {
  const response = await axiosClient.get<UsersListResponse>("/v1/admin/users", { params });
  return response.data;
};

export const getUserDetail = async (userId: string): Promise<UserDetailResponse> => {
  const response = await axiosClient.get<UserDetailResponse>(`/v1/admin/users/${userId}`);
  return response.data;
};

export const updateUserAccess = async (userId: string, data: UpdateUserAccessRequest): Promise<UpdateUserAccessResponse> => {
  const response = await axiosClient.put<UpdateUserAccessResponse>(`/v1/admin/users/${userId}/access`, data);
  return response.data;
};

export const updateUserStatus = async (userId: string, isActive: boolean): Promise<{ message: string; user: { id: string; email: string; fullName: string | null; isActive: boolean } }> => {
  const response = await axiosClient.put(`/v1/admin/users/${userId}/status`, { isActive });
  return response.data;
};

export const changeUserRole = async (userId: string, role: "MEMBER" | "ADMIN" | "SUPERADMIN"): Promise<{ message: string; user: { id: string; email: string; fullName: string | null; role: string } }> => {
  const response = await axiosClient.put(`/v1/admin/users/${userId}/role`, { role });
  return response.data;
};
