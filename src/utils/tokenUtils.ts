/**
 * Token Utilities - Mengelola token authentication
 * Menyediakan fungsi untuk menyimpan, mengambil, menghapus, dan memvalidasi token
 */

export const TokenUtils = {
  /**
   * Mendapatkan token key dari environment variable atau default
   */
  getTokenKey: (): string => {
    return import.meta.env.VITE_TOKEN_KEY || "auth_token";
  },

  /**
   * Menyimpan token ke localStorage
   */
  saveToken: (token: string): void => {
    try {
      const tokenKey = TokenUtils.getTokenKey();
      localStorage.setItem(tokenKey, token);
    } catch {
      // Silent fail
    }
  },

  /**
   * Mengambil token dari localStorage
   */
  getToken: (): string | null => {
    try {
      const tokenKey = TokenUtils.getTokenKey();
      return localStorage.getItem(tokenKey);
    } catch {
      return null;
    }
  },

  /**
   * Menghapus token dari localStorage
   */
  removeToken: (): void => {
    try {
      const tokenKey = TokenUtils.getTokenKey();
      localStorage.removeItem(tokenKey);
    } catch {
      // Silent fail
    }
  },

  /**
   * Mengecek apakah token ada di localStorage
   */
  hasToken: (): boolean => {
    const token = TokenUtils.getToken();
    return !!token;
  },

  /**
   * Decode JWT token untuk mengambil payload
   */
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

  /**
   * Mengecek apakah token sudah expired
   */
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

  /**
   * Mendapatkan sisa waktu token dalam detik
   */
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

  /**
   * Mengecek apakah token masih valid (ada dan belum expired)
   */
  isTokenValid: (): boolean => {
    const token = TokenUtils.getToken();
    
    if (!token) {
      return false;
    }

    return !TokenUtils.isTokenExpired(token);
  },

  /**
   * Mengecek apakah token akan expired dalam X detik
   */
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
