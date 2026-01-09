import axiosClient from "../../../shared/api/axios";

const BASE_URL = "/v1";

export interface CommissionParams {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "PAID" | "ALL";
}

export interface CommissionAdminParams {
  page?: number;
  limit?: number;
  affiliateId?: string;
  search?: string;
}

export const getCommissionBreakdown = async (params?: CommissionParams) => {
  const response = await axiosClient.get(`${BASE_URL}/breakdown`, {
    params: params || { page: 1, limit: 10, status: "ALL" },
  });
  return response.data;
};

export const getMyCommissions = async (params?: CommissionParams) => {
  const response = await axiosClient.get(`${BASE_URL}/commissions/my`, {
    params: params || { page: 1, limit: 20 },
  });
  return response.data;
};

export const getCommissionSummary = async () => {
  const response = await axiosClient.get(`${BASE_URL}/komisi`);
  return response.data;
};

export const getPendingCommissionsGrouped = async () => {
  const response = await axiosClient.get(`${BASE_URL}/commissions/admin/pending-grouped`);
  return response.data;
};

export const getPendingCommissions = async (params?: CommissionAdminParams) => {
  const response = await axiosClient.get(`${BASE_URL}/commissions/admin/stats`, {
    params: params || { page: 1, limit: 20 },
  });
  return response.data;
};

export const approveCommission = async (commissionId: string, adminNotes?: string) => {
  const response = await axiosClient.post(`${BASE_URL}/commissions/admin/approve/${commissionId}`, { adminNotes: adminNotes || "" });
  return response.data;
};

export const batchApproveCommissions = async (commissionIds: string[]) => {
  const response = await axiosClient.post(`${BASE_URL}/admin/approve-batch`, { commissionIds });
  return response.data;
};

export const rejectCommission = async (commissionId: string, reason?: string) => {
  const response = await axiosClient.post(`${BASE_URL}/admin/reject/${commissionId}`, { reason });
  return response.data;
};

export const payoutCommission = async (commissionId: string) => {
  const response = await axiosClient.post(`${BASE_URL}/admin/payout/${commissionId}`);
  return response.data;
};

export const bypassRecordCommission = async (data: {
  customerAffiliateCode: string;
  productAmount: number;
  productQty?: number;
  transactionId?: string;
}) => {
  const response = await axiosClient.post(`${BASE_URL}/bypass/record`, data);
  return response.data;
};

export const getPendingCommissionsOnly = async (params?: { page?: number; limit?: number }) => {
  const response = await axiosClient.get(`${BASE_URL}/breakdown`, {
    params: { page: params?.page || 1, limit: params?.limit || 5, status: "PENDING" },
  });
  return response.data;
};

export const getApprovedCommissionsOnly = async (params?: { page?: number; limit?: number }) => {
  const response = await axiosClient.get(`${BASE_URL}/breakdown`, {
    params: { page: params?.page || 1, limit: params?.limit || 5, status: "APPROVED" },
  });
  return response.data;
};

export const getPaidCommissionsOnly = async (params?: { page?: number; limit?: number }) => {
  const response = await axiosClient.get(`${BASE_URL}/breakdown`, {
    params: { page: params?.page || 1, limit: params?.limit || 10, status: "PAID" },
  });
  return response.data;
};

export const getCommissionDashboardSummary = async () => {
  const response = await axiosClient.get(`${BASE_URL}/commissions/breakdown`);
  return response.data;
};

export const getCommissionStats = async () => {
  const response = await axiosClient.get(`${BASE_URL}/commissions/admin/stats`);
  return response.data;
};
