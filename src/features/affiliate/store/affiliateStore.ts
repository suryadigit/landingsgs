import { create } from "zustand";

interface AffiliateStore {
  affiliateCode: string | null;
  status: string | null;
  isLoading: boolean;
  setAffiliateCode: (code: string | null) => void;
  setStatus: (status: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAffiliateStore = create<AffiliateStore>((set) => ({
  affiliateCode: null,
  status: null,
  isLoading: false,
  setAffiliateCode: (code) => set({ affiliateCode: code }),
  setStatus: (status) => set({ status }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  reset: () => set({ affiliateCode: null, status: null, isLoading: false }),
}));
