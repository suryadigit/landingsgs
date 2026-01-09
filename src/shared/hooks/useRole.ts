import { useAuth, type UserRole } from "../../features/auth";

export const useRole = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase() || "MEMBER";
  
  const can = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const normalizedRoles = roles.map(r => r.toUpperCase());
    
    if (role === "SUPERADMIN") return true;
    
    if (role === "ADMIN" && normalizedRoles.some(r => r === "ADMIN" || r === "MEMBER")) {
      return true;
    }
    
    return normalizedRoles.includes(role);
  };
  
  return {
    role,
    isAdmin: role === "ADMIN" || role === "SUPERADMIN",
    isSuperAdmin: role === "SUPERADMIN",
    isMember: role === "MEMBER",
    can,
  };
};
