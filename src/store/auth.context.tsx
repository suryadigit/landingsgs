import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { LoginResponse } from "../api/auth";
import { logoutUser, getUserProfile, initializeAuth } from "../api/auth";
import { useProfileStore } from "./profile.store";

interface AuthContextType {
  user: LoginResponse["user"] | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: LoginResponse["user"] | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const updateAxiosToken = async (token: string | null): Promise<void> => {
  try {
    const { axiosClient } = await import("../api/apis");
    if (token) {
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axiosClient.defaults.headers.common["Authorization"];
    }
  } catch {
    // Silent fail
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<LoginResponse["user"] | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTokenKey = () => import.meta.env.VITE_TOKEN_KEY || "auth_token";

  const setUser = (newUser: LoginResponse["user"] | null) => {
    setUserState(newUser);
    
    if (newUser && newUser.id) {
      // Preserve existing level data if available
      let existingLevel = 1;
      let existingHighestDownlineLevel = 0;
      try {
        const cached = localStorage.getItem('user_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          // Only preserve if same user
          if (parsed.id === newUser.id) {
            existingLevel = parsed.level || 1;
            existingHighestDownlineLevel = parsed.highestDownlineLevel || 0;
          }
        }
      } catch { /* ignore */ }
      
      const userWithRole = {
        ...newUser,
        role: newUser.role || 'MEMBER',
        // Set level - default to 1 for all MEMBER users
        level: (newUser as any).level || existingLevel,
        highestDownlineLevel: (newUser as any).highestDownlineLevel || existingHighestDownlineLevel,
      };
      localStorage.setItem('user_profile', JSON.stringify(userWithRole));
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: { user: userWithRole } 
      }));
    }
  };

  const setToken = (newToken: string | null) => {
    const tokenKey = getTokenKey();

    if (newToken) {
      localStorage.setItem(tokenKey, newToken);
      updateAxiosToken(newToken);
    } else {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem('user_profile');
      updateAxiosToken(null);
    }

    setTokenState(newToken);
    window.dispatchEvent(new CustomEvent('tokenUpdated', { 
      detail: { hasToken: !!newToken } 
    }));
  };

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        initializeAuth();
        
        const tokenKey = getTokenKey();
        const storedToken = localStorage.getItem(tokenKey);

        if (storedToken) {
          setTokenState(storedToken);
          await updateAxiosToken(storedToken);
          
          window.dispatchEvent(new CustomEvent('tokenUpdated', { 
            detail: { hasToken: true } 
          }));

          let cachedProfileData = null;
          const cachedProfile = localStorage.getItem('user_profile');
          if (cachedProfile) {
            try {
              cachedProfileData = JSON.parse(cachedProfile);
              if (cachedProfileData && cachedProfileData.id) {
                setUserState(cachedProfileData);
              } else {
                cachedProfileData = null;
              }
            } catch {
              cachedProfileData = null;
            }
          }

          try {
            const profile = await getUserProfile();
            const profileData = {
              id: profile.id,
              email: profile.email,
              fullName: profile.fullName,
              phone: profile.phone,
              isEmailVerified: profile.isEmailVerified,
              isPhoneVerified: profile.isPhoneVerified,
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt,
              role: profile.role,
              permissions: profile.permissions,
              availableRoutes: profile.availableRoutes,
              sidebarMenu: profile.sidebarMenu,
              adminMenu: profile.adminMenu,
            };
            if (isMounted) {
              setUser(profileData);
            }
          } catch {
            if (cachedProfileData && isMounted) {
              window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
                detail: { user: cachedProfileData } 
              }));
            }
          }
        }
      } catch {
        // Silent fail
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    localStorage.removeItem('sidebar_state');
    localStorage.removeItem('user_profile');
    sessionStorage.clear();
    
    // Reset profile store
    useProfileStore.getState().reset();
  };

  const refreshUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      
      // Preserve existing level data from localStorage if not provided by API
      let existingLevel = 1;
      let existingHighestDownlineLevel = 0;
      try {
        const cached = localStorage.getItem('user_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          existingLevel = parsed.level || 1;
          existingHighestDownlineLevel = parsed.highestDownlineLevel || 0;
        }
      } catch { /* ignore */ }
      
      const profileData = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
        isEmailVerified: profile.isEmailVerified,
        isPhoneVerified: profile.isPhoneVerified,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        role: profile.role,
        permissions: profile.permissions,
        availableRoutes: profile.availableRoutes,
        sidebarMenu: profile.sidebarMenu,
        adminMenu: profile.adminMenu,
        // Level system - use API value if available, otherwise keep existing or default to 1
        level: profile.level || existingLevel,
        highestDownlineLevel: profile.highestDownlineLevel || existingHighestDownlineLevel,
      };
      setUser(profileData);
      localStorage.setItem('user_profile', JSON.stringify(profileData));
    } catch {
      // Silent fail
    }
  };

  const refreshToken = async () => {
    try {
      const authModule = await import("../api/auth");
      const refreshFn =
        (authModule as any).refreshAuthToken ??
        (authModule as any).refreshToken ??
        (authModule as any).refresh;
      if (typeof refreshFn !== "function") {
        throw new Error("refresh function not found");
      }
      const response = await refreshFn();
      
      if (response && response.token) {
        setToken(response.token);
      } else {
        throw new Error("No token in refresh response");
      }
    } catch {
      setToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    setUser,
    setToken,
    logout: handleLogout,
    refreshUserProfile,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
