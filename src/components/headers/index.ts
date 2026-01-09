// Main component
export { DashboardHeader } from './headers';

// Hooks
export { useHeader } from './useHeader';
export { useUserStorage } from './servstorage/useUserStorage';
export { useHeaderTheme } from './theme/useHeaderTheme';
export { useHeaderSearch } from './search/useHeaderSearch';
export type { SearchItem } from './search/useHeaderSearch';

// Sub-components
export { SearchBar } from './search/SearchBar';
export { SearchModal } from './search/SearchModal';
export { UserMenu } from './UserMenu';
export { NotificationMenu } from './notifications/NotificationMenu';
export { ThemeToggle } from './theme/ThemeToggle';