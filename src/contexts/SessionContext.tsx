import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '../features/auth';

interface SessionContextType {
  isSessionActive: boolean;
  lastActivityTime: number;
  resetInactivityTimer: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_STORAGE_KEY = 'last_activity';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isAuthenticated) {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        lastActivityRef.current = parseInt(stored, 10);
      } else {
        lastActivityRef.current = Date.now();
        sessionStorage.setItem(SESSION_STORAGE_KEY, lastActivityRef.current.toString());
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      lastActivityRef.current = Date.now();
      sessionStorage.setItem(SESSION_STORAGE_KEY, lastActivityRef.current.toString());

      inactivityTimerRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isAuthenticated, logout]);

  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();
    sessionStorage.setItem(SESSION_STORAGE_KEY, lastActivityRef.current.toString());
  };

  return (
    <SessionContext.Provider
      value={{
        isSessionActive: isAuthenticated,
        lastActivityTime: lastActivityRef.current,
        resetInactivityTimer,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
