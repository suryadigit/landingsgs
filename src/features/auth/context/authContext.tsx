import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  loginUser,
  signupUser,
  logoutUser as apiLogout,
  getUserProfile,
  getToken,
  initializeAuth,
  type UserProfile,
  type LoginRequest,
  type LoginResponse,
  type SignupRequest,
  type SignupResponse,
} from "../api/authApi";
import axiosClient from '../../../shared/api/axios';
import { queryClient } from '../../../config/queryClient';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  signup: (data: SignupRequest) => Promise<SignupResponse>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
      localStorage.setItem(tokenKey, newToken);
      try { axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; } catch {}
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        initializeAuth();
        const existingToken = getToken();
        if (existingToken) {
          setTokenState(existingToken);
          const profile = await getUserProfile();
          setUser(profile);
        }
      } catch {
        apiLogout();
        setUser(null);
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await loginUser(data);
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user as UserProfile);
        // Invalidate affiliate dashboard cache on the server using the new token.
        // Try both /v1/... and non-/v1 variant to handle backend differences.
        let cleared = false;
        try {
          await axiosClient.post('/v1/affiliate/dashboard/komisi/clear-cache');
          cleared = true;
        } catch (err: any) {
          // if first fails, try without /v1
          try {
            await axiosClient.post('/affiliate/dashboard/komisi/clear-cache');
            cleared = true;
          } catch (err2) {
            cleared = false;
          }
        }

        if (cleared) {
          try { localStorage.removeItem('affiliate_dashboard_bypass'); } catch {}
        } else {
          try { localStorage.setItem('affiliate_dashboard_bypass', String(Date.now())); } catch {}
        }

        try {
          await queryClient.invalidateQueries({ queryKey: ['affiliateDashboard'], exact: true });
          await queryClient.refetchQueries({ queryKey: ['affiliateDashboard'], exact: true });
        } catch {
          // ignore
        }
      }
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setToken]);

  const signup = useCallback(async (data: SignupRequest): Promise<SignupResponse> => {
    setError(null);
    try {
      return await signupUser(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    try { localStorage.removeItem('affiliate_dashboard_bypass'); } catch {}
    try { queryClient.invalidateQueries({ queryKey: ['affiliateDashboard'] }); } catch {}
    setUser(null);
    setTokenState(null);
    setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch {
      logout();
    }
  }, [token, logout]);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    signup,
    logout,
    setUser,
    setToken,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
