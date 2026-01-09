import axiosClient, { axiosPublic } from "./apis";

export interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export type UserRole = "MEMBER" | "ADMIN" | "SUPERADMIN";

/**
 * Sidebar menu item from login response
 */
export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  order: number;
}

export interface LoginResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
    role?: UserRole;
    permissions?: string[] | { [key: string]: boolean };
    availableRoutes?: string[] | { [key: string]: boolean };
    sidebarMenu?: SidebarMenuItem[];
    adminMenu?: SidebarMenuItem[];
  };
  // Backend bisa return userId langsung (untuk OTP flow)
  userId?: string;
  endpoint?: string;
  expiresIn?: string;
  instruction?: string;
  maskedPhone?: string;
  nextStep?: string;  
  note?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  referralCode?: string;
  recaptchaToken?: string;
  whatsappVerificationToken?: string;
}

export interface SignupResponse {
  message: string;
  userId: string;
  email: string;
}

export interface VerifyEmailOtpRequest {
  userId: string;
  code: string;
}

export interface RequestPhoneOtpRequest {
  userId: string;
  phone: string;
  method?: "EMAIL" | "WHATSAPP";
}

export interface VerifyPhoneOtpRequest {
  userId: string;
  code: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role?: UserRole;
  permissions?: string[] | { [key: string]: boolean };
  availableRoutes?: string[] | { [key: string]: boolean };
  sidebarMenu?: SidebarMenuItem[];
  adminMenu?: SidebarMenuItem[];
  // Level system
  level?: number; // User's own level
  highestDownlineLevel?: number; // Highest level from user's downline network
}

/**
 * Menu item from backend
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  link: string;
  order: number;
  requiredPermission: string;
  isAdmin?: boolean;
}

/**
 * User menus response from backend
 */
export interface UserMenusResponse {
  message: string;
  user: {
    id: string;
    fullName: string;
    role: UserRole;
  };
  menus: MenuItem[];
  adminMenus?: MenuItem[];
  permissions: string[];
}

/**
 * Login user with email and password (public endpoint)
 * Jika belum bayar, akan return 401 dengan payment object
 */
export interface LoginErrorResponse {
  error: string;
  payment?: {
    id: string;
    status: string;
    amount: number;
    invoiceUrl: string;
    expiredAt: string;
    remainingMinutes: number;
  };
}

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axiosPublic.post<LoginResponse>("/v1/users/login", data);
    
    // Store token in localStorage
    if (response.data.token) {
      const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
      localStorage.setItem(tokenKey, response.data.token);
      
      // Set authorization header for future requests
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  } catch (error: any) {
    // PENTING: Jika 401 dengan payment object, jangan throw error langsung
    // Sebaliknya, throw error yang include payment data untuk di-handle di component
    const errorData = error.response?.data as LoginErrorResponse;
    const errorWithPayment = new Error(errorData?.error || "Login failed") as any;
    
    // Attach payment info ke error object agar bisa diakses di component
    if (error.response?.status === 401 && errorData?.payment) {
      errorWithPayment.response = {
        status: 401,
        data: errorData
      };
      errorWithPayment.isPaymentPending = true;
    } else {
      // Jika error lain, preserve original response
      errorWithPayment.response = error.response;
    }
    
    throw errorWithPayment;
  }
};

/**
 * Sign up new user (public endpoint)
 */
