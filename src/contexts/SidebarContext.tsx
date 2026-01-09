import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STATE_KEY = 'sidebar_state';
const SIDEBAR_WIDTH_KEY = 'sidebar_width';
const MIN_WIDTH = 60;
const MAX_WIDTH = 320;
const DEFAULT_WIDTH = 280;

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

  const [sidebarWidth, setSidebarWidthState] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      if (stored === null) {
        return DEFAULT_WIDTH;
      }
      const width = JSON.parse(stored);
      return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
    } catch {
      return DEFAULT_WIDTH;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isOpen));
    } catch {
      // Silent fail
    }
  }, [isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, JSON.stringify(sidebarWidth));
    } catch {
      // Silent fail
    }
  }, [sidebarWidth]);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev: boolean) => !prev);
  }, []);

  const setSidebarWidth = useCallback((width: number) => {
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
    setSidebarWidthState(clampedWidth);
    
    if (clampedWidth <= MIN_WIDTH + 20) {
      setIsOpen(false);
    } else if (!isOpen && clampedWidth > MIN_WIDTH + 40) {
      setIsOpen(true);
    }
  }, [isOpen]);

  return (
    <SidebarContext.Provider value={{ isOpen, sidebarWidth, toggleSidebar, setSidebarWidth }}>
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
