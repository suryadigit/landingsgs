import axiosClient from "../../../shared/api/axios";

const BASE_URL = "/v1/withdrawals";

export interface WithdrawalRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface WithdrawalParams {
  status?: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  page?: number;
  limit?: number;
}

export const requestWithdrawal = async (data: WithdrawalRequest) => {
  const response = await axiosClient.post(`${BASE_URL}/request`, data);
  return response.data;
};

export const getWithdrawalHistory = async (params?: WithdrawalParams) => {
  const response = await axiosClient.get(`${BASE_URL}/history`, {
    params: params || { page: 1, limit: 10 },
  });
  return response.data;
};

export const getWithdrawalDetail = async (withdrawalId: string) => {
  const response = await axiosClient.get(`${BASE_URL}/${withdrawalId}`);
  return response.data;
};

export const getPendingWithdrawals = async (params?: { page?: number; limit?: number }) => {
  const response = await axiosClient.get(`${BASE_URL}/admin/pending`, {
    params: params || { page: 1, limit: 20 },
  });
  return response.data;
};

export const approveWithdrawal = async (withdrawalId: string, data?: { notes?: string }) => {
  const response = await axiosClient.post(`${BASE_URL}/admin/approve/${withdrawalId}`, data || {});
  return response.data;
};

export const rejectWithdrawal = async (withdrawalId: string, data: { reason: string }) => {
  const response = await axiosClient.post(`${BASE_URL}/admin/reject/${withdrawalId}`, data);
  return response.data;
};

export const completeWithdrawal = async (withdrawalId: string, data: { transferReference: string }) => {
  const response = await axiosClient.post(`${BASE_URL}/admin/complete/${withdrawalId}`, data);
  return response.data;
};
