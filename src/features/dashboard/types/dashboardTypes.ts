export interface StatusBadgeInfo {
  text: string;
  bgColor: string;
  dotColor: string;
}

export interface StatCard {
  label: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface CommissionBreakdownItem {
  level: string;
  description: string;
  amount: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface LevelColors {
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  totalOmset: number;
  pendingApprovals: number;
  totalCommissionPaid: number;
  approvalRate: number;
  monthlyTargetProgress: number;
}

export interface PendingApproval {
  label: string;
  count: number;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RecentActivity {
  type: 'approval' | 'withdrawal' | 'commission';
  title: string;
  time: string;
}

export interface TopAffiliate {
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