export const signupUser = async (data: SignupRequest): Promise<SignupResponse> => {
  try {
    const response = await axiosPublic.post<SignupResponse>("/v1/users/signup", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Signup failed");
  }
};

/**
 * Verify email OTP (no auth required, public endpoint)
 * TIDAK auto-login! User harus bayar 75k dulu sebelum bisa access dashboard
 */
export interface VerifyEmailOtpResponse {
  message: string;
  payment?: {
    id: string;
    amount: number;
    invoiceUrl: string;
    expiredAt: string;
    status: string;
  };
  user?: {
    id: string;
    email: string;
    fullName: string | null;
  };
}

export const verifyEmailOtp = async (
  data: VerifyEmailOtpRequest
): Promise<VerifyEmailOtpResponse> => {
  try {
    const response = await axiosPublic.post<VerifyEmailOtpResponse>(
      "/v1/users/verify-email-otp",
      data
    );
    
    // JANGAN auto-login! User harus bayar 75k dulu
    // Response hanya include payment info untuk redirect ke Xendit
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Email verification failed");
  }
};

/**
 * Request email OTP (no auth required, public endpoint)
 */
export const requestEmailOtp = async (data: {
  userId: string;
  email: string;
}): Promise<{ message: string; email: string }> => {
  try {
    const response = await axiosPublic.post<{ message: string; email: string }>(
      "/v1/users/request-email-otp",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to request OTP");
  }
};

/**
 * Request phone OTP via WhatsApp (no auth required, public endpoint)
 */
export const requestPhoneOtp = async (
  data: RequestPhoneOtpRequest
): Promise<{ message: string; phone: string }> => {
  try {
    const response = await axiosPublic.post<{ message: string; phone: string }>(
      "/v1/users/request-phone-otp",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to request OTP");
  }
};

/**
 * Verify phone OTP from WhatsApp (no auth required, public endpoint)
 * Returns token after successful verification for login flow
 */
export interface VerifyPhoneOtpResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    role?: UserRole;
    permissions?: string[];
    availableRoutes?: string[] | { [key: string]: boolean };
  };
}

/**
 * Verify LOGIN OTP - endpoint khusus untuk flow login dengan OTP
 * POST /v1/users/verify-login-otp
 */
export const verifyLoginOtp = async (
  data: VerifyPhoneOtpRequest
): Promise<VerifyPhoneOtpResponse> => {
  try {
    console.log("📤 [Auth] Calling verify-login-otp with:", data);
    const response = await axiosPublic.post<VerifyPhoneOtpResponse>(
      "/v1/users/verify-login-otp",
      data
    );
    
    console.log("📥 [Auth] verify-login-otp response:", response.data);
    
    // If backend returns token after OTP verification, store it
    if (response.data.token) {
      const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
      console.log("🔐 [Auth] Storing token with key:", tokenKey);
      localStorage.setItem(tokenKey, response.data.token);
      
      // Verify it was stored
      const storedToken = localStorage.getItem(tokenKey);
      console.log("✅ [Auth] Token stored:", storedToken ? "YES" : "NO");
      
      // Set authorization header for future requests
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      console.log("✅ [Auth] Token set in axios headers");
    } else {
      console.warn("⚠️ [Auth] No token in response!", response.data);
    }
    
    return response.data;
  } catch (error: any) {
    console.error("❌ [Auth] verify-login-otp error:", error);
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Login OTP verification failed");
  }
};

export const verifyPhoneOtp = async (
  data: VerifyPhoneOtpRequest
): Promise<VerifyPhoneOtpResponse> => {
  try {
    console.log("📤 [Auth] Calling verify-phone-otp with:", data);
    const response = await axiosPublic.post<VerifyPhoneOtpResponse>(
      "/v1/users/verify-phone-otp",
      data
    );
    
    console.log("📥 [Auth] verify-phone-otp response:", response.data);
    
    // If backend returns token after OTP verification, store it
    if (response.data.token) {
      const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
      console.log("🔐 [Auth] Storing token with key:", tokenKey);
      localStorage.setItem(tokenKey, response.data.token);
      
      // Verify it was stored
      const storedToken = localStorage.getItem(tokenKey);
      console.log("✅ [Auth] Token stored:", storedToken ? "YES" : "NO");
      
      // Set authorization header for future requests
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      console.log("✅ [Auth] Token set in axios headers");
    } else {
      console.warn("⚠️ [Auth] No token in response!", response.data);
    }
    
    return response.data;
  } catch (error: any) {
    console.error("❌ [Auth] verify-phone-otp error:", error);
    throw new Error(error.response?.data?.error || "Phone verification failed");
  }
};

/**
 * Profile API response structure
 */
interface ProfileResponse {
  message: string;
  user: UserProfile;
}

/**
 * Get user profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axiosClient.get<ProfileResponse>("/v1/users/profile");
    // Backend returns { message: "...", user: {...} }
    return response.data.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch profile");
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: {
  fullName?: string;
  phone?: string;
}): Promise<{ message: string; user: UserProfile }> => {
  try {
    const response = await axiosClient.put<{
      message: string;
      user: UserProfile;
    }>("/v1/users/profile", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update profile");
  }
};

/**
 * Logout user
 */
export const logoutUser = (): void => {
  const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
  localStorage.removeItem(tokenKey);
  localStorage.removeItem('user_menus'); // Clear cached menus on logout
  delete axiosClient.defaults.headers.common["Authorization"];
};

/**
 * Get user menus based on role (requires auth)
 * Endpoint: GET /api/v1/users/menus
 */
export const getUserMenus = async (): Promise<UserMenusResponse> => {
  try {
    // Add cache-busting header to prevent browser caching
    const response = await axiosClient.get<UserMenusResponse>("/v1/users/menus", {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      params: {
        _t: Date.now(), // Cache buster query param
      },
    });
    
    // Cache menus in localStorage for faster loading (include userId for proper caching)
    if (response.data.menus) {
      localStorage.setItem('user_menus', JSON.stringify({
        userId: response.data.user.id,
        menus: response.data.menus,
        adminMenus: response.data.adminMenus,
        permissions: response.data.permissions,
        role: response.data.user.role,
        timestamp: Date.now(),
      }));
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch menus");
  }
};

/**
 * Get cached menus from localStorage
 * @param currentUserId - Optional current user ID to validate cache belongs to same user
 * Cache TTL: 10 seconds (for more realtime updates from admin changes)
 */
export const getCachedMenus = (currentUserId?: string): {
  userId?: string;
  menus: MenuItem[];
  adminMenus?: MenuItem[];
  permissions: string[];
  role: UserRole;
} | null => {
  try {
    const cached = localStorage.getItem('user_menus');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Validate cache: check timestamp (10 seconds for realtime) and userId if provided
      const isExpired = Date.now() - parsed.timestamp >= 10 * 1000; // 10 seconds
      const isWrongUser = currentUserId && parsed.userId && parsed.userId !== currentUserId;
      
      if (!isExpired && !isWrongUser) {
        return parsed;
      }
      
      // Clear invalid cache
      if (isWrongUser) {
        localStorage.removeItem('user_menus');
      }
    }
  } catch {
    // Silent fail
  }
  return null;
};

/**
 * Clear cached menus
 */
export const clearCachedMenus = (): void => {
  localStorage.removeItem('user_menus');
};

/**
 * Get stored token
 */
export const getToken = (): string | null => {
  const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
  return localStorage.getItem(tokenKey);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Set authorization header from token
 */
export const setAuthorizationHeader = (token: string): void => {
  if (token) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

/**
 * Initialize auth - restores token from localStorage if available
 */
export const initializeAuth = (): void => {
  const token = getToken();
  if (token) {
    setAuthorizationHeader(token);
  }
};

// ==================== WhatsApp Verification APIs ====================

/**
 * Validate if phone number is registered on WhatsApp
 * POST /v1/users/validate-whatsapp
 */
export interface ValidateWhatsappRequest {
  phone: string;
}

export interface ValidateWhatsappResponse {
  success: boolean;
  message: string;
  phone?: string;
  nextStep?: string;
}

export const validateWhatsapp = async (
  data: ValidateWhatsappRequest
): Promise<ValidateWhatsappResponse> => {
  try {
    const response = await axiosPublic.post<ValidateWhatsappResponse>(
      "/v1/users/validate-whatsapp",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to validate WhatsApp number");
  }
};

/**
 * Send OTP code via WhatsApp
 * POST /v1/users/send-whatsapp-code
 */
export interface SendWhatsappCodeRequest {
  phone: string;
}

export interface SendWhatsappCodeResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds until OTP expires
}

export const sendWhatsappCode = async (
  data: SendWhatsappCodeRequest
): Promise<SendWhatsappCodeResponse> => {
  try {
    const response = await axiosPublic.post<SendWhatsappCodeResponse>(
      "/v1/users/send-whatsapp-code",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to send WhatsApp OTP");
  }
};

/**
 * Verify WhatsApp OTP code
 * POST /v1/users/verify-whatsapp-code
 */
export interface VerifyWhatsappCodeRequest {
  phone: string;
  code: string;
}

export interface VerifyWhatsappCodeResponse {
  success: boolean;
  message: string;
  verificationToken?: string; // Token to use during signup
}

export const verifyWhatsappCode = async (
  data: VerifyWhatsappCodeRequest
): Promise<VerifyWhatsappCodeResponse> => {
  try {
    const response = await axiosPublic.post<VerifyWhatsappCodeResponse>(
      "/v1/users/verify-whatsapp-code",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to verify WhatsApp OTP");
  }
};

// ==================== Forgot Password APIs ====================

/**
 * Step 1: Request password reset - send OTP to WhatsApp
 * POST /api/users/forgot-password
 */
export interface ForgotPasswordRequest {
  email?: string;
  phone?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  maskedPhone?: string;
  userId?: string;
  expiresIn?: string;
  nextStep?: string;
  endpoint?: string;
}

export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  try {
    const response = await axiosPublic.post<ForgotPasswordResponse>(
      "/v1/users/forgot-password",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Gagal memproses permintaan reset password");
  }
};

/**
 * Step 2: Verify OTP for password reset
 * POST /api/users/verify-reset-otp
 */
export interface VerifyResetOtpRequest {
  userId: string;
  code: string;
}

export interface VerifyResetOtpResponse {
  success: boolean;
  message: string;
  resetToken?: string;
  expiresIn?: string;
  nextStep?: string;
  endpoint?: string;
}

export const verifyResetOtp = async (
  data: VerifyResetOtpRequest
): Promise<VerifyResetOtpResponse> => {
  try {
    const response = await axiosPublic.post<VerifyResetOtpResponse>(
      "/v1/users/verify-reset-otp",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Kode OTP tidak valid atau sudah kedaluwarsa");
  }
};

/**
 * Step 3: Reset password with token
 * POST /api/users/reset-password
 */
export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  nextStep?: string;
  loginEndpoint?: string;
}

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  try {
    const response = await axiosPublic.post<ResetPasswordResponse>(
      "/v1/users/reset-password",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Gagal mengubah password");
  }
};

/**
 * Resend OTP for password reset
 * POST /api/users/resend-reset-otp
 */
export interface ResendResetOtpRequest {
  userId: string;
}

export interface ResendResetOtpResponse {
  success: boolean;
  message: string;
  maskedPhone?: string;
  expiresIn?: string;
}

export const resendResetOtp = async (
  data: ResendResetOtpRequest
): Promise<ResendResetOtpResponse> => {
  try {
    const response = await axiosPublic.post<ResendResetOtpResponse>(
      "/v1/users/resend-reset-otp",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Gagal mengirim ulang OTP");
  }
};
