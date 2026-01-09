import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth.context";
import { Center, Loader } from "@mantine/core";

/**
 * Component that redirects users to the appropriate dashboard based on their role
 * - SUPERADMIN & ADMIN -> /dashboard-admin
 * - MEMBER -> /dashboard-affiliate
 */
export function DashboardRedirect() {
  const { user, isLoading } = useAuth();

  // Show loader while checking auth
  if (isLoading) {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  // If no user, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Get user role
  const role = user.role?.toUpperCase() || "MEMBER";

  // Redirect based on role
  if (role === "SUPERADMIN" || role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Default to affiliate dashboard for MEMBER
  return <Navigate to="/dashboard-affiliate" replace />;
}

export default DashboardRedirect;
