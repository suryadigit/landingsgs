import axiosClient, { axiosPublic } from "../../../shared/api/axios";

export interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export type UserRole = "MEMBER" | "ADMIN" | "SUPERADMIN";

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
  user: {
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
  };
  referral?: {
    code: string;
    referrerName: string;
    message: string;
  };
  affiliate?: {
    id: string;
    status: string;
  };
  payment?: {
    id: string;
    amount: number;
    invoiceUrl: string;
    expiredAt: string;
    status: string;
  };
  whatsappVerified?: boolean;
  nextStep?: string;
  redirectTo?: string;
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
  bank: string | null;
  alamat: string | null;
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
  level?: number;
  highestDownlineLevel?: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  link: string;
  order: number;
  requiredPermission: string;
  isAdmin?: boolean;
}

export interface UserMenusResponse {
  message: string;
  user: { id: string; fullName: string; role: UserRole };
  menus: MenuItem[];
  adminMenus?: MenuItem[];
  permissions: string[];
}

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

export interface VerifyEmailOtpResponse {
  message: string;
  payment?: { id: string; amount: number; invoiceUrl: string; expiredAt: string; status: string };
  user?: { id: string; email: string; fullName: string | null };
}

export interface VerifyPhoneOtpResponse {
  message: string;
  token?: string;
  loginSuccess?: boolean;
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
    hasPurchased500K?: boolean;
    isAffiliateInWordPress?: boolean;
    wpReferralLink?: string | null;
  };
  menus?: any[];
  adminMenus?: any[];
  permissions?: string[];
  redirectTo?: string;
  purchaseRequired?: boolean;
  purchaseMessage?: string;
  referrerLink?: {
    referrerName: string;
    referrerCode: string;
    shopUrl: string;
    message: string;
  } | null;
  instruction?: string;
}

export interface ValidateWhatsappRequest { phone: string }
export interface ValidateWhatsappResponse { success: boolean; message: string; phone?: string; nextStep?: string }
export interface SendWhatsappCodeRequest { phone: string }
export interface SendWhatsappCodeResponse { success: boolean; message: string; expiresIn?: number }
export interface VerifyWhatsappCodeRequest { phone: string; code: string }
export interface VerifyWhatsappCodeResponse { success: boolean; message: string; verificationToken?: string }
export interface ForgotPasswordRequest { email?: string; phone?: string; method?: "EMAIL" | "WHATSAPP" }
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  maskedPhone?: string | null;
  maskedEmail?: string | null;
  userId?: string;
  expiresIn?: string;
  nextStep?: string;
  endpoint?: string;
}
export interface VerifyResetOtpRequest { userId?: string; email?: string; phone?: string; code: string }
export interface VerifyResetOtpResponse { success: boolean; message: string; resetToken?: string; expiresIn?: string; nextStep?: string; endpoint?: string }
export interface ResetPasswordRequest { resetToken: string; newPassword: string }
export interface ResetPasswordResponse { success: boolean; message: string; nextStep?: string; loginEndpoint?: string }
export interface ResendResetOtpRequest { userId: string; method?: "EMAIL" | "WHATSAPP" }
export interface ResendResetOtpResponse { success: boolean; message: string; maskedPhone?: string; maskedEmail?: string; expiresIn?: string }

const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axiosPublic.post<LoginResponse>("/v1/users/login", data);
    if (response.data.token) {
      localStorage.setItem(tokenKey, response.data.token);
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      if (response.data.user) {
        localStorage.setItem("user_profile", JSON.stringify(response.data.user));
      }
    }

    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data as LoginErrorResponse;
    const err = new Error(errorData?.error || "Login failed") as any;
    if (error.response?.status === 401 && errorData?.payment) {
      err.response = { status: 401, data: errorData };
      err.isPaymentPending = true;
    } else {
      err.response = error.response;
    }
    throw err;
  }
};

