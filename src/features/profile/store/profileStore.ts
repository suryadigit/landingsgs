import { create } from "zustand";
import { getUserProfile, updateUserProfile, type UserProfile } from "../../auth/api/authApi";

interface ProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  isInitialized: boolean;
  fetchProfile: (forceRefresh?: boolean) => Promise<void>;
  updateProfile: (data: { fullName?: string; phone?: string; bank?:string; alamat?:string }) => Promise<boolean>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  success: null,
  isInitialized: false,

  fetchProfile: async (forceRefresh = false) => {
    if (get().isLoading) return;
    if (!forceRefresh && get().isInitialized && get().profile) return;
    set({ isLoading: true, error: null });
    try {
      const data = await getUserProfile();
      set({ profile: data, isLoading: false, isInitialized: true, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Gagal memuat profil" });
    }
  },

updateProfile: async (data) => {
  set({ isSaving: true, error: null, success: null });
  try {
    const response = await updateUserProfile({
      fullName: data.fullName,
      phone: data.phone,
      bank: data.bank,
      alamat: data.alamat,
    });
    set({ profile: response.user, isSaving: false, success: "Profil berhasil diperbarui" });
    window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: { user: response.user } }));
    setTimeout(() => set({ success: null }), 3000);
    return true;
  } catch (err: any) {
    set({ isSaving: false, error: err.message || "Gagal menyimpan profil" });
    return false;
  }
},

  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  reset: () => set({ profile: null, isLoading: false, isSaving: false, error: null, success: null, isInitialized: false }),
}));

export const useProfile = () => useProfileStore((state) => state.profile);
export const useProfileLoading = () => useProfileStore((state) => state.isLoading);
export const useProfileSaving = () => useProfileStore((state) => state.isSaving);
export const useProfileError = () => useProfileStore((state) => state.error);
export const useProfileSuccess = () => useProfileStore((state) => state.success);
