export const TokenUtils = {
  getTokenKey: (): string => {
    return import.meta.env.VITE_TOKEN_KEY || "auth_token";
  },

  saveToken: (token: string): void => {
    try {
      const tokenKey = TokenUtils.getTokenKey();
      localStorage.setItem(tokenKey, token);
    } catch {
    }
  },

  getToken: (): string | null => {
    try {
      const tokenKey = TokenUtils.getTokenKey();
      return localStorage.getItem(tokenKey);
    } catch {
      return null;
    }
  },

  removeToken: (): void => {
    try {
      const tokenKey = TokenUtils.getTokenKey();
      localStorage.removeItem(tokenKey);
    } catch {
    }
  },

  hasToken: (): boolean => {
    const token = TokenUtils.getToken();
    return !!token;
  },

  decodeToken: (token: string): any => {
    try {
      const parts = token.split(".");
      
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decodedStr = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodedStr);
    } catch {
      return null;
    }
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = TokenUtils.decodeToken(token);
      
      if (!decoded || !decoded.exp) {
        return true;
      }

      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();

      return currentTime > expirationTime;
    } catch {
      return true;
    }
  },

  getTokenExpirationTime: (token: string): number => {
    try {
      const decoded = TokenUtils.decodeToken(token);
      
      if (!decoded || !decoded.exp) {
        return -1;
      }

      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      return Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
    } catch {
      return -1;
    }
  },

  isTokenValid: (): boolean => {
    const token = TokenUtils.getToken();
    
    if (!token) {
      return false;
    }

    return !TokenUtils.isTokenExpired(token);
  },

  isTokenExpiringIn: (seconds: number = 300): boolean => {
    const token = TokenUtils.getToken();
    
    if (!token) {
      return true;
    }

    const remainingTime = TokenUtils.getTokenExpirationTime(token);
    return remainingTime > 0 && remainingTime <= seconds;
  },
};

export default TokenUtils;
