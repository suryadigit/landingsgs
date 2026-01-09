import axios from "axios";

// Prefer environment variable; if not present, use staging BE domain (no localhost fallback)
const BASE_URL = import.meta.env.VITE_API_URL || "https://stagingglacak.my.id/api";

/**
 * Helper function to decode JWT token
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid
 */
const decodeJWT = (token: string): any => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decodedStr = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedStr);
  } catch (error) {
    return null;
  }
};

/**
 * Helper function to check if token is expired
 * @param token - JWT token to check
 * @returns true if token is expired, false otherwise
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    // exp is in seconds, convert to milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    return currentTime > expirationTime;
  } catch (error) {
    return true;
  }
};

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15 second timeout (increased from 8s to handle larger payloads)
});

// Request interceptor: Track request timing & validate token
axiosClient.interceptors.request.use(
  (config) => {
    const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
    const token = localStorage.getItem(tokenKey);
    
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        console.warn("⚠️ [Token] Token is expired, clearing from storage");
        localStorage.removeItem(tokenKey);
        delete axiosClient.defaults.headers.common["Authorization"];
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Add timestamp for performance monitoring
    (config as any).metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Monitor slow responses and handle errors
axiosClient.interceptors.response.use(
  (response) => {
    // Log slow responses
    const duration = Date.now() - ((response.config as any).metadata?.startTime || 0);
    if (duration > 3000) {
      console.warn(`⚠️ Slow API response: ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - API response took too long');
    }
    
    // Handle 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
      localStorage.removeItem(tokenKey);
      delete axiosClient.defaults.headers.common["Authorization"];
    }
    
    return Promise.reject(error);
  }
);

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ==================== PAYMENT ENDPOINTS ====================

/**
 * Check activation status and auto-create invoice if needed
 */
export const checkActivationStatus = async () => {
  try {
    const response = await axiosClient.get("/v1/invoices/activation-status");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment status by payment ID (no auth required)
 * Used after redirect from Xendit
 */
export const checkPaymentStatusById = async (paymentId: string) => {
  try {
    const response = await axiosPublic.get(`/v1/invoices/${paymentId}/status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment status by user ID (no auth required)
 * Simpler endpoint for checking user's payment
 */
export const checkPaymentStatusByUserId = async (userId: string) => {
  try {
    const response = await axiosPublic.get(`/v1/users/${userId}/payment-status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify payment from Xendit (with auth)
 * Manual endpoint to check & sync payment status
 */
export const verifyPaymentFromXendit = async () => {
  try {
    const response = await axiosClient.post("/v1/payments/verify-from-xendit");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify payment without authentication
 * Can use paymentId or userId as query params
 */
export const verifyPaymentNoAuth = async (paymentId?: string, userId?: string) => {
  try {
    const params = new URLSearchParams();
    if (paymentId) params.append("paymentId", paymentId);
    if (userId) params.append("userId", userId);

    const response = await axiosPublic.post(
      `/v1/payments/verify-no-auth?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh/regenerate payment invoice
 * If expired, generates new; if valid, returns existing
 */
export const refreshPaymentInvoice = async () => {
  try {
    const response = await axiosClient.post("/v1/payments/refresh-invoice");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get complete activation status
 * Shows overall status: ACTIVE, PAYMENT_REQUIRED, AWAITING_PAYMENT, etc.
 */
export const getCompleteActivationStatus = async () => {
  try {
    const response = await axiosClient.get("/v1/invoices/activation-complete");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get or create payment for user (public endpoint - no auth required)
 * If payment exists and not expired, returns existing
 * If payment expired or doesn't exist, creates new one
 */
export interface GetOrCreatePaymentResponse {
  payment: {
    id: string;
    amount: number;
    status: string;
    invoiceUrl: string;
    expiredAt: string;
    remainingMinutes?: number;
  };
  isNew: boolean;
  message: string;
}

export const getOrCreatePaymentByUserId = async (userId: string): Promise<GetOrCreatePaymentResponse> => {
  try {
    const response = await axiosPublic.post<GetOrCreatePaymentResponse>(
      `/v1/payments/get-or-create`,
      { userId }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default axiosClient;
