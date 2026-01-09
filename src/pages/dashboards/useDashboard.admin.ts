import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../api/apis";

interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  totalOmset: number;
  pendingApprovals: number;
  totalCommissionPaid: number;
  approvalRate: number;
  monthlyTargetProgress: number;
}

interface PendingApproval {
  label: string;
  count: number;
  amount: string;
  status: "pending" | "approved" | "rejected";
}

interface RecentActivity {
  type: "approval" | "withdrawal" | "commission";
  title: string;
  time: string;
}

interface TopAffiliate {
  id: string;
  code: string;
  name: string;
  email: string;
  totalEarnings: number;
  totalPaid: number;
  referralsCount: number;
  status: string;
  joinDate: string;
}

interface UseAdminDashboardReturn {
  isLoading: boolean;
  error: string | null;
  stats: AdminStats;
  pendingApprovals: PendingApproval[];
  recentActivity: RecentActivity[];
  topAffiliates: TopAffiliate[];
  refetch: () => void;
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const [error, setError] = useState<string | null>(null);

  // Fetch admin affiliate dashboard from backend
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ["adminAffiliateDashboard"],
    queryFn: async () => {
      try {
        setError(null);
        const response = await axiosClient.get("/v1/admin/affiliate/dashboard");
        console.log("=== Admin Dashboard API Response ===", response.data);
        return response.data;
      } catch (err: any) {
        console.warn("Admin dashboard endpoint error:", err?.message);
        const errorMsg = err?.response?.data?.error || err?.message || "Failed to load dashboard";
        setError(errorMsg);
        // Return empty structure instead of null to prevent crashes
        return null;
      }
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once
  });

  // Handle both possible response structures from backend
  // Structure 1 (new): { summary: { affiliates, commissions, withdrawals, network }, topAffiliates, recentCommissions }
  // Structure 2 (old): { totalAffiliates, totalPendingCount, totalPendingAmount, ... }
  
  let stats: AdminStats;
  
  if (dashboardData?.summary) {
    // New structure with nested summary
    const summary = dashboardData.summary;
    const affiliates = summary?.affiliates || {};
    const commissions = summary?.commissions || {};
    
    stats = {
      totalMembers: affiliates.total || 0,
      activeMembers: affiliates.active || 0,
      totalOmset: commissions.total || 0,
      pendingApprovals: affiliates.pending || 0,
      totalCommissionPaid: commissions.approved || 0,
      approvalRate: affiliates.total > 0 
        ? Math.round((affiliates.active / affiliates.total) * 100) 
        : 0,
      monthlyTargetProgress: 65,
    };
  } else if (dashboardData) {
    // Old/alternative structure - direct fields
    stats = {
      totalMembers: dashboardData.totalAffiliates || dashboardData.totalMembers || 0,
      activeMembers: dashboardData.activeAffiliates || dashboardData.activeMembers || 0,
      totalOmset: dashboardData.totalCommissions || dashboardData.totalOmset || 0,
      pendingApprovals: dashboardData.totalPendingCount || dashboardData.pendingApprovals || 0,
      totalCommissionPaid: dashboardData.totalPendingAmount || dashboardData.totalCommissionPaid || 0,
      approvalRate: dashboardData.approvalRate || 0,
      monthlyTargetProgress: dashboardData.monthlyTargetProgress || 65,
    };
  } else {
    // No data - use defaults
    stats = {
      totalMembers: 0,
      activeMembers: 0,
      totalOmset: 0,
      pendingApprovals: 0,
      totalCommissionPaid: 0,
      approvalRate: 0,
      monthlyTargetProgress: 0,
    };
  }
  
  // Get nested data for older structures
  const summary = dashboardData?.summary || {};
  const commissions = summary?.commissions || {};
  const withdrawals = summary?.withdrawals || {};
  const affiliates = summary?.affiliates || {};

  // Build pending approvals list
  const pendingApprovals: PendingApproval[] = [];

  if (commissions.pending > 0) {
    pendingApprovals.push({
      label: "Komisi Pending",
      count: dashboardData?.recentCommissions?.filter((c: any) => c.status === 'PENDING')?.length || 0,
      amount: `Rp ${(commissions.pending || 0).toLocaleString("id-ID")}`,
      status: "pending",
    });
  }

  if (withdrawals.pending > 0) {
    pendingApprovals.push({
      label: "Pencairan Dana Pending",
      count: 0, // Could be fetched separately
      amount: `Rp ${(withdrawals.pending || 0).toLocaleString("id-ID")}`,
      status: "pending",
    });
  }

  if (affiliates.pending > 0) {
    pendingApprovals.push({
      label: "Affiliate Pending Aktivasi",
      count: affiliates.pending,
      amount: "-",
      status: "pending",
    });
  }

  // Convert recent commissions to activity format
  const recentCommissions = dashboardData?.recentCommissions || [];
  const recentActivity: RecentActivity[] = recentCommissions.slice(0, 5).map((c: any) => ({
    type: "commission" as const,
    title: `Komisi Rp ${c.amount?.toLocaleString("id-ID")} dari ${c.from || 'Unknown'}`,
    time: c.date ? new Date(c.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }) : "-",
  }));

  // Top affiliates from API
  const topAffiliates: TopAffiliate[] = dashboardData?.topAffiliates || [];

  return {
    isLoading,
    error,
    stats,
    pendingApprovals,
    recentActivity,
    topAffiliates,
    refetch,
  };
}
