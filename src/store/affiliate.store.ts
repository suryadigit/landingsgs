import { create, type StateCreator } from 'zustand';
import { getUserProfile } from '../api/auth';
import { checkActivationStatus, getAffiliateCodeFromStatus, refreshInvoice, createRegistrationInvoice, startPaymentPolling } from '../api/affiliate';
import { getReferralProgramDashboard, type ReferralProgramResponse } from '../api/referral';
import { getCommissionBreakdown } from '../api/commission';
import axiosClient from '../api/apis';

export interface ProfileState {
  userId?: string;
  email?: string;
  fullName?: string | null;
  phone?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AffiliateState {
  isActive: boolean;
  affiliateCode?: string | null;
  registeredAt?: string | null;
  activatedAt?: string | null;
  totalEarnings?: number;
  totalPaid?: number;
}

export interface InvoiceState {
  id?: string;
  amount?: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | null;
  invoiceUrl?: string;
  expiredAt?: string;
}

export interface WithdrawalHistoryItem {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  bankName: string;
  accountNumberMasked?: string;
  accountHolder?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WithdrawalState {
  availableBalance: number;
  pendingWithdrawal: number;
  totalPaid: number;
  totalEarned?: number;
  inWallet?: number;
  withdrawalHistory: WithdrawalHistoryItem[];
}

interface StoreState {
  profile: ProfileState | null;
  affiliate: AffiliateState;
  invoice: InvoiceState;
  referralProgram: ReferralProgramResponse | null;
  commissionBreakdown: any | null;
  referralHierarchy: any | null; // Referral hierarchy cache
  withdrawal: WithdrawalState;
  loading: boolean;
  error?: string | null;
  isInitialized: boolean;
  lastUpdate?: number;
  refresh: () => Promise<void>;
  refreshInvoice: () => Promise<void>;
  regenerateInvoice: () => Promise<void>;
  refreshReferralProgram: () => Promise<void>;
  refreshCommissionBreakdown: () => Promise<void>;
  refreshReferralHierarchy: () => Promise<void>; 
  refreshWithdrawal: () => Promise<void>; 
  handlePayment: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
}

let intervalId: number | null = null;
let mediumPollIntervalId: number | null = null;
let heavyPollIntervalId: number | null = null;
let hierarchyAbortController: AbortController | null = null;

const creator: StateCreator<StoreState> = (set: any) => ({
  profile: null,
  affiliate: { isActive: false, affiliateCode: null, registeredAt: null, activatedAt: null, totalEarnings: 0, totalPaid: 0 },
  invoice: { status: null },
  referralProgram: null,
  commissionBreakdown: null,
  referralHierarchy: null,
  withdrawal: { availableBalance: 0, pendingWithdrawal: 0, totalPaid: 0, withdrawalHistory: [] },
  loading: false,
  error: null,
  isInitialized: false,
  lastUpdate: undefined,
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await getUserProfile();
      const status = await checkActivationStatus();
      const code = await getAffiliateCodeFromStatus();
      const programData = await getReferralProgramDashboard();
      const commissionData = await getCommissionBreakdown({ page: 1, limit: 20 });
      
      // Extract invoice data if exists
      const invoiceData = status.payment || status.invoice;
      let invoiceState: InvoiceState = { status: null };
      
      if (invoiceData) {
        const paymentStatus = invoiceData.status;
        invoiceState = {
          id: invoiceData.id,
          amount: invoiceData.amount,
          status: paymentStatus === 'COMPLETED' ? 'PAID' : 'PENDING' as const,
          invoiceUrl: invoiceData.invoiceUrl || '',
          expiredAt: invoiceData.expiredAt || '',
        };
      }
      
      set({
        profile: {
          userId: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          phone: profile.phone,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
        affiliate: {
          isActive: !!status?.isActive,
          affiliateCode: code || null,
          registeredAt: status?.affiliate?.registeredAt || null,
          activatedAt: status?.affiliate?.activatedAt || status?.earnInfo?.activatedAt || status?.activatedAt || null,
          totalEarnings: programData?.affiliate?.totalEarnings || 0,
          totalPaid: programData?.affiliate?.totalPaid || 0,
        },
        referralProgram: programData,
        commissionBreakdown: commissionData,
        invoice: invoiceState,
        loading: false,
        isInitialized: true,
        lastUpdate: Date.now(),
      });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to refresh data' });
    }
  },
  refreshInvoice: async () => {
    try {
      const response = await refreshInvoice();
      const invoiceData = response.payment || response.invoice;
      
      if (invoiceData) {
        const paymentStatus = invoiceData.status;
        set({
          invoice: {
            id: invoiceData.id,
            amount: invoiceData.amount,
            status: paymentStatus === 'COMPLETED' ? 'PAID' : 'PENDING' as const,
            invoiceUrl: invoiceData.invoiceUrl || '',
            expiredAt: invoiceData.expiredAt || '',
          },
          lastUpdate: Date.now(),
        });
      }
    } catch (e: any) {
      set({ error: e?.message || 'Failed to refresh invoice' });
      throw e;
    }
  },
  regenerateInvoice: async () => {
    try {
      const response = await createRegistrationInvoice();
      const invoiceData = response.payment || response.invoice;
      
      if (invoiceData) {
        set({
          invoice: {
            id: invoiceData.id,
            amount: invoiceData.amount,
            status: 'PENDING',
            invoiceUrl: invoiceData.invoiceUrl || '',
            expiredAt: invoiceData.expiredAt || '',
          },
          lastUpdate: Date.now(),
        });
      }
    } catch (e: any) {
      set({ error: e?.message || 'Failed to regenerate invoice' });
      throw e;
    }
  },
  handlePayment: async () => {
    try {
      // Refresh invoice before payment
      const response = await refreshInvoice();
      const invoiceData = response.payment || response.invoice;
      
      if (invoiceData?.invoiceUrl) {
        // Update invoice data
        set({
          invoice: {
            id: invoiceData.id,
            amount: invoiceData.amount,
            status: 'PENDING',
            invoiceUrl: invoiceData.invoiceUrl,
            expiredAt: invoiceData.expiredAt || '',
          },
          lastUpdate: Date.now(),
        });
        
        // Open payment URL
        window.open(invoiceData.invoiceUrl, '_blank');
        
        // Start backend polling
        try {
          await startPaymentPolling();
        } catch (err) {
          console.warn('Could not start backend polling:', err);
        }
      } else {
        throw new Error('No invoice URL received');
      }
    } catch (e: any) {
      set({ error: e?.message || 'Failed to process payment' });
      throw e;
    }
  },
  // REMOVED: refreshReferralProgram() - use refresh() instead
  // REMOVED: refreshCommissionBreakdown() - use refresh() instead
  // REMOVED: refreshWithdrawal() - use refresh() instead
  
  // For on-demand refresh specific data only:
  refreshReferralProgram: async () => {
    try {
      const programData = await getReferralProgramDashboard();
      set({
        referralProgram: programData,
        lastUpdate: Date.now(),
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to refresh referral program' });
      throw e;
    }
  },
  refreshCommissionBreakdown: async () => {
    try {
      const commissionData = await getCommissionBreakdown({ page: 1, limit: 20 });
      set({
        commissionBreakdown: commissionData,
        lastUpdate: Date.now(),
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to refresh commission breakdown' });
      throw e;
    }
  },
  refreshReferralHierarchy: async () => {
    try {
      set({ loading: true, error: null }); // Show loading state
      
      // Cancel ONLY previous referral-hierarchy request if still pending
      if (hierarchyAbortController) {
        hierarchyAbortController.abort();
      }
      
      hierarchyAbortController = new AbortController();
      
      // Fetch commission breakdown data
      const hierarchyResponse = await axiosClient.get('/v1/commissions/referral-hierarchy', {
        signal: hierarchyAbortController.signal,
      });
      
      // Response dari API sudah berisi referrals langsung
      const hierarchyData = hierarchyResponse.data;
      console.log('DEBUG: Received hierarchy data:', hierarchyData);
      
      set({
        referralHierarchy: hierarchyData,
        loading: false, // Mark loading as complete
        error: null, // Clear error
        lastUpdate: Date.now(),
      });
    } catch (e: any) {
      // Skip error if aborted
      if (e.name === 'AbortError') {
        console.log('Referral hierarchy request cancelled');
        return;
      }
      
      set({ 
        loading: false,
        error: e?.message || 'Failed to refresh referral hierarchy' 
      });
      throw e;
    }
  },
  refreshWithdrawal: async () => {
    try {
      // Get withdrawal balance
      const balanceResponse = await axiosClient.get('/v1/withdrawals/balance');
      const balanceData = balanceResponse.data.balance;

      // Get withdrawal history - ONLY fetch latest 20 items for performance (not 100!)
      const historyResponse = await axiosClient.get('/v1/withdrawals/history', {
        params: { status: 'ALL', page: 1, limit: 20 }
      });

      set({
        withdrawal: {
          availableBalance: balanceData.availableForWithdrawal || 0,
          pendingWithdrawal: balanceData.pendingWithdrawal || 0,
          totalPaid: balanceData.completedWithdrawal || 0,
          totalEarned: balanceData.totalEarned || 0,
          inWallet: balanceData.inWallet || 0,
          withdrawalHistory: historyResponse.data.withdrawals || [],
        },
        lastUpdate: Date.now(),
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to refresh withdrawal data' });
      throw e;
    }
  },
  startListening: (pageContext?: 'dashboard' | 'referral' | 'withdrawal' | 'commission') => {
    if (intervalId) return; // Prevent duplicate polling
    
    // ⏱️ CACHE TTL: Skip API calls if data fetched < 5 minutes ago
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
    
    // Skip Tier 1 on withdrawal page (doesn't need activation checks every 15s)
    if (pageContext !== 'withdrawal') {
      // ✅ TIER 1: Light polling (every 15s) - Fast status checks
      // Only check activation status and affiliate code (fast, <500ms)
      intervalId = window.setInterval(async () => {
        try {
          // 💾 CACHE CHECK: Skip if data still fresh (< 5 min old)
          const state = useAffiliateStore.getState();
          const timeSinceLastUpdate = state.lastUpdate ? Date.now() - state.lastUpdate : Infinity;
          
          // Skip if affiliate data is still fresh
          if (timeSinceLastUpdate < CACHE_TTL_MS) {
            console.log(`⏭️ Skipping Tier 1 poll - cache fresh (${Math.round(timeSinceLastUpdate / 1000)}s old)`);
            return;
          }
          
          const status = await checkActivationStatus();
          const code = await getAffiliateCodeFromStatus();
          
          // Extract invoice data
          const invoiceData = status.payment || status.invoice;
          let invoiceState: InvoiceState = { status: null };
          
          if (invoiceData) {
            const paymentStatus = invoiceData.status;
            invoiceState = {
              id: invoiceData.id,
              amount: invoiceData.amount,
              status: paymentStatus === 'COMPLETED' ? 'PAID' : 'PENDING' as const,
              invoiceUrl: invoiceData.invoiceUrl || '',
              expiredAt: invoiceData.expiredAt || '',
            };
          }
          
          set((prev: StoreState) => ({
            affiliate: {
              ...prev.affiliate,
              isActive: !!status?.isActive,
              affiliateCode: code || prev.affiliate.affiliateCode || null,
              activatedAt: status?.affiliate?.activatedAt || status?.earnInfo?.activatedAt || prev.affiliate.activatedAt || null,
            },
            invoice: invoiceState,
            lastUpdate: Date.now(),
          }));
        } catch (err) {
          console.error('Light polling error:', err);
        }
      }, 15000); // Every 15 seconds
    }
    
    // Tier 2: Skip on withdrawal page (doesn't need program data every 30s)
    if (pageContext !== 'withdrawal') {
      // 🟡 TIER 2: Medium polling (every 30s) - Program & balance updates
      // Only fetch program dashboard and withdrawal balance (medium, ~1s)
      mediumPollIntervalId = window.setInterval(async () => {
        try {
          // 💾 CACHE CHECK: Skip if data still fresh (< 5 min old)
          const state = useAffiliateStore.getState();
          const timeSinceLastUpdate = state.lastUpdate ? Date.now() - state.lastUpdate : Infinity;
          
          if (timeSinceLastUpdate < CACHE_TTL_MS) {
            console.log(`⏭️ Skipping Tier 2 poll - cache fresh (${Math.round(timeSinceLastUpdate / 1000)}s old)`);
            return;
          }
          
          const [programData, balanceResponse] = await Promise.all([
            getReferralProgramDashboard(),
            axiosClient.get('/v1/withdrawals/balance'),
          ]);
          
          const balanceData = balanceResponse.data.balance;
          
          set((prev: StoreState) => ({
            affiliate: {
              ...prev.affiliate,
              totalEarnings: programData?.affiliate?.totalEarnings || prev.affiliate.totalEarnings,
              totalPaid: programData?.affiliate?.totalPaid || prev.affiliate.totalPaid,
            },
            referralProgram: programData,
            withdrawal: {
              ...prev.withdrawal,
              availableBalance: balanceData.availableForWithdrawal || 0,
              pendingWithdrawal: balanceData.pendingWithdrawal || 0,
              totalPaid: balanceData.completedWithdrawal || 0,
              totalEarned: balanceData.totalEarned || 0,
              inWallet: balanceData.inWallet || 0,
            },
            lastUpdate: Date.now(),
          }));
        } catch (err) {
          console.error('Medium polling error:', err);
        }
      }, 30000); // Every 30 seconds
    } else {
      // On withdrawal page: ONLY poll balance (lightweight)
      mediumPollIntervalId = window.setInterval(async () => {
        try {
          // 💾 CACHE CHECK: Skip if data still fresh (< 5 min old)
          const state = useAffiliateStore.getState();
          const timeSinceLastUpdate = state.lastUpdate ? Date.now() - state.lastUpdate : Infinity;
          
          if (timeSinceLastUpdate < CACHE_TTL_MS) {
            console.log(`⏭️ Skipping Tier 2 withdrawal poll - cache fresh (${Math.round(timeSinceLastUpdate / 1000)}s old)`);
            return;
          }
          
          const balanceResponse = await axiosClient.get('/v1/withdrawals/balance');
          const balanceData = balanceResponse.data.balance;
          
          set((prev: StoreState) => ({
            withdrawal: {
              ...prev.withdrawal,
              availableBalance: balanceData.availableForWithdrawal || 0,
              pendingWithdrawal: balanceData.pendingWithdrawal || 0,
              totalPaid: balanceData.completedWithdrawal || 0,
              totalEarned: balanceData.totalEarned || 0,
              inWallet: balanceData.inWallet || 0,
            },
            lastUpdate: Date.now(),
          }));
        } catch (err) {
          console.error('Withdrawal balance polling error:', err);
        }
      }, 30000); // Every 30 seconds
    }
    
    // 🔴 TIER 3: Heavy polling (every 60s) - Commission & withdrawal history
    // Only fetch commission and withdrawal history (heavy, ~1-2s)
    heavyPollIntervalId = window.setInterval(async () => {
      try {
        // 💾 CACHE CHECK: Skip if data still fresh (< 5 min old)
        const state = useAffiliateStore.getState();
        const timeSinceLastUpdate = state.lastUpdate ? Date.now() - state.lastUpdate : Infinity;
        
        if (timeSinceLastUpdate < CACHE_TTL_MS) {
          console.log(`⏭️ Skipping Tier 3 poll - cache fresh (${Math.round(timeSinceLastUpdate / 1000)}s old)`);
          return;
        }
        
        const [commissionData, historyResponse] = await Promise.all([
          getCommissionBreakdown({ page: 1, limit: 5 }),
          axiosClient.get('/v1/withdrawals/history', {
            params: { status: 'ALL', page: 1, limit: 20 }
          }),
        ]);
        
        set((prev: StoreState) => ({
          commissionBreakdown: commissionData,
          withdrawal: {
            ...prev.withdrawal,
            withdrawalHistory: historyResponse.data.withdrawals || [],
          },
          lastUpdate: Date.now(),
        }));
      } catch (err) {
        console.error('Heavy polling error:', err);
      }
    }, 60000); // Every 60 seconds
  },
  stopListening: () => {
    // Stop all polling intervals
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    if (mediumPollIntervalId) {
      window.clearInterval(mediumPollIntervalId);
      mediumPollIntervalId = null;
    }
    if (heavyPollIntervalId) {
      window.clearInterval(heavyPollIntervalId);
      heavyPollIntervalId = null;
    }
    // NOTE: Don't abort hierarchy request here - let it complete naturally
    // Only abort on new refreshReferralHierarchy() call if previous still pending
  },
});

export const useAffiliateStore = create<StoreState>(creator);
