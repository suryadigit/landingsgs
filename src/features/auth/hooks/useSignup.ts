import { useState, useRef, useEffect, useCallback } from "react";
import { signupUser, validateWhatsapp, sendWhatsappCode, verifyWhatsappCode, verifyEmailOtp } from "../api";

interface FormState {
    name: string;
    email: string;
    password: string;
    phone: string;
    referralCode: string;
}

interface SignupSuccessData {
    userId: string;
    email: string;
    otp?: string; 
    payment?: {
        id: string;
        amount: number;
        invoiceUrl: string;
        expiredAt: string;
        status: string;
    };
}

export const useSignup = () => {
    const [formData, setFormData] = useState<FormState>({
        name: "",
        email: "",
        password: "",
        phone: "",
        referralCode: "",
    });

    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [isSignupLoading, setIsSignupLoading] = useState(false);
    const [signupError, setSignupError] = useState<string | null>(null);
    const [signupSuccess, setSignupSuccess] = useState<SignupSuccessData | null>(null);
    
    const isSubmittingRef = useRef(false);

    const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfhjyUsAAAAAPbjPyPC6aDMj5e4MIHEiEVdPpze";
    // Force disable reCAPTCHA for now
    const RECAPTCHA_ENABLED = false;
    const [recaptchaReady, setRecaptchaReady] = useState(!RECAPTCHA_ENABLED);

    const loadRecaptchaEnterprise = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if ((window as any).grecaptcha?.enterprise) {
                const badge = document.querySelector('.grecaptcha-badge') as HTMLElement;
                if (badge) badge.style.visibility = 'visible';
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
            script.async = true;
            script.defer = true;
            script.id = 'recaptcha-enterprise-script';
            script.onload = () => {
                try {
                    (window as any).grecaptcha.enterprise.ready(() => {
                        resolve();
                    });
                } catch (err) {
                    resolve();
                }
            };
            script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
            document.head.appendChild(script);
        });
    };

    const cleanupRecaptcha = () => {
        const badge = document.querySelector('.grecaptcha-badge') as HTMLElement;
        if (badge) {
            badge.style.visibility = 'hidden';
        }
    };

    useEffect(() => {
        if (!RECAPTCHA_ENABLED) {
            setRecaptchaReady(true);
            return;
        }

        let mounted = true;
        loadRecaptchaEnterprise()
            .then(() => {
                if (mounted) setRecaptchaReady(true);
            })
            .catch((err) => console.error('reCAPTCHA load failed', err));

        return () => {
            mounted = false;
            cleanupRecaptcha();
        };
    }, []);

    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [whatsappVerificationToken, setWhatsappVerificationToken] = useState<string | null>(null);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const formatPhone = (raw: string) => {
        let formatted = raw.trim();
        if (formatted.startsWith("0")) formatted = "62" + formatted.slice(1);
        else if (!formatted.startsWith("62")) formatted = "62" + formatted;
        return formatted;
    };

    const sendOtp = useCallback(async () => {
        if (!formData.phone || formData.phone.length < 10) {
            setOtpError("Nomor WhatsApp tidak valid");
            return;
        }

        setIsSendingOtp(true);
        setOtpError(null);

        try {
            const formattedPhone = formatPhone(formData.phone);
            const validateResult = await validateWhatsapp({ phone: formattedPhone });
            if (!validateResult.success) {
                setOtpError("Nomor ini tidak terdaftar di WhatsApp. Pastikan nomor yang Anda masukkan benar.");
                return;
            }

            await sendWhatsappCode({ phone: formattedPhone });

            setOtpSent(true);
            setVerifiedPhone(formattedPhone);
            setCountdown(60);
            setShowOtpModal(true);
        } catch (error: any) {
            console.error("Failed to send OTP", error);
            setOtpError(error.message || "Gagal mengirim OTP. Silakan coba lagi.");
        } finally {
            setIsSendingOtp(false);
        }
    }, [formData.phone]);

    const verifyOtp = useCallback(async () => {
        if (!otpCode || otpCode.length !== 6 || !verifiedPhone) {
            setOtpError("Masukkan kode OTP 6 digit");
            return;
        }

        setIsVerifyingOtp(true);
        setOtpError(null);

        try {
            const result = await verifyWhatsappCode({ phone: verifiedPhone, code: otpCode });
            setOtpVerified(true);
            setWhatsappVerificationToken(result.verificationToken || null);
            setTimeout(() => setShowOtpModal(false), 1200);
        } catch (error: any) {
            console.error("OTP verification failed", error);
            setOtpError(error.message || "Verifikasi OTP gagal. Silakan coba lagi.");
        } finally {
            setIsVerifyingOtp(false);
        }
    }, [otpCode, verifiedPhone]);

    const resendOtp = useCallback(async () => {
        if (countdown > 0 || !verifiedPhone) return;
        setIsSendingOtp(true);
        setOtpError(null);
        try {
            await sendWhatsappCode({ phone: verifiedPhone });
            setCountdown(60);
            setOtpCode("");
        } catch (error: any) {
            setOtpError(error.message || "Gagal mengirim ulang OTP.");
        } finally {
            setIsSendingOtp(false);
        }
    }, [countdown, verifiedPhone]);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailOtpCode, setEmailOtpCode] = useState("");
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailOtpError, setEmailOtpError] = useState<string | null>(null);
    const [emailCountdown, setEmailCountdown] = useState(300);

    useEffect(() => {
        if (showEmailModal && emailCountdown > 0) {
            const t = setTimeout(() => setEmailCountdown((c) => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [emailCountdown, showEmailModal]);

    const verifyEmailOtpHandler = useCallback(async (userId?: string) => {
        if (!emailOtpCode || emailOtpCode.length !== 6 || !userId) {
            setEmailOtpError("Masukkan kode OTP 6 digit");
            return;
        }

        setIsVerifyingEmail(true);
        setEmailOtpError(null);

        try {
            const result = await verifyEmailOtp({ userId, code: emailOtpCode });
            setEmailVerified(true);
            return result;
        } catch (error: any) {
            setEmailOtpError(error.message || "Verifikasi email gagal");
            throw error;
        } finally {
            setIsVerifyingEmail(false);
        }
    }, [emailOtpCode]);

    const isFormValid =
        formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.password.trim() !== "" &&
        formData.phone.trim() !== "" &&
        formData.referralCode.trim() !== "";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name as keyof FormState]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Partial<FormState> = {};

        if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
        if (!formData.email.trim()) newErrors.email = "Email harus diisi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Format email tidak valid";
        if (!formData.password.trim()) newErrors.password = "Password harus diisi";
        if (formData.password.length < 6)
            newErrors.password = "Password minimal 6 karakter";
        if (!formData.phone.trim()) newErrors.phone = "Nomor WhatsApp harus diisi";
        if (!formData.referralCode.trim())
            newErrors.referralCode = "Kode referral wajib diisi";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, recaptchaToken?: string, whatsappVerificationToken?: string | null) => {
        e.preventDefault();

        if (isSubmittingRef.current || isSignupLoading) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        if (RECAPTCHA_ENABLED && !recaptchaToken) {
            setSignupError("reCAPTCHA token diperlukan. Silakan coba lagi.");
            return;
        }

        if (!whatsappVerificationToken) {
            setSignupError("Verifikasi WhatsApp diperlukan. Silakan verifikasi nomor WhatsApp Anda.");
            return;
        }

        isSubmittingRef.current = true;
        setIsSignupLoading(true);
        setSignupError(null);

        try {
            const signupResponse = await signupUser({
                email: formData.email,
                password: formData.password,
                fullName: formData.name,
                phone: formData.phone,
                referralCode: formData.referralCode,
                recaptchaToken: recaptchaToken,
                whatsappVerificationToken: whatsappVerificationToken,
            });

            console.log("Signup berhasil:", signupResponse);

            const userId =
                (signupResponse as any).user?.id || (signupResponse as any).userId;
            const userEmail =
                (signupResponse as any).user?.email || formData.email;
            const otp = (signupResponse as any).otp; 
            const payment = (signupResponse as any).payment; 

            setSignupSuccess({
                userId,
                email: userEmail,
                otp,
                payment,
            });
        } catch (error: any) {
            
            const errorMessage = error.message || "Signup failed, please try again";
            
            if (errorMessage.includes("Referrer tidak aktif")) {
                setSignupError("Kode referral tidak valid. Referrer harus sudah AKTIF (sudah bayar) untuk bisa mengundang member baru. Silakan hubungi referrer Anda untuk mengaktifkan akunnya terlebih dahulu.");
            } else if (errorMessage.includes("Referral code not found")) {
                setSignupError("Kode referral tidak ditemukan. Pastikan kode referral yang Anda masukkan benar.");
            } else {
                setSignupError(errorMessage);
            }
        } finally {
            setIsSignupLoading(false);
            setTimeout(() => {
                isSubmittingRef.current = false;
            }, 2000);
        }
    };

    return {
        verifyOtp,
        resendOtp,
        setEmailOtpCode,
        sendOtp,
        setShowEmailModal,
        handleInputChange,
        handleSubmit,
        setSignupSuccess,
        loadRecaptchaEnterprise,
        verifyEmailOtpHandler,
        setOtpError,
        setShowOtpModal,
        setOtpCode,
        errors,
        signupError,
        isSignupLoading,
        isFormValid,
        recaptchaReady,
        signupSuccess,
        isVerifyingOtp,
        otpSent,
        formData,
        isSendingOtp,
        verifiedPhone,
        otpError,
        showOtpModal,
        otpCode,
        countdown,
        otpVerified,
        isVerifyingEmail,
        whatsappVerificationToken,
        emailVerified,
        emailOtpError,
        emailCountdown,
        showEmailModal,
        emailOtpCode,
    };
};