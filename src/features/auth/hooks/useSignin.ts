import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth";
import { loginUser } from "../../../features/auth";

declare global {
    interface Window {
        grecaptcha: {
            enterprise: {
                ready: (callback: () => void) => void;
                execute: (siteKey: string, options: { action: string }) => Promise<string>;
            };
        };
    }
}

interface FormState {
    email: string;
    password: string;
}

interface PendingPayment {
    id: string;
    amount: number;
    invoiceUrl: string;
    status: string;
    expiredAt: string;
    remainingMinutes: number;
}

interface OtpResponse {
    message: string;
    nextStep: string;
    userId: string;
    maskedPhone: string;
    phone?: string;
    email?: string;
    expiresIn: string;
    instruction: string;
}

export const useSignin = () => {
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();

    const [formData, setFormData] = useState<FormState>({
        email: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpData, setOtpData] = useState<OtpResponse | null>(null);

    const isFormValid = formData.email.trim() !== "" && formData.password.trim() !== "";

    const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfhjyUsAAAAAPbjPyPC6aDMj5e4MIHEiEVdPpze";
    // Only enable reCAPTCHA when the environment variable is explicitly set to 'true'
    const RECAPTCHA_ENABLED = import.meta.env.VITE_RECAPTCHA_ENABLED === 'true';
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
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError(null);
    };

    const handlePaymentRedirect = (payment: PendingPayment, email: string) => {
        localStorage.setItem("pendingPayment", JSON.stringify(payment));
        sessionStorage.setItem("pendingPayment", JSON.stringify(payment));

        setError("Akun belum aktif. Mengarahkan ke halaman pembayaran...");

        setTimeout(() => {
            navigate("/payment", {
                replace: true,
                state: {
                    email,
                    redirectFromLogin: true,
                    payment,
                },
            });
        }, 1500);
    };

    const handleLoginSuccess = async (userId: string | undefined, phone: string | null, maskedPhoneFromResponse?: string) => {
        setSuccess(true);

        if (userId) {

            let finalMaskedPhone = maskedPhoneFromResponse;
            if (!finalMaskedPhone && phone) {
                finalMaskedPhone = phone.replace(/(\d)(?=(\d{4})+(?!\d))/g, "*");
            }

            setOtpData({
                message: "Kode OTP telah dikirim ke WhatsApp Anda",
                nextStep: "Verifikasi OTP untuk melanjutkan login",
                userId,
                maskedPhone: finalMaskedPhone || "****",
                phone: phone || undefined, 
                email: formData.email || undefined,
                expiresIn: "5 menit",
                instruction: "Masukkan 4 digit kode OTP yang diterima",
            });

            try {
                const pending = {
                    userId,
                    phone: phone || undefined,
                    email: formData.email || undefined,
                    otpMethod: phone ? "WHATSAPP" : "EMAIL",
                    createdAt: new Date().toISOString(),
                };
                localStorage.setItem("pendingOtp", JSON.stringify(pending));
            } catch (e) {
                console.warn("Failed to persist pendingOtp", e);
            }

            const navState = {
                userId,
                maskedPhone: finalMaskedPhone || undefined,
                phone: phone || undefined,
                email: formData.email || undefined,
                expiresIn: "5 menit",
            } as any;
            try {
                setShowOtpModal(false);
                navigate("/otp-verification", { state: navState });
                return;
            } catch (e) {
                console.warn("Failed to navigate to OTP page from hook", e);
                setShowOtpModal(true);
            }
        } else {
            console.error("⚠️ No userId provided!");
            setError("Login gagal: User ID tidak diterima");
        }
    };

    const handleOtpSuccess = async (otpResponse?: { 
        token?: string; 
        user?: any; 
        loginSuccess?: boolean;
        purchaseRequired?: boolean;
        redirectTo?: string;
        purchaseMessage?: string;
        referrerLink?: {
            referrerName: string;
            referrerCode: string;
            shopUrl: string;
            message: string;
        } | null;
        instruction?: string;
    }) => {
        
        if (otpResponse?.loginSuccess === false && otpResponse?.purchaseRequired) {
            setShowOtpModal(false);
            
            const referrer = otpResponse.referrerLink;
            const shopUrl = referrer?.shopUrl || (referrer as any)?.referralLink || (referrer as any)?.shop_url || (referrer as any)?.url;
            
            
            if (shopUrl) {
                window.location.href = shopUrl;
                return;
            }
            
            const affiliateId = (referrer as any)?.slicewpId || (referrer as any)?.wpAffiliateId || (referrer as any)?.affiliateId;
            if (affiliateId) {
                const fallbackUrl = `https://jagobikinaplikasi.com/woo/shop/?slicewp_ref=${affiliateId}`;
                window.location.href = fallbackUrl;
                return;
            }
            
            window.location.href = "https://jagobikinaplikasi.com/woo/shop/";
            return;
        }
        
        const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
        let token = otpResponse?.token;
        
        if (!token) {
            token = localStorage.getItem(tokenKey) || undefined;
        }
        
        if (!token) {
            setError("Token tidak ditemukan. Backend mungkin tidak mengirim token.");
            setShowOtpModal(false);
            try { localStorage.removeItem("pendingOtp"); } catch {};
            return;
        }
        
        localStorage.setItem(tokenKey, token);
        
        setToken(token);
        
        if (otpResponse?.user) {
            setUser(otpResponse.user);
            localStorage.setItem("user_profile", JSON.stringify(otpResponse.user));
        }
        
        setShowOtpModal(false);
        try { localStorage.removeItem("pendingOtp"); } catch {}
        
        const userRole = otpResponse?.user?.role?.toUpperCase();
        let redirectPath = "/dashboard-affiliate"; // Default untuk MEMBER
        
        if (userRole === "SUPERADMIN" || userRole === "ADMIN") {
            redirectPath = "/admin/dashboard";
        } else {
        }
        
        setTimeout(() => {
            navigate(redirectPath, { replace: true });
        }, 500);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, recaptchaToken?: string | null) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Email dan password harus diisi");
            return;
        }

        if (RECAPTCHA_ENABLED && !recaptchaToken) {
            setError("Silakan selesaikan verifikasi reCAPTCHA");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await loginUser({
                email: formData.email,
                password: formData.password,
                // recaptchaToken: recaptchaToken,
            });

            const userId = response?.user?.id || response?.userId;
            const userPhone = response?.user?.phone || null;
            const maskedPhone = response?.maskedPhone;
            
            if (!userId) {
                throw new Error("User ID tidak diterima dari server");
            }
            if (response?.user) {
                setUser(response.user as any);
            }
            if (response?.token) {
                setToken(response.token);
            } else {
            }
            await handleLoginSuccess(userId, userPhone, maskedPhone);
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorStatus = err?.response?.status;

            if (errorStatus === 401 && errorData?.payment) {
                const payment: PendingPayment = {
                    id: errorData.payment.id,
                    amount: errorData.payment.amount,
                    invoiceUrl: errorData.payment.invoiceUrl,
                    status: errorData.payment.status,
                    expiredAt: errorData.payment.expiredAt,
                    remainingMinutes: errorData.payment.remainingMinutes,
                };

                handlePaymentRedirect(payment, formData.email);
            } else {
                const errorMessage =
                    errorData?.message ||
                    err.message ||
                    "Login gagal. Silakan periksa email dan password Anda.";
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

        const submitWithRecaptcha = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!RECAPTCHA_ENABLED) {
                await handleSubmit(e, null);
                return;
            }

            if (!recaptchaReady || !(window as any).grecaptcha?.enterprise) {
                setError("Silakan tunggu, reCAPTCHA belum siap");
                return;
            }

            try {
                const token = await (window as any).grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action: "LOGIN" });
                await handleSubmit(e, token);
            } catch (err) {
                console.error('reCAPTCHA error', err);
                setError('Terjadi kesalahan reCAPTCHA. Silakan coba lagi.');
            }
        }, [recaptchaReady, handleSubmit]);

    return {
        formData,
        isLoading,
        error,
        success,
        showPassword,
        showOtpModal,
        otpData,
        isFormValid,
        handleInputChange,
        handleSubmit,
        recaptchaReady,
        submitWithRecaptcha,
        setShowPassword,
        handleOtpSuccess,
        setShowOtpModal,
    };
};