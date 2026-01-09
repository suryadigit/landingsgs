import { useState, useEffect, useCallback } from 'react';
import { axiosClient } from '../../../shared/api';
import { useWithdrawalHistory, useCommissionTransactions } from '../../../shared/hooks';
import { WITHDRAWAL_CONSTANTS } from '../constants/withdrawalConstants';
import type { NotificationState, WithdrawalFormData } from '../types/withdrawalPageTypes';

const initialNotification: NotificationState = {
  show: false,
  type: 'info',
  title: '',
  message: ''
};

const initialFormData: WithdrawalFormData = {
  amount: '',
  bankName: '',
  accountNumber: '',
  accountName: ''
};

export const useWithdrawalPage = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [formData, setFormData] = useState<WithdrawalFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(initialNotification);

  const { withdrawal, loading, refreshWithdrawal, startListening, stopListening } = useWithdrawalHistory();
  const { availableBalance: withdrawalAvailable, withdrawalHistory: history } = withdrawal;

  const { data: commissionData } = useCommissionTransactions({ page: 1, limit: 1 });
  const commissionApprovedAmount = commissionData?.summary?.approved || 0;

  const availableBalance = (withdrawalAvailable ?? commissionApprovedAmount) || 0;

  const { MINIMUM_WITHDRAWAL, MAXIMUM_WITHDRAWAL, MINIMUM_BALANCE_REMAINING } = WITHDRAWAL_CONSTANTS;
  const maxAvailableForWithdrawal = Math.max(0, availableBalance - MINIMUM_BALANCE_REMAINING);
  const isWithdrawalAllowed = maxAvailableForWithdrawal >= MINIMUM_WITHDRAWAL;

  useEffect(() => {
    startListening?.();
    
    if (!loading && availableBalance === 0 && history.length === 0) {
      refreshWithdrawal().catch(() => {});
    }
    
    return () => {
      stopListening?.();
    };
  }, []);

  const updateFormField = useCallback((
    field: keyof WithdrawalFormData,
    value: WithdrawalFormData[keyof WithdrawalFormData]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  const showNotification = useCallback((type: NotificationState['type'], title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  }, []);

  const validateWithdrawal = useCallback((): string | null => {
    const withdrawAmountNum = typeof formData.amount === 'string' 
      ? parseFloat(formData.amount) 
      : formData.amount;

    if (!withdrawAmountNum || withdrawAmountNum <= 0) {
      return 'Masukkan jumlah pencairan yang valid';
    }

    if (withdrawAmountNum > maxAvailableForWithdrawal) {
      return `Jumlah pencairan melebihi saldo yang bisa ditarik. Saldo bisa ditarik: Rp ${maxAvailableForWithdrawal.toLocaleString('id-ID')}`;
    }

    if (withdrawAmountNum < MINIMUM_WITHDRAWAL) {
      return `Minimum pencairan adalah Rp ${MINIMUM_WITHDRAWAL.toLocaleString('id-ID')}`;
    }

    if (withdrawAmountNum > MAXIMUM_WITHDRAWAL) {
      return `Maximum pencairan per 24 jam adalah Rp ${MAXIMUM_WITHDRAWAL.toLocaleString('id-ID')}`;
    }

    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      return 'Lengkapi semua data rekening bank (Nama Bank, Nomor Rekening, Nama Akun)';
    }

    return null;
  }, [formData, maxAvailableForWithdrawal, MINIMUM_WITHDRAWAL, MAXIMUM_WITHDRAWAL]);

  const handleWithdrawal = useCallback(async () => {
    const validationError = validateWithdrawal();
    if (validationError) {
      showNotification('error', 'Input Tidak Valid', validationError);
      return;
    }

    try {
      setSubmitting(true);

      const withdrawAmountNum = typeof formData.amount === 'string' 
        ? parseFloat(formData.amount) 
        : formData.amount;

      const payload = {
        amount: withdrawAmountNum,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountName,
      };

      await axiosClient.post('/v1/withdrawals/request', payload);

      showNotification(
        'success',
        'Permintaan Pencairan Berhasil',
        `Pencairan Rp ${withdrawAmountNum.toLocaleString('id-ID')} ke ${formData.bankName} (${formData.accountNumber}) telah diajukan. Admin akan memproses dalam 1-3 hari kerja.`
      );

      setTimeout(() => {
        resetForm();
        setModalOpened(false);
      }, 2000);

      await refreshWithdrawal().catch(() => {});
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Gagal mengajukan pencairan. Silakan coba lagi.';
      showNotification('error', 'Terjadi Kesalahan', errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateWithdrawal, showNotification, resetForm, refreshWithdrawal]);

  const isFormValid = Boolean(
    formData.amount &&
    formData.bankName &&
    formData.accountNumber &&
    formData.accountName &&
    !submitting
  );

  return {
    modalOpened,
    setModalOpened,
    formData,
    updateFormField,
    submitting,
    notification,
    closeNotification,
    handleWithdrawal,
    isFormValid,
    loading,
    availableBalance,
    withdrawalHistory: history,
    maxAvailableForWithdrawal,
    isWithdrawalAllowed,
    constants: {
      MINIMUM_WITHDRAWAL,
      MAXIMUM_WITHDRAWAL,
      MINIMUM_BALANCE_REMAINING,
    }
  };
};


