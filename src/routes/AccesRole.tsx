import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth";
import { Center, Loader } from "@mantine/core";

export function AccesRole() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  const role = user.role?.toUpperCase() || "MEMBER";
  if (role === "SUPERADMIN" || role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard-affiliate" replace />;
}

export default AccesRole;
