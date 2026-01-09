import { Navigate } from 'react-router-dom';
import { Box, Loader, Text, Center } from '@mantine/core';
import { useAuth } from '../../features/auth';
import { useRole } from '../../shared/hooks';
import type { UserRole } from '../../features/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { can } = useRole();

  if (isLoading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Box style={{ textAlign: 'center' }}>
          <Loader />
          <Text mt="md">Loading...</Text>
        </Box>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole) {
    const hasRequiredRole = can(requiredRole);
    if (!hasRequiredRole) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <Center style={{ minHeight: '100vh' }}>
          <Box style={{ textAlign: 'center' }}>
            <Text size="lg" fw={700}>Access Denied</Text>
            <Text size="sm" c="dimmed">Anda tidak memiliki akses ke halaman ini</Text>
          </Box>
        </Center>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
