import axiosClient from "./apis";

export interface AffiliateProfileResponse {
  id: string;
  userId: string;
  code: string;
  referredById?: string;
  totalEarnings: number;
  totalPaid: number;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
  registeredAt?: string;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateCommissionResponse {
  id: string;
  affiliateId: string;
  transactionId: string;
  userId: string;
  amount: number;
  level: number;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  createdAt: string;
}

/**
 * Payment model from backend - matches Prisma Payment model
 */
export interface PaymentResponse {
  id: string;
  userId?: string;
  affiliateId?: string;
  xenditInvoiceId?: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "FAILED";
  externalId?: string;
  invoiceUrl?: string;
  paidAt?: string;
  expiredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  message?: string;
}

/**
 * Affiliate registration response
 * Response from: POST /v1/affiliate/register
 */
export interface AffiliateRegistrationResponse {
  message: string;
  affiliateProfile: {
    id: string;
    code: string;
    status: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
    registeredAt?: string;
  };
  payment?: PaymentResponse;
  nextStep?: string;
}

/**
 * Activation status response when checking payment/invoice
 * Response from: GET /v1/affiliate/activation-status
 */
export interface ActivationStatusResponse {
  createdAt: null;
  isActive?: boolean;
  status: "NOT_REGISTERED" | "PENDING_PAYMENT" | "PAYMENT_PENDING" | "ACTIVE" | "AWAITING_PAYMENT" | "PAYMENT_COMPLETED" | "INVOICE_EXPIRED" | "ACTIVATION_REQUIRED" | "PAID" | "UNKNOWN";
  message: string;
  payment?: PaymentResponse;
  invoice?: {
    id: string;
    amount: number;
    invoiceUrl: string;
    expiredAt: string;
    status?: "PENDING" | "COMPLETED" | "EXPIRED" | "FAILED";
    paidAt?: string;
  };
  affiliate?: {
    affiliateCode?: string;
    affiliateStatus?: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
    registeredAt?: string;
    activatedAt?: string;
  };
  affiliateStatus?: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
  affiliateCode?: string;
  activatedAt?: string;
  paidAt?: string;
  needsAction?: string;
  registrationFee?: number;
  earnInfo?: {
    canEarn: boolean;
    affiliateCode?: string;
    activatedAt?: string;
  };
}

/**
 * Get current user's affiliate profile
 */
export const getAffiliateProfile = async (): Promise<AffiliateProfileResponse> => {
  try {
    const response = await axiosClient.get<AffiliateProfileResponse>(
      "/v1/users/profile"
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch affiliate profile");
  }
};

/**
 * Get affiliate commissions
 */
export const getAffiliateCommissions = async (params?: {
  skip?: number;
  take?: number;
  status?: string;
}): Promise<{ commissions: AffiliateCommissionResponse[]; total: number }> => {
  try {
    const response = await axiosClient.get<{
      commissions: AffiliateCommissionResponse[];
      total: number;
    }>("/v1/affiliate/commissions", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch commissions"
    );
  }
};

/**
 * Get affiliate referrals
 */
export const getAffiliateReferrals = async (params?: {
  skip?: number;
  take?: number;
}): Promise<{ referrals: AffiliateProfileResponse[]; total: number }> => {
  try {
    const response = await axiosClient.get<{
      referrals: AffiliateProfileResponse[];
      total: number;
    }>("/v1/affiliate/referrals", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch referrals");
  }
};

/**
 * Get affiliate statistics/dashboard data
 */
export const getAffiliateStats = async (): Promise<{
  totalEarnings: number;
  totalPaid: number;
  pendingBalance: number;
  totalReferrals: number;
  activeReferrals: number;
  commissionBreakdown: Array<{
    level: number;
    amount: number;
    count: number;
  }>;
}> => {
  try {
    const response = await axiosClient.get<{
      totalEarnings: number;
      totalPaid: number;
      pendingBalance: number;
      totalReferrals: number;
      activeReferrals: number;
      commissionBreakdown: Array<{
        level: number;
        amount: number;
        count: number;
      }>;
    }>("/v1/affiliate/stats");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch stats");
  }
};

/**
 * Get affiliate referral code/link
 */
export const getAffiliateLink = async (): Promise<{
  code: string;
  link: string;
}> => {
  try {
    const response = await axiosClient.get<{
      code: string;
      link: string;
    }>("/v1/affiliate/link");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch referral link");
  }
};

/**
 * Get only affiliate code (shortcut)
 */
export const getAffiliateCode = async (): Promise<string> => {
  try {
    const { data } = await axiosClient.get<{ code: string }>("/v1/affiliate/link");
    return data.code;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch affiliate code");
  }
};

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (data: {
  amount: number;
  bankAccount?: string;
}): Promise<{ message: string; withdrawalId: string }> => {
  try {
    const response = await axiosClient.post<{
      message: string;
      withdrawalId: string;
    }>("/v1/affiliate/withdrawal", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to request withdrawal");
  }
};

/**
 * Register as Affiliate (auto-creates Rp 75,000 activation invoice)
 * Response includes payment details with Xendit invoice URL
 */
export const registerAffiliate = async (data: {
  referredCode?: string;
}): Promise<AffiliateRegistrationResponse> => {
  try {
    const response = await axiosClient.post<AffiliateRegistrationResponse>(
      "/v1/affiliate/register",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to register affiliate");
  }
};

/**
 * Check activation status and get payment/invoice info
 * Returns affiliate status (ACTIVE/PENDING) and payment details if pending
 */
export const checkActivationStatus = async (): Promise<ActivationStatusResponse> => {
  try {
    const response = await axiosClient.get<ActivationStatusResponse>(
      "/v1/affiliate/activation-status"
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to check activation status");
  }
};

/**
 * Convenience: Get affiliateCode from activation status
 * Tries earnInfo.affiliateCode first, then affiliate.affiliateCode, then top-level affiliateCode
 */
export const getAffiliateCodeFromStatus = async (): Promise<string | null> => {
  try {
    const status = await checkActivationStatus();
    const code =
      status?.earnInfo?.affiliateCode ||
      status?.affiliate?.affiliateCode ||
      status?.affiliateCode ||
      null;
    return code;
  } catch (error: any) {
    return null;
  }
};

/**
 * Get pending invoice for user (alias for checkActivationStatus)
 */
export const getPendingInvoice = async (): Promise<ActivationStatusResponse | null> => {
  try {
    const response = await axiosClient.get<ActivationStatusResponse>(
      "/v1/payments/status"
    );
    // If status is ACTIVATION_REQUIRED or PAYMENT_PENDING, return the response
    if (response.data.status === "ACTIVATION_REQUIRED" || response.data.status === "PAYMENT_PENDING") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    // 404 is expected when no invoice exists
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.error || "Failed to fetch invoice");
  }
};

/**
 * Create registration invoice (Rp 75,000)
 */
export const createRegistrationInvoice = async (): Promise<ActivationStatusResponse> => {
  try {
    const response = await axiosClient.post<ActivationStatusResponse>(
      "/v1/payment/create-invoice",
      { amount: 75000 }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to create invoice");
  }
};

/**
 * Refresh/validate invoice before payment
 * Backend checks if invoice is still valid
 * If valid → returns same invoice
 * If expired → generates new invoice
 */
export const refreshInvoice = async (): Promise<ActivationStatusResponse> => {
  try {
    const response = await axiosClient.post<ActivationStatusResponse>(
      "/v1/payments/refresh-invoice",
      {}
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to refresh invoice");
  }
};

/**
 * Start backend polling for payment status
 * After user pays in Xendit, call this to start backend background polling
 * Backend will poll Xendit every 10 seconds for up to 15 minutes
 */
export const startPaymentPolling = async (): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.post<{ message: string }>(
      "/v1/payments/start-polling",
      {}
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to start polling");
  }
};

/**
 * Check if payment is complete and affiliate is activated
 * Frontend calls this every 2 seconds after payment
 * Returns overall status and affiliate activation status
 */
export interface CompleteStatusResponse {
  overallStatus: "PENDING" | "ACTIVE" | "FAILED" | "EXPIRED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED";
  affiliateStatus: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
  message: string;
}

export const checkCompleteStatus = async (): Promise<CompleteStatusResponse> => {
  try {
    const response = await axiosClient.get<CompleteStatusResponse>(
      "/v1/payments/complete-status"
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to check completion status");
  }
};
