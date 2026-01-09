import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../../features/auth';
import { useUserStorage } from './servstorage/useUserStorage';
import { useHeaderTheme } from '././theme/useHeaderTheme';
import { useHeaderSearch } from '././search/useHeaderSearch';

export function useHeader() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { userName, userEmail, userLevel } = useUserStorage();
  const { dark, toggleColorScheme, colors } = useHeaderTheme();
  const {
    searchOpen,
    searchValue,
    searchItems,
    filteredResults,
    openSearch,
    closeSearch,
    handleSearchChange,
    navigateToItem,
    getItemByTitle,
    getIconByTitle,
  } = useHeaderSearch();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/signin');
  }, [logout, navigate]);

  const userRole = user?.role || 'MEMBER';

  return {
    isMobile,
    searchOpen,
    searchValue,
    dark,
    userName,
    userEmail,
    userLevel,
    userRole,
    searchItems,
    filteredResults,

    ...colors,

    toggleColorScheme,
    handleLogout,
    openSearch,
    closeSearch,
    handleSearchChange,
    navigateToItem,
    getItemByTitle,
    getIconByTitle,
  };
}
