import { useQuery } from "@tanstack/react-query";
import { getReferralProgramDashboard, type ReferralProgramResponse } from "../../features/referral";
import { useAuth } from '../../features/auth';
import axiosClient from "../api/axios";

export const referralKeys = {
  all: ["referral"] as const,
  dashboard: () => [...referralKeys.all, "dashboard"] as const,
};

export const useReferralDashboard = () => {
  const { token } = useAuth();

  return useQuery<ReferralProgramResponse>({
    queryKey: referralKeys.dashboard(),
    queryFn: getReferralProgramDashboard,
    staleTime: 30 * 1000,
    refetchInterval: 2 * 60 * 1000,
    enabled: !!token,
  });
};

export const fetchAndUpdateUserLevel = async (): Promise<number> => {
  try {
    const response = await axiosClient.get("/v1/users/profile");
    return response.data?.user?.level || 0;
  } catch {
    return 0;
  }
};
