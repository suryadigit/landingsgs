import { useState, useCallback, useEffect, useRef } from 'react';
import { checkPaymentStatusById } from '../api/apis';

export interface PaymentData {
  id: string;
  amount: number;
  invoiceUrl: string;
  status: string;
  expiredAt: string;
  remainingMinutes?: number;
}

interface UsePaymentFlowReturn {
  payment: PaymentData | null;
  isPolling: boolean;
  isPaid: boolean;
  timeLeft: string;
  error: string | null;
  startPolling: () => void;
  stopPolling: () => void;
  loadPaymentFromStorage: () => void;
  setPaymentFromState: (paymentData: PaymentData) => void;
  clearPayment: () => void;
}

export const usePaymentFlow = (): UsePaymentFlowReturn => {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load payment from localStorage
  const loadPaymentFromStorage = useCallback(() => {
    console.log('🔄 Loading payment from storage...');
    
    // Try localStorage first
    const stored = localStorage.getItem('pendingPayment');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('✅ Payment loaded from localStorage:', parsed);
        setPayment(parsed);
        setError(null);
        return;
      } catch (e) {
        console.error('❌ localStorage parse error:', e);
        localStorage.removeItem('pendingPayment');
      }
    }

    // Try sessionStorage as fallback
    const sessionStored = sessionStorage.getItem('pendingPayment');
    if (sessionStored) {
      try {
        const parsed = JSON.parse(sessionStored);
        console.log('✅ Payment loaded from sessionStorage:', parsed);
        setPayment(parsed);
        localStorage.setItem('pendingPayment', JSON.stringify(parsed));
        sessionStorage.removeItem('pendingPayment');
        setError(null);
        return;
      } catch (e) {
        console.error('❌ sessionStorage parse error:', e);
        sessionStorage.removeItem('pendingPayment');
      }
    }

    console.warn('⚠️ No payment data found in storage');
    setError('Data pembayaran tidak ditemukan');
  }, []);

  // Calculate remaining time
  useEffect(() => {
    if (!payment?.expiredAt) {
      setTimeLeft('');
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const expireTime = new Date(payment.expiredAt);
      const diff = expireTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    };

    updateTime();
    timerIntervalRef.current = setInterval(updateTime, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [payment?.expiredAt]);

  // Start polling for payment status
  const startPolling = useCallback(() => {
    if (!payment?.id) {
      console.error('❌ No payment ID to poll');
      return;
    }

    console.log('🚀 Starting payment polling...');
    setIsPolling(true);
    setError(null);

    const poll = async () => {
      try {
        console.log(`📊 Checking payment status: ${payment.id}`);
        const response = await checkPaymentStatusById(payment.id);

        console.log('📊 Poll response:', response);

        // Check various possible success responses
        const isSuccess =
          response.paymentStatus === 'COMPLETED' ||
          response.paymentStatus === 'PAID' ||
          response.status === 'COMPLETED';

        if (isSuccess) {
          console.log('🎉 PAYMENT SUCCESSFUL!');
          setIsPaid(true);
          setIsPolling(false);
          
          // Clear storage
          localStorage.removeItem('pendingPayment');
          sessionStorage.removeItem('pendingPayment');

          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          
          return;
        }

        // Check if expired
        if (response.paymentStatus === 'EXPIRED' || response.error?.includes('expired')) {
          console.log('⏰ Payment expired');
          setError('Invoice telah expired. Silakan buat invoice baru.');
          setIsPolling(false);
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          
          return;
        }

      } catch (err: any) {
        console.error('❌ Poll error:', err?.message);
        setError(err?.message || 'Error checking payment status');
      }
    };

    // Poll immediately, then every 5 seconds
    poll();
    pollIntervalRef.current = setInterval(poll, 5000);
  }, [payment?.id]);

  // Stop polling
  const stopPolling = useCallback(() => {
    console.log('⏸️ Stopping payment polling');
    setIsPolling(false);
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Clear payment data
  const clearPayment = useCallback(() => {
    console.log('🗑️ Clearing payment data');
    setPayment(null);
    setIsPaid(false);
    setError(null);
    localStorage.removeItem('pendingPayment');
    sessionStorage.removeItem('pendingPayment');
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Set payment from state/prop (for location.state handling)
  const setPaymentFromState = useCallback((paymentData: PaymentData) => {
    console.log('✅ Setting payment from state:', paymentData);
    setPayment(paymentData);
    setError(null);
    
    // Also save to storage as backup
    localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
    sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Auto-load payment on mount
  useEffect(() => {
    console.log('🔄 usePaymentFlow mounted - Auto-loading payment...');
    loadPaymentFromStorage();
  }, [loadPaymentFromStorage]);

  return {
    payment,
    isPolling,
    isPaid,
    timeLeft,
    error,
    startPolling,
    stopPolling,
    loadPaymentFromStorage,
    setPaymentFromState,
    clearPayment,
  };
};
