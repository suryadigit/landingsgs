import { useState, useCallback, useEffect, useRef } from 'react';
import { checkPaymentStatusById } from '../api';

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

  const loadPaymentFromStorage = useCallback(() => {
    const stored = localStorage.getItem('pendingPayment');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPayment(parsed);
        setError(null);
        return;
      } catch {
        localStorage.removeItem('pendingPayment');
      }
    }

    const sessionStored = sessionStorage.getItem('pendingPayment');
    if (sessionStored) {
      try {
        const parsed = JSON.parse(sessionStored);
        setPayment(parsed);
        localStorage.setItem('pendingPayment', JSON.stringify(parsed));
        sessionStorage.removeItem('pendingPayment');
        setError(null);
        return;
      } catch {
        sessionStorage.removeItem('pendingPayment');
      }
    }

    setError('Data pembayaran tidak ditemukan');
  }, []);

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

  const startPolling = useCallback(() => {
    if (!payment?.id) return;

    setIsPolling(true);
    setError(null);

    const poll = async () => {
      try {
        const response = await checkPaymentStatusById(payment.id);

        const isSuccess =
          response.paymentStatus === 'COMPLETED' ||
          response.paymentStatus === 'PAID' ||
          response.status === 'COMPLETED';

        if (isSuccess) {
          setIsPaid(true);
          setIsPolling(false);
          localStorage.removeItem('pendingPayment');
          sessionStorage.removeItem('pendingPayment');

          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          return;
        }

        if (response.paymentStatus === 'EXPIRED' || response.error?.includes('expired')) {
          setError('Invoice telah expired. Silakan buat invoice baru.');
          setIsPolling(false);

          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          return;
        }
      } catch (err: any) {
        setError(err?.message || 'Error checking payment status');
      }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, 5000);
  }, [payment?.id]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const clearPayment = useCallback(() => {
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

  const setPaymentFromState = useCallback((paymentData: PaymentData) => {
    setPayment(paymentData);
    setError(null);
    localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
    sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
  }, []);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  useEffect(() => {
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
