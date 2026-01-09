import { useQuery } from "@tanstack/react-query";
import { getCommissionDashboardSummary } from "../../features/commission";
import { useAuth } from '../../features/auth';

export const commissionKeys = {
  all: ["commission"] as const,
  dashboard: () => [...commissionKeys.all, "dashboard"] as const,
};

export const useCommissionDashboard = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: commissionKeys.dashboard(),
    queryFn: getCommissionDashboardSummary,
    staleTime: 30 * 1000,
    refetchInterval: 2 * 60 * 1000,
    enabled: !!token,
  });
};
