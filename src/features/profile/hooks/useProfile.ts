import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '../store/profileStore';
import { useAuth, requestPhoneOtp, verifyPhoneOtp, type UserProfile } from '../../auth';

export interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  isEditing: boolean;
  bank: string;
  alamat: string;
  fullName: string;
  phone: string;
  
  // OTP state
  showOtpModal: boolean;
  otpCode: string;
  isRequestingOtp: boolean;
  isVerifyingOtp: boolean;
  otpCountdown: number;
  pendingPhone: string;
  
  setBank: (value: string) => void;
  setAlamat: (value: string) => void;
  setFullName: (value: string) => void;
  setPhone: (value: string) => void;
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
  setOtpCode: (value: string) => void;
  startEditing: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  refreshProfile: () => Promise<void>;
  closeOtpModal: () => void;
  resendOtp: () => Promise<void>;
  verifyOtp: () => Promise<void>;
  
  formatDate: (dateString: string) => string;
}

export function useProfile(): UseProfileReturn {
  const { setUser, user } = useAuth();
  
  const {
    profile,
    isLoading,
    isSaving,
    error,
    success,
    fetchProfile,
    updateProfile,
    setError,
    setSuccess,
  } = useProfileStore();
  
  const [isEditing, setIsEditing] = useState(false);
  
  const [bank, setBank] = useState('');
  const [alamat, setAlamat] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingFullName, setPendingFullName] = useState('');
  const [pendingBank, setPendingBank] = useState('');
  const [pendingAlamat, setPendingAlamat] = useState('');

  useEffect(() => {
    fetchProfile(true); 
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setBank(profile.bank || '');
      setAlamat(profile.alamat || '');
    }
  }, [profile]);
  
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  }, [setError, setSuccess]);
  
  const requestOtpForPhone = useCallback(async (newPhone: string) => {
    if (!profile?.id) {
      setError('User ID tidak ditemukan');
      return;
    }
    
    setIsRequestingOtp(true);
    setError(null);
    
    try {
      await requestPhoneOtp({ 
        userId: profile.id, 
        phone: newPhone,
        method: 'WHATSAPP'
      });
      setOtpCountdown(60); // 60 seconds cooldown
      setSuccess('Kode OTP telah dikirim ke WhatsApp');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim OTP');
      throw err;
    } finally {
      setIsRequestingOtp(false);
    }
  }, [profile?.id, setError, setSuccess]);

const handleSave = useCallback(async () => {
  const bankChanged = bank.trim() !== (profile?.bank || '');
  const alamatChanged = alamat.trim() !== (profile?.alamat || '');
  const phoneChanged = phone.trim() !== (profile?.phone || '');
  const nameChanged = fullName.trim() !== (profile?.fullName || '');

  if (phoneChanged && phone.trim()) {
    setPendingPhone(phone.trim());
    setPendingFullName(fullName.trim());
    setPendingAlamat(alamat.trim());
    setPendingBank(bank.trim());
    setShowOtpModal(true);
    setOtpCode('');

    try {
      await requestOtpForPhone(phone.trim());
    } catch {
      setShowOtpModal(false);
    }
    return;
  }

  if (nameChanged || bankChanged || alamatChanged) {
    const payload: { fullName?: string; bank?: string; alamat?: string } = {};
    if (nameChanged) payload.fullName = fullName.trim() || undefined;
    if (bankChanged) payload.bank = bank.trim() || undefined;
    if (alamatChanged) payload.alamat = alamat.trim() || undefined;

    const success = await updateProfile(payload as any);
    if (success) {
      setIsEditing(false);
      if (user && profile) {
        setUser({
          ...user,
          fullName: payload.fullName ?? user.fullName,
          phone: profile.phone,
          isPhoneVerified: true,
          bank: payload.bank ?? (user as any).bank,
          alamat: payload.alamat ?? (user as any).alamat,
        } as any);
      }
    }
  } else {
    setIsEditing(false);
  }
}, [fullName, phone, bank, alamat, profile, updateProfile, user, setUser, requestOtpForPhone]);




  
  const handleCancel = useCallback(() => {
    setFullName(profile?.fullName || '');
    setPhone(profile?.phone || '');
    setBank(profile?.bank || '');
    setAlamat(profile?.alamat || '');
    setIsEditing(false);
    setError(null);
  }, [profile, setError]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile(true);
  }, [fetchProfile]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);
  
  const closeOtpModal = useCallback(() => {
    setShowOtpModal(false);
    setOtpCode('');
    setPendingPhone('');
    setPendingFullName('');
    setPendingBank('');
    setPendingAlamat('');
  }, []);
  
  const resendOtp = useCallback(async () => {
    if (otpCountdown > 0 || !pendingPhone) return;
    
    try {
      await requestOtpForPhone(pendingPhone);
    } catch {
      // Error already handled
    }
  }, [otpCountdown, pendingPhone, requestOtpForPhone]);
  
  const verifyOtp = useCallback(async () => {
    if (!otpCode || otpCode.length < 4 || !profile?.id) {
      setError('Masukkan kode OTP yang valid');
      return;
    }
    
    setIsVerifyingOtp(true);
    setError(null);
    
    try {
      await verifyPhoneOtp({ 
        userId: profile.id, 
        code: otpCode 
      });
      
      const updateSuccess = await updateProfile({
        fullName: pendingFullName || undefined,
        phone: pendingPhone,
        bank: pendingBank || undefined,
        alamat: pendingAlamat || undefined,
      });
      
      if (updateSuccess) {
        setShowOtpModal(false);
        setIsEditing(false);
        setOtpCode('');
        setPendingPhone('');
        setPendingFullName('');
        setSuccess('Nomor telepon berhasil diverifikasi dan diperbarui');
        
        if (user && profile) {
          setUser({
            ...user,
            fullName: pendingFullName || user.fullName,
            phone: pendingPhone,
            isPhoneVerified: true,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Kode OTP tidak valid');
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [otpCode, pendingPhone, pendingFullName, updateProfile, user, profile, setUser, setError, setSuccess]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    success,
    isEditing,
    bank,
    alamat,
    fullName,
    phone,
    showOtpModal,
    otpCode,
    isRequestingOtp,
    isVerifyingOtp,
    otpCountdown,
    pendingPhone,
    setBank,
    setAlamat,
    setFullName,
    setPhone,
    setError,
    setSuccess,
    setOtpCode,
    startEditing,
    handleSave,
    handleCancel,
    refreshProfile,
    closeOtpModal,
    resendOtp,
    verifyOtp,
    formatDate,
  };
}

