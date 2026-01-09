import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface SearchItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  path: string;
}

// Search items untuk navigasi
const SEARCH_ITEMS: SearchItem[] = [
  { id: 'dashboard', title: 'Dashboard', category: 'Navigasi', icon: '📊', path: '/dashboard' },
  { id: 'referral', title: 'Referrals', category: 'Navigasi', icon: '👥', path: '/referral' },
  { id: 'commission', title: 'Commission', category: 'Laporan', icon: '💰', path: '/commission' },
  { id: 'breakdown', title: 'Breakdown', category: 'Laporan', icon: '🧾', path: '/breakdown' },
  { id: 'withdrawal', title: 'Withdrawal', category: 'Keuangan', icon: '💸', path: '/withdrawal' },
  { id: 'invoice', title: 'Invoices', category: 'Keuangan', icon: '🧾', path: '/invoice' },
];

export const POPULAR_SEARCHES = ['Dashboard', 'Referrals', 'Commission', 'Withdrawal'];
export const QUICK_NAV_ITEMS = ['Referrals', 'Commission', 'Withdrawal', 'Invoices'];

export function useHeaderSearch() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const searchItems = SEARCH_ITEMS;

  const filteredResults = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.category.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Search handlers
  const openSearch = useCallback(() => setSearchOpen(true), []);
  
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchValue('');
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const navigateToItem = useCallback((path: string) => {
    navigate(path);
    closeSearch();
  }, [navigate, closeSearch]);

  const getItemByTitle = useCallback((title: string) => {
    return searchItems.find(s => s.title === title);
  }, [searchItems]);

  const getIconByTitle = useCallback((title: string) => {
    const icons: Record<string, string> = {
      'Referrals': '👥',
      'Commission': '💰',
      'Withdrawal': '💸',
      'Invoices': '🧾',
      'Dashboard': '📊',
      'Breakdown': '🧾',
    };
    return icons[title] || '📄';
  }, []);

  return {
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
  };
}
