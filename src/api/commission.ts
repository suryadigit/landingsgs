import axiosClient from "./apis";

const COMMISSION_BASE_URL = "/v1";

/**
 * Get commission breakdown for current user
 * Shows PENDING, APPROVED, PAID breakdown with pagination
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - status: Filter by status (PENDING, APPROVED, PAID, or ALL)
 */
export const getCommissionBreakdown = async (params?: {
  page?: number;
  limit?: number;
  
  status?: "PENDING" | "APPROVED" | "PAID" | "ALL";
}) => {
  try {
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/breakdown`, {
      params: params || { page: 1, limit: 10, status: "ALL" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get my commissions (user's own commissions)
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - status: Filter by status (PENDING, APPROVED, PAID)
 */
export const getMyCommissions = async (params?: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "PAID";
}) => {
  try {
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/my`, {
      params: params || { page: 1, limit: 20 },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get commission summary for current user
 * Shows total earnings, total paid, and pending amounts
 */
export const getCommissionSummary = async () => {
  try {
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/komisi`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get pending commissions grouped by affiliate (admin)
 * New endpoint yang sudah mengelompokkan data per affiliate
 * 
 * GET /api/v1/commissions/admin/pending-grouped
 */
export const getPendingCommissionsGrouped = async () => {
  try {
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/commissions/admin/pending-grouped`);
    console.log("📡 Pending Grouped API Response:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get pending commissions for admin approval
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - affiliateId: Filter by affiliate ID (optional)
 * - search: Search by transaction ID or buyer name (optional)
 */
export const getPendingCommissions = async (params?: {
  page?: number;
  limit?: number;
  affiliateId?: string;
  search?: string;
}) => {
  try {
    // Endpoint untuk fetch list dan stats pending commissions
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/commissions/admin/stats`, {
      params: params || { page: 1, limit: 20 },
    });
    
    // Debug log
    console.log("📡 Raw API Response:", response.data);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Approve single commission (admin)
 * Changes status from PENDING to APPROVED
 */
export const approveCommission = async (commissionId: string, adminNotes?: string) => {
  try {
    const response = await axiosClient.post(
      `${COMMISSION_BASE_URL}/commissions/admin/approve/${commissionId}`,
      { adminNotes: adminNotes || "" }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Batch approve commissions (admin)
 * 
 * Body:
 * {
 *   commissionIds: ["id1", "id2", "id3"]
 * }
 */
export const batchApproveCommissions = async (commissionIds: string[]) => {
  try {
    const response = await axiosClient.post(
      `${COMMISSION_BASE_URL}/admin/approve-batch`,
      { commissionIds }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject commission (admin)
 * Changes status from PENDING to REJECTED
 */
export const rejectCommission = async (
  commissionId: string,
  reason?: string
) => {
  try {
    const response = await axiosClient.post(
      `${COMMISSION_BASE_URL}/admin/reject/${commissionId}`,
      { reason }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark commission as paid (admin)
 * Changes status from APPROVED to PAID
 */
export const payoutCommission = async (commissionId: string) => {
  try {
    const response = await axiosClient.post(
      `${COMMISSION_BASE_URL}/admin/payout/${commissionId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Bypass endpoint: Manually trigger commission recording
 * Used for testing before WordPress webhook integration
 * 
 * Body:
 * {
 *   customerAffiliateCode: "AFFP3NDE4",
 *   productAmount: 500000,
 *   productQty: 3,
 *   transactionId: "order-001" (optional)
 * }
 */
export const bypassRecordCommission = async (data: {
  customerAffiliateCode: string;
  productAmount: number;
  productQty?: number;
  transactionId?: string;
}) => {
  try {
    const response = await axiosClient.post(
      `${COMMISSION_BASE_URL}/bypass/record`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get pending commissions (convenience function)
 * Shortcut for getCommissionBreakdown with PENDING status
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 5)
 */
export const getPendingCommissionsOnly = async (params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/breakdown`, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 5,
        status: "PENDING",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get approved commissions (convenience function)
 * Shortcut for getCommissionBreakdown with APPROVED status
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 5)
 */
export const getApprovedCommissionsOnly = async (params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/breakdown`, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 5,
        status: "APPROVED",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get paid commissions (convenience function)
 * Shortcut for getCommissionBreakdown with PAID status
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 */
export const getPaidCommissionsOnly = async (params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/breakdown`, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        status: "PAID",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * OPTIMIZED: Get complete dashboard summary in ONE request
 * Combines: profile, affiliate status, commission breakdown, referral data, activation status
 * 
 * Returns all data needed for dashboard in a single API call
 * Reduces network overhead and improves page load time
 * 
 * This endpoint should be implemented in backend to consolidate multiple queries
 */
export const getCommissionDashboardSummary = async () => {
  try {
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/commissions/breakdown`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get commission statistics for admin dashboard
 * Returns overview, stats by status, and recent pending commissions
 * 
 * GET /api/v1/commissions/admin/stats
 */
export const getCommissionStats = async () => {
  try {
    const response = await axiosClient.get(`${COMMISSION_BASE_URL}/commissions/admin/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
