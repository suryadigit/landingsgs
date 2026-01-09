import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '../../store/profile.store';
import { useAuth } from '../../store/auth.context';
import type { UserProfile } from '../../api/auth';

export interface UseProfileReturn {
  // State from store
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  
  // Local editing state
  isEditing: boolean;
  
  // Form state
  fullName: string;
  phone: string;
  
  // Setters
  setFullName: (value: string) => void;
  setPhone: (value: string) => void;
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
  
  // Actions
  startEditing: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  refreshProfile: () => Promise<void>;
  
  // Helpers
  formatDate: (dateString: string) => string;
}

export function useProfile(): UseProfileReturn {
  const { setUser, user } = useAuth();
  
  // Get state and actions from store
  const {
    profile,
    isLoading,
    isSaving,
    error,
    success,
    fetchProfile,
    updateProfile,
    setError,
    setSuccess,
  } = useProfileStore();
  
  // Local UI state
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state (local, synced from store profile)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch profile on mount - force refresh to ensure fresh data
  useEffect(() => {
    fetchProfile(true); // Force refresh on page visit
  }, []); // Only run once on mount

  // Sync form state when profile changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  }, [setError, setSuccess]);

  const handleSave = useCallback(async () => {
    const success = await updateProfile({
      fullName: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    
    if (success) {
      setIsEditing(false);
      
      // Also update auth context for consistency
      if (user && profile) {
        setUser({
          ...user,
          fullName: fullName.trim() || null,
          phone: phone.trim() || null,
        });
      }
    }
  }, [fullName, phone, updateProfile, user, profile, setUser]);

  const handleCancel = useCallback(() => {
    // Reset form to store values
    setFullName(profile?.fullName || '');
    setPhone(profile?.phone || '');
    setIsEditing(false);
    setError(null);
  }, [profile, setError]);

  const refreshProfile = useCallback(async () => {
    // Force refresh profile data from API
    await fetchProfile(true);
  }, [fetchProfile]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  return {
    // State from store
    profile,
    isLoading,
    isSaving,
    error,
    success,
    
    // Local editing state
    isEditing,
    
    // Form state
    fullName,
    phone,
    
    // Setters
    setFullName,
    setPhone,
    setError,
    setSuccess,
    
    // Actions
    startEditing,
    handleSave,
    handleCancel,
    refreshProfile,
    
    // Helpers
    formatDate,
  };
}

