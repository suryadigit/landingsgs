import axiosClient from "../../../shared/api/axios";

export interface SubReferral {
  id: string;
  name: string;
  code: string;
  email: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";
  joinDate: string;
  subReferrals?: SubReferral[];
  subReferralCount?: number;
}

export interface ReferralMember {
  id: string;
  name: string;
  code: string;
  email: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";
  level?: string;
  joinDate: string;
  totalEarnings: number;
  pendingEarnings?: number;
  approvedEarnings?: number;
  subReferrals?: SubReferral[];
  subReferralCount?: number;
}

export interface ReferralProgramResponse {
  message: string;
  affiliate: {
    id: string;
    name: string;
    code: string;
    status: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";
    level?: string;
    joinDate: string;
    totalEarnings: number;
    totalPaid: number;
  };
  earnings?: { total: number; pending: number; approved: number };
  referrals: { totalCount: number; list: ReferralMember[] };
  summary?: {
    totalMembers: number;
    activeMembers: number;
    totalCommissionDistributed: number;
    pendingCommissions: number;
  };
}

export const getReferralProgramDashboard = async (): Promise<ReferralProgramResponse> => {
  const response = await axiosClient.get<ReferralProgramResponse>("/v1/commissions/referral-hierarchy");
  return response.data;
};
