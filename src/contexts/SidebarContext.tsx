import React, { createContext, useState, useContext, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STATE_KEY = 'sidebar_state';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
      if (stored === null) {
        return true;
      }
      return JSON.parse(stored);
    } catch {
      return true;
    }
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isOpen));
    } catch {
      // Silent fail
    }
  }, [isOpen]);

  const toggleSidebar = () => {
    setIsOpen((prev: boolean) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
