import { Routes, Route } from 'react-router-dom'
import SignIn from '../pages/auth/signinPages/signin'
import SignUp from '../pages/auth/signupPages/signup'
import VerifyEmail from '../pages/auth/verify-email'
import VerifyPhone from '../pages/auth/verify-phone'
import ForgotPassword from '../pages/auth/forgot-password'
import PaymentPage from '../pages/auth/payment'
import NotFound from '../pages/Not404/404'
import DashboardAffiliate from '../pages/dashboards/dashboard.affiliate'
import DashboardAdmin from '../pages/dashboards/dashboard.admin'
import Referral from '../pages/referral/referral'
import CommissionPage from '../pages/commission/commission'
import WithdrawalPage from '../pages/withdarwl/withdarwl.pages'
import ApprovalByAdmin from '../pages/adminSuperadmin/approvalKomisi/approvalByAdmin'
import NotificationsPage from '../pages/notifications/notifications'
import ProfilePage from '../pages/profile/profile'
import UserManagementPage from '../pages/adminSuperadmin/userManagement/userManagement'
import RoleManagementPage from '../pages/adminSuperadmin/roleManagement/roleManagement'
import { DashboardRedirect } from './DashboardRedirect'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route path="/dashboard-affiliate" element={<DashboardAffiliate />} />
      <Route path="/dashboard-admin" element={<DashboardAdmin />} />
      <Route path="/admin/dashboard" element={<DashboardAdmin />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-phone" element={<VerifyPhone />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/referral" element={<Referral />} />
      <Route path="/referral-commission" element={<Referral />} />
      <Route path="/commission" element={<CommissionPage />} />
      <Route path="/commission-history" element={<CommissionPage />} />
      <Route path="/withdrawal" element={<WithdrawalPage />} />
      <Route path="/wallet" element={<WithdrawalPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/approval-commission" element={<ApprovalByAdmin />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/admin/roles" element={<RoleManagementPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
