import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FriendlyError } from '../shared/utils/errorUtils';

type ErrorContextType = {
  error: FriendlyError | null;
  setError: (err: FriendlyError | null) => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

let externalSetter: ((err: FriendlyError | null) => void) | null = null;

export const setGlobalError = (err: FriendlyError | null) => {
  if (externalSetter) externalSetter(err);
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<FriendlyError | null>(null);

  useEffect(() => {
    externalSetter = setError;
    return () => { externalSetter = null; };
  }, []);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export function useError() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useError must be used within ErrorProvider');
  return ctx;
}

export default ErrorContext;
