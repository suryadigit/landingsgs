import { create } from 'zustand';
import { getUserProfile, updateUserProfile, type UserProfile } from '../api/auth';

interface ProfileStore {
  // State
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  isInitialized: boolean;
  
  // Actions
  fetchProfile: (forceRefresh?: boolean) => Promise<void>;
  updateProfile: (data: { fullName?: string; phone?: string }) => Promise<boolean>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  success: null,
  isInitialized: false,

  // Fetch profile from API
  fetchProfile: async (forceRefresh = false) => {
    // Skip if already loading
    if (get().isLoading) return;
    
    // If already initialized and has data, skip fetch (use cached) - unless force refresh
    if (!forceRefresh && get().isInitialized && get().profile) return;

    set({ isLoading: true, error: null });
    
    try {
      const data = await getUserProfile();
      set({ 
        profile: data, 
        isLoading: false, 
        isInitialized: true,
        error: null 
      });
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      set({ 
        isLoading: false, 
        error: err.message || 'Gagal memuat profil' 
      });
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ isSaving: true, error: null, success: null });
    
    try {
      const response = await updateUserProfile({
        fullName: data.fullName?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
      });
      
      // Update store with new profile data
      set({ 
        profile: response.user, 
        isSaving: false, 
        success: 'Profil berhasil diperbarui' 
      });
      
      // Dispatch event for other components (sidebar, header, etc.)
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: { user: response.user } 
      }));
      
      // Clear success after 3 seconds
      setTimeout(() => {
        set({ success: null });
      }, 3000);
      
      return true;
    } catch (err: any) {
      set({ 
        isSaving: false, 
        error: err.message || 'Gagal menyimpan profil' 
      });
      return false;
    }
  },

  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  
  // Reset store (on logout)
  reset: () => set({
    profile: null,
    isLoading: false,
    isSaving: false,
    error: null,
    success: null,
    isInitialized: false,
  }),
}));

// Selector hooks for optimized re-renders
export const useProfile = () => useProfileStore((state) => state.profile);
export const useProfileLoading = () => useProfileStore((state) => state.isLoading);
export const useProfileSaving = () => useProfileStore((state) => state.isSaving);
export const useProfileError = () => useProfileStore((state) => state.error);
export const useProfileSuccess = () => useProfileStore((state) => state.success);
