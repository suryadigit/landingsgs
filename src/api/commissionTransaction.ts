import axiosClient from "./apis";

const COMMISSION_BASE_URL = "/v1";

/**
 * Get commission transactions for current user
 * Endpoint: GET /v1/commission-transactions
 * Note: baseURL already includes /api from axios config
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export const getCommissionTransactions = async (params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await axiosClient.get(
      `${COMMISSION_BASE_URL}/commission-transactions`,
      {
        params: params || { page: 1, limit: 20 },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