export const signupUser = async (data: SignupRequest): Promise<SignupResponse> => {
  try {
    const response = await axiosPublic.post<SignupResponse>("/v1/users/signup", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Signup failed");
  }
};

export const verifyEmailOtp = async (data: VerifyEmailOtpRequest): Promise<VerifyEmailOtpResponse> => {
  try {
    const response = await axiosPublic.post<VerifyEmailOtpResponse>("/v1/users/verify-email-otp", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Email verification failed");
  }
};

export const requestEmailOtp = async (data: { userId: string; email: string }): Promise<{ message: string; email: string }> => {
  try {
    const response = await axiosPublic.post<{ message: string; email: string }>("/v1/users/request-email-otp", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to request OTP");
  }
};

export const requestPhoneOtp = async (data: RequestPhoneOtpRequest): Promise<{ message: string; phone: string }> => {
  try {
    const response = await axiosPublic.post<{ message: string; phone: string }>("/v1/users/request-phone-otp", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to request OTP");
  }
};

export const verifyLoginOtp = async (data: VerifyPhoneOtpRequest): Promise<VerifyPhoneOtpResponse> => {
  try {
    const response = await axiosPublic.post<VerifyPhoneOtpResponse>("/v1/users/verify-login-otp", data);
    if (response.data.token) {
      localStorage.setItem(tokenKey, response.data.token);
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      if (response.data.user) {
        localStorage.setItem("user_profile", JSON.stringify(response.data.user));
      }
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Login OTP verification failed");
  }
};

export const verifyPhoneOtp = async (data: VerifyPhoneOtpRequest): Promise<VerifyPhoneOtpResponse> => {
  try {
    const response = await axiosPublic.post<VerifyPhoneOtpResponse>("/v1/users/verify-phone-otp", data);
    if (response.data.token) {
      localStorage.setItem(tokenKey, response.data.token);
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      if (response.data.user) {
        localStorage.setItem("user_profile", JSON.stringify(response.data.user));
      }
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Phone verification failed");
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axiosClient.get<{ message: string; user: UserProfile }>("/v1/users/profile");

    if (response.data.user) {
      localStorage.setItem("user_profile", JSON.stringify(response.data.user));
      window.dispatchEvent(new CustomEvent('userProfileUpdated'));
    }

    return response.data.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch profile");
  }
};

export const updateUserProfile = async (data: { fullName?: string; phone?: string; bank?: string; alamat?: string }): Promise<{ message: string; user: UserProfile }> => {
  try {
    const payload = {
      fullName: data.fullName?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      bank: data.bank?.trim() || undefined,
      alamat: data.alamat?.trim() || undefined,
    };
    const response = await axiosClient.put<{ message: string; user: UserProfile }>("/v1/users/profile", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update profile");
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem("user_menus");
  localStorage.removeItem("user_profile");
  delete axiosClient.defaults.headers.common["Authorization"];
};

export const getUserMenus = async (): Promise<UserMenusResponse> => {
  try {
    const response = await axiosClient.get<UserMenusResponse>("/v1/users/menus", {
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      params: { _t: Date.now() },
    });
    if (response.data.menus) {
      localStorage.setItem("user_menus", JSON.stringify({
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

export const getCachedMenus = (currentUserId?: string): { userId?: string; menus: MenuItem[]; adminMenus?: MenuItem[]; permissions: string[]; role: UserRole } | null => {
  try {
    const cached = localStorage.getItem("user_menus");
    if (cached) {
      const parsed = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp >= 10 * 1000;
      const isWrongUser = currentUserId && parsed.userId && parsed.userId !== currentUserId;
      if (!isExpired && !isWrongUser) return parsed;
      if (isWrongUser) localStorage.removeItem("user_menus");
    }
  } catch { }
  return null;
};

export const clearCachedMenus = (): void => { localStorage.removeItem("user_menus") };
export const getToken = (): string | null => localStorage.getItem(tokenKey);
export const isAuthenticated = (): boolean => !!getToken();
export const setAuthorizationHeader = (token: string): void => { if (token) axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}` };
export const initializeAuth = (): void => { const token = getToken(); if (token) setAuthorizationHeader(token) };

export const validateWhatsapp = async (data: ValidateWhatsappRequest): Promise<ValidateWhatsappResponse> => {
  try {
    const response = await axiosPublic.post<ValidateWhatsappResponse>("/v1/users/validate-whatsapp", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to validate WhatsApp number");
  }
};

export const sendWhatsappCode = async (data: SendWhatsappCodeRequest): Promise<SendWhatsappCodeResponse> => {
  try {
    const response = await axiosPublic.post<SendWhatsappCodeResponse>("/v1/users/send-whatsapp-code", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to send WhatsApp OTP");
  }
};

export const verifyWhatsappCode = async (data: VerifyWhatsappCodeRequest): Promise<VerifyWhatsappCodeResponse> => {
  try {
    const response = await axiosPublic.post<VerifyWhatsappCodeResponse>("/v1/users/verify-whatsapp-code", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to verify WhatsApp OTP");
  }
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  try {
    const response = await axiosPublic.post<ForgotPasswordResponse>("/v1/users/forgot-password", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Gagal memproses permintaan reset password");
  }
};

export const verifyResetOtp = async (data: VerifyResetOtpRequest): Promise<VerifyResetOtpResponse> => {
  try {
    const response = await axiosPublic.post<VerifyResetOtpResponse>("/v1/users/verify-reset-otp", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Kode OTP tidak valid atau sudah kedaluwarsa");
  }
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  try {
    const response = await axiosPublic.post<ResetPasswordResponse>("/v1/users/reset-password", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Gagal mengubah password");
  }
};

export const resendResetOtp = async (data: ResendResetOtpRequest): Promise<ResendResetOtpResponse> => {
  try {
    const response = await axiosPublic.post<ResendResetOtpResponse>("/v1/users/resend-reset-otp", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Gagal mengirim ulang OTP");
  }
};
