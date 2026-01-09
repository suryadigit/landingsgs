import axiosClient from "./apis";

const WITHDRAWAL_BASE_URL = "/v1/withdrawals";

// ==================== USER ENDPOINTS ====================

/**
 * Request a withdrawal (user)
 * Amount must be ≤ total PAID commissions
 * 
 * Body:
 * - amount: Withdrawal amount (Rp)
 * - bankName: Bank name (e.g., BCA, Mandiri, BNI)
 * - accountNumber: Bank account number
 * - accountHolder: Name on bank account
 */
export const requestWithdrawal = async (data: {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}) => {
  try {
    const response = await axiosClient.post(
      `${WITHDRAWAL_BASE_URL}/request`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get withdrawal history (user)
 * 
 * Query params:
 * - status: Filter by status (PENDING, APPROVED, REJECTED, COMPLETED)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 */
export const getWithdrawalHistory = async (params?: {
  status?: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await axiosClient.get(`${WITHDRAWAL_BASE_URL}/history`, {
      params: params || { page: 1, limit: 10 },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get withdrawal detail by ID (user)
 */
export const getWithdrawalDetail = async (withdrawalId: string) => {
  try {
    const response = await axiosClient.get(`${WITHDRAWAL_BASE_URL}/${withdrawalId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all pending withdrawal requests (admin)
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export const getPendingWithdrawals = async (params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await axiosClient.get(
      `${WITHDRAWAL_BASE_URL}/admin/pending`,
      {
        params: params || { page: 1, limit: 20 },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Approve a withdrawal request (admin)
 * Changes status from PENDING to APPROVED
 * 
 * Body:
 * - notes: Optional notes about approval
 */
export const approveWithdrawal = async (
  withdrawalId: string,
  data?: { notes?: string }
) => {
  try {
    const response = await axiosClient.post(
      `${WITHDRAWAL_BASE_URL}/admin/approve/${withdrawalId}`,
      data || {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject a withdrawal request (admin)
 * Changes status from PENDING to REJECTED
 * 
 * Body:
 * - reason: Reason for rejection
 */
export const rejectWithdrawal = async (
  withdrawalId: string,
  data: { reason: string }
) => {
  try {
    const response = await axiosClient.post(
      `${WITHDRAWAL_BASE_URL}/admin/reject/${withdrawalId}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark withdrawal as completed (admin)
 * Changes status from APPROVED to COMPLETED
 * 
 * Body:
 * - transferReference: Transfer reference number (e.g., TRF-20251128-001)
 */
export const completeWithdrawal = async (
  withdrawalId: string,
  data: { transferReference: string }
) => {
  try {
    const response = await axiosClient.post(
      `${WITHDRAWAL_BASE_URL}/admin/complete/${withdrawalId}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
