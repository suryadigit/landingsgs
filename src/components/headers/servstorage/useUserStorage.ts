import { useState, useEffect, useCallback } from 'react';

interface UserData {
  id?: string;
  fullName?: string;
  email?: string;
  level?: number;
  highestDownlineLevel?: number;
  role?: string;
}

export function useUserStorage() {
  const [userData, setUserData] = useState<UserData | null>(null);

  // Get user from localStorage
  const getUserFromStorage = useCallback((): UserData | null => {
    try {
      const cached = localStorage.getItem('user_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      console.warn('⚠️ [Header] Failed to parse user from localStorage');
    }
    return null;
  }, []);

  // Load user data dari localStorage saat mount dan listen untuk updates
  useEffect(() => {
    // Initial load
    setUserData(getUserFromStorage());

    // Listen untuk event userProfileUpdated
    const handleProfileUpdate = () => {
      console.log('📢 [Header] User profile updated event received');
      setUserData(getUserFromStorage());
    };

    // Listen untuk storage changes (jika ada update dari tab lain)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_profile') {
        console.log('📢 [Header] localStorage user_profile changed');
        setUserData(getUserFromStorage());
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getUserFromStorage]);

  const userName = userData?.fullName || userData?.email || 'User';
  const userEmail = userData?.email || '';
  const userRole = userData?.role || 'MEMBER';
  
  // User's own level - this is what's displayed in the badge
  // Default to 1 for all users (level 1 = direct affiliate)
  const userLevel = userData?.level || 1;
  
  // Highest downline level - used for reference, not for badge display
  const highestDownlineLevel = userData?.highestDownlineLevel || 0;

  return {
    userData,
    userName,
    userEmail,
    userRole,
    userLevel,
    highestDownlineLevel,
  };
}
