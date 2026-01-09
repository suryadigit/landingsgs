import { Routes, Route } from 'react-router-dom'
// Auth
import SignIn from '../features/auth/pages/signin'
import SignUp from '../features/auth/pages/signup'
import VerifyEmail from '../features/auth/pages/verify-email'
import VerifyPhone from '../features/auth/pages/verify-phone'
import OtpVerificationPage from '../features/auth/pages/OtpVerificationPage'
import ForgotPassword from '../features/auth/pages/forgot-password'
import PaymentPage from '../features/auth/pages/payment'
// Dashboard
import DashboardAffiliate from '../features/dashboard/pages/DashboardAffiliatePage'
import DashboardAdmin from '../features/dashboard/pages/DashboardAdminPage'
// Features
import Referral from '../features/referral/pages/ReferralPage'
import CommissionPage from '../features/commission/pages/CommissionPage'
import WithdrawalPage from '../features/withdrawal/pages/WithdrawalPage'
import NotificationsPage from '../features/notification/pages/NotificationsPage'
import NotificationDetailPage from '../features/notification/pages/NotificationDetailPage'
import ProfilePage from '../features/profile/pages/profile'
// Admin
import ApprovalByAdmin from '../features/admin/pages/approvalByAdmin'
import UserManagementPage from '../features/admin/pages/userManagement'
import RoleManagementPage from '../features/admin/pages/roleManagement'
// Common
// import NotFound from '../features/common/pages/NotFoundPage'
import AccesRole from './AccesRole'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/dashboard" element={<AccesRole />} />
      <Route path="/dashboard-affiliate" element={<DashboardAffiliate />} />
      <Route path="/dashboard-admin" element={<DashboardAdmin />} />
      <Route path="/admin/dashboard" element={<DashboardAdmin />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-phone" element={<VerifyPhone />} />
      <Route path="/otp-verification" element={<OtpVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/referral" element={<Referral />} />
      <Route path="/referral-commission" element={<Referral />} />
      <Route path="/commission" element={<CommissionPage />} />
      <Route path="/commission-history" element={<CommissionPage />} />
      <Route path="/withdrawal" element={<WithdrawalPage />} />
      <Route path="/wallet" element={<WithdrawalPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/notifications/:id" element={<NotificationDetailPage />} />
      <Route path="/approval-commission" element={<ApprovalByAdmin />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/admin/roles" element={<RoleManagementPage />} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  )
}
