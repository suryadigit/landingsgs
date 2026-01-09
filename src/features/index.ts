export * from "./auth";
export * from "./commission";

export {
  getReferralProgramDashboard,
  type SubReferral,
  type ReferralMember,
  type ReferralProgramResponse,
} from "./referral/api";
export { default as ReferralPage } from "./referral/pages/ReferralPage";
export { useReferral } from "./referral/hooks/useReferral";
export * from "./referral/components/ReferralComponents";
export * from "./referral/types/referralTypes";
export {
  calculateEarnings,
  normalizeStatus,
  transformReferralData,
  transformReferralArray,
  filterReferrals,
  generateLevelOptions,
  getStatusColors,
  getFontSizeForCurrency,
} from "./referral/utils/referralUtils";

export * from "./withdrawal";
export * from "./notification/types/notificationPageTypes";
export * from "./admin";
export * from "./profile";
export * from "./affiliate";

export {
  default as DashboardAffiliatePage,
} from "./dashboard/pages/DashboardAffiliatePage";
export {
  default as DashboardAdminPage,
} from "./dashboard/pages/DashboardAdminPage";
export {
  useDashboardAffiliate,
  getResponsiveFontSize,
} from "./dashboard/hooks/useDashboardAffiliate";
export { useAdminDashboard } from "./dashboard/hooks/useAdminDashboard";
export { STATUS_MAP, DEFAULT_STATUS_BADGE, LEVEL_COLORS } from "./dashboard/constants/dashboardConstants";
export type {
  StatusBadgeInfo,
  StatCard,
  CommissionBreakdownItem,
  LevelColors,
} from "./dashboard/types/dashboardTypes";

export * from "./common";
