import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Box,
    Stack,
    Flex,
    Modal,
    Alert,
    Loader,
    PinInput,
} from "@mantine/core";
import {
    IconUser,
    IconMail,
    IconPhone,
    IconGift,
    IconAlertCircle,
    IconLock,
    IconX,
    IconCheck,
} from "@tabler/icons-react";
import { useDarkMode } from "../../../hooks/useDarkMode";
import { useSignup } from "./useSignup";
import { validateWhatsapp, sendWhatsappCode, verifyWhatsappCode, verifyEmailOtp } from "../../../api/auth";

// Site Key from .env - Enterprise key
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfhjyUsAAAAAPbjPyPC6aDMj5e4MIHEiEVdPpze";
// Disable reCAPTCHA entirely (set to 'true' in .env to bypass during development/staging)
const RECAPTCHA_DISABLED = import.meta.env.VITE_DISABLE_RECAPTCHA === 'true';

// Load reCAPTCHA Enterprise script
const loadRecaptchaEnterprise = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.grecaptcha?.enterprise) {
            resolve();
            return;
        }
        
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            // Wait for grecaptcha to be ready
            window.grecaptcha.enterprise.ready(() => {
                resolve();
            });
        };
        script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
        document.head.appendChild(script);
    });
};

// Declare grecaptcha type
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

const SignUp: React.FC = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showActivationModal, setShowActivationModal] = useState(false); // Disabled
    const [recaptchaReady, setRecaptchaReady] = useState(false);
    
    // OTP states
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);
    
    // OTP Modal states
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [whatsappVerificationToken, setWhatsappVerificationToken] = useState<string | null>(null);
    
    // Email verification states
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailOtpCode, setEmailOtpCode] = useState("");
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailOtpError, setEmailOtpError] = useState<string | null>(null);
    const [emailCountdown, setEmailCountdown] = useState(300); // 5 minutes
    
    const navigate = useNavigate();
    
    const {
        formData,
        errors,
        isSignupLoading,
        signupError,
        signupSuccess,
        isFormValid,
        handleInputChange,
        handleSubmit,
    } = useSignup();

    const { COLORS, isDark } = useDarkMode();

    // Load reCAPTCHA Enterprise on mount (skip when disabled)
    useEffect(() => {
        if (RECAPTCHA_DISABLED) {
            console.warn("⚠️ reCAPTCHA is disabled via VITE_DISABLE_RECAPTCHA - bypassing token requirement");
            setRecaptchaReady(true);
            return;
        }

        loadRecaptchaEnterprise()
            .then(() => {
                console.log("✅ reCAPTCHA Enterprise loaded (signup)");
                setRecaptchaReady(true);
            })
            .catch((err) => {
                console.error("❌ Failed to load reCAPTCHA:", err);
            });
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Email countdown timer
    useEffect(() => {
        if (showEmailModal && emailCountdown > 0) {
            const timer = setTimeout(() => setEmailCountdown(emailCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [emailCountdown, showEmailModal]);

    // Show email modal when signup is successful
    useEffect(() => {
        if (signupSuccess) {
            console.log("✅ Signup successful, showing email verification modal");
            setShowEmailModal(true);
            setEmailCountdown(300); // Reset to 5 minutes
        }
    }, [signupSuccess]);

    // Handle Send OTP - validate first, then send
    const handleSendOtp = useCallback(async () => {
        if (!formData.phone || formData.phone.length < 10) {
            setOtpError("Nomor WhatsApp tidak valid");
            return;
        }

        setIsSendingOtp(true);
        setOtpError(null);

        try {
            // Format phone number - remove leading 0 and add 62
            let formattedPhone = formData.phone;
            if (formattedPhone.startsWith("0")) {
                formattedPhone = "62" + formattedPhone.slice(1);
            } else if (!formattedPhone.startsWith("62")) {
                formattedPhone = "62" + formattedPhone;
            }

            // Step 1: Validate if phone is registered on WhatsApp
            console.log("📱 Validating WhatsApp number:", formattedPhone);
            const validateResult = await validateWhatsapp({ phone: formattedPhone });
            
            // Backend returns { success: true } not { isRegistered: true }
            if (!validateResult.success) {
                setOtpError("Nomor ini tidak terdaftar di WhatsApp. Pastikan nomor yang Anda masukkan benar.");
                return;
            }

            console.log("✅ WhatsApp number is valid:", validateResult.message);

            // Step 2: Send OTP via WhatsApp
            console.log("📤 Sending OTP to WhatsApp...");
            await sendWhatsappCode({ phone: formattedPhone });

            setOtpSent(true);
            setVerifiedPhone(formattedPhone); // Store formatted phone for verification
            setCountdown(60); // 60 seconds countdown
            setShowOtpModal(true); // Open OTP verification modal
            console.log("✅ OTP sent to WhatsApp:", formattedPhone);
        } catch (error: any) {
            console.error("❌ Failed to send OTP:", error);
            setOtpError(error.message || "Gagal mengirim OTP. Silakan coba lagi.");
        } finally {
            setIsSendingOtp(false);
        }
    }, [formData.phone]);

    // Handle OTP verification
    const handleVerifyOtp = useCallback(async () => {
        if (!otpCode || otpCode.length !== 6 || !verifiedPhone) {
            setOtpError("Masukkan kode OTP 6 digit");
            return;
        }

        setIsVerifyingOtp(true);
        setOtpError(null);

        try {
            console.log("🔐 Verifying OTP:", otpCode);
            const result = await verifyWhatsappCode({ 
                phone: verifiedPhone, 
                code: otpCode 
            });

            // Backend may return success: true or just not throw an error
            console.log("✅ OTP verified successfully!", result);
            setOtpVerified(true);
            setWhatsappVerificationToken(result.verificationToken || null);
            
            // Close modal after short delay
            setTimeout(() => {
                setShowOtpModal(false);
            }, 1500);
        } catch (error: any) {
            console.error("❌ OTP verification failed:", error);
            setOtpError(error.message || "Verifikasi OTP gagal. Silakan coba lagi.");
        } finally {
            setIsVerifyingOtp(false);
        }
    }, [otpCode, verifiedPhone]);

    // Handle resend OTP
    const handleResendOtp = useCallback(async () => {
        if (countdown > 0 || !verifiedPhone) return;
        
        setIsSendingOtp(true);
        setOtpError(null);
        
        try {
            await sendWhatsappCode({ phone: verifiedPhone });
            setCountdown(60);
            setOtpCode("");
            console.log("✅ OTP resent to WhatsApp:", verifiedPhone);
        } catch (error: any) {
            setOtpError(error.message || "Gagal mengirim ulang OTP.");
        } finally {
            setIsSendingOtp(false);
        }
    }, [countdown, verifiedPhone]);

    // Handle Email OTP verification
    const handleVerifyEmailOtp = useCallback(async () => {
        if (!emailOtpCode || emailOtpCode.length !== 6 || !signupSuccess?.userId) {
            setEmailOtpError("Masukkan kode OTP 6 digit");
            return;
        }

        setIsVerifyingEmail(true);
        setEmailOtpError(null);

        try {
            console.log("📧 Verifying Email OTP:", emailOtpCode);
            const result = await verifyEmailOtp({
                userId: signupSuccess.userId,
                code: emailOtpCode,
            });

            console.log("✅ Email verified successfully!", result);
            setEmailVerified(true);

            // Check if payment data exists in response
            if (result.payment) {
                console.log("💳 Payment data received:", result.payment);
                
                // Save payment to localStorage for PaymentPage to load
                const paymentData = {
                    id: result.payment.id,
                    amount: result.payment.amount,
                    invoiceUrl: result.payment.invoiceUrl,
                    expiredAt: result.payment.expiredAt,
                    status: result.payment.status,
                };
                localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
                
                // Redirect to payment after short delay
                setTimeout(() => {
                    setShowEmailModal(false);
                    navigate("/payment", {
                        state: {
                            payment: paymentData,
                            userId: signupSuccess.userId,
                            email: signupSuccess.email,
                            isNewAffiliate: true,
                        },
                    });
                }, 1500);
            } else {
                // No payment data - show error or redirect to signin
                console.warn("⚠️ No payment data in response");
                setEmailOtpError("Data pembayaran tidak tersedia. Silakan hubungi support.");
            }
        } catch (error: any) {
            console.error("❌ Email verification failed:", error);
            setEmailOtpError(error.message || "Verifikasi email gagal. Silakan coba lagi.");
        } finally {
            setIsVerifyingEmail(false);
        }
    }, [emailOtpCode, signupSuccess, navigate]);

    // Format countdown to MM:SS
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle form submit with reCAPTCHA Enterprise
    const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // ✅ SECURITY: Double-check WhatsApp verification (prevent bypass via inspect element)
        if (!otpVerified || !whatsappVerificationToken) {
            console.error("❌ Security: WhatsApp not verified!");
            setOtpError("Anda harus memverifikasi nomor WhatsApp terlebih dahulu");
            return;
        }

        if (!RECAPTCHA_DISABLED) {
            if (!recaptchaReady || !window.grecaptcha?.enterprise) {
                console.log("reCAPTCHA not ready");
                return;
            }
        }

        // ✅ SECURITY: Validate form data matches verified phone
        if (verifiedPhone && formData.phone) {
            let formattedFormPhone = formData.phone;
            if (formattedFormPhone.startsWith("0")) {
                formattedFormPhone = "62" + formattedFormPhone.slice(1);
            } else if (!formattedFormPhone.startsWith("62")) {
                formattedFormPhone = "62" + formattedFormPhone;
            }
            
            if (formattedFormPhone !== verifiedPhone) {
                console.error("❌ Security: Phone number mismatch!");
                setOtpError("Nomor WhatsApp tidak sesuai dengan yang diverifikasi");
                return;
            }
        }

        try {
            let token = "";

            if (!RECAPTCHA_DISABLED) {
                // Execute reCAPTCHA Enterprise and get token
                token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action: "SIGNUP" });
                console.log("✅ reCAPTCHA Enterprise token obtained (signup)");
            } else {
                console.warn("⚠️ reCAPTCHA disabled — skipping token acquisition");
            }

            // Create a new event to pass to handleSubmit
            const fakeEvent = {
                preventDefault: () => {},
            } as React.FormEvent<HTMLFormElement>;

            // Pass whatsappVerificationToken to backend (token may be empty when disabled)
            await handleSubmit(fakeEvent, token, whatsappVerificationToken);
        } catch (error) {
            console.error("❌ reCAPTCHA error:", error);
        }
    }, [recaptchaReady, handleSubmit, otpVerified, whatsappVerificationToken, verifiedPhone, formData.phone]);

    const blueColor = "#0665fc";
    const inputBgColor = isDark ? COLORS.bg.secondary : "#f9f9f9";
    const inputBorder = COLORS.border;

    return (
        <>
            {/* Activation Modal */}
            <Modal
                opened={showActivationModal}
                onClose={() => setShowActivationModal(false)}
                centered
                size="sm"
                radius="lg"
                styles={{
                    content: {
                        backgroundColor: COLORS.bg.primary,
                    },
                    header: {
                        backgroundColor: "transparent",
                        borderBottom: "none",
                        padding: "20px 20px 0 20px",
                    },
                    close: {
                        color: COLORS.text.primary,
                    },
                }}
            >
                <Box style={{ textAlign: "center", paddingBottom: "20px" }}>
                    {/* Icon */}
                    <Box
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${blueColor} 0%, #0055d4 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                            boxShadow: `0 4px 12px rgba(6, 101, 252, 0.3)`,
                        }}
                    >
                        <IconAlertCircle size={32} color="white" />
                    </Box>

                    {/* Title */}
                    <Title
                        order={2}
                        mb={8}
                        style={{ color: COLORS.text.primary, fontSize: 20, fontWeight: 700 }}
                    >
                        Biaya Aktivasi
                    </Title>

                    {/* Amount */}
                    <Text
                        mb={16}
                        style={{
                            color: blueColor,
                            fontSize: 28,
                            fontWeight: 700,
                        }}
                    >
                        Rp 75,000
                    </Text>

                    {/* Description */}
                    <Text
                        mb={20}
                        style={{
                            color: COLORS.text.secondary,
                            fontSize: 13,
                            lineHeight: 1.6,
                        }}
                    >
                        One-time payment untuk aktivasi akun affiliate. Setelah aktif, Anda langsung
                        bisa mulai earning komisi dari setiap transaksi member.
                    </Text>
                    {/* Close Button */}
                    <Button
                        fullWidth
                        size="md"
                        style={{
                            background: blueColor,
                            color: "white",
                            fontWeight: 700,
                            fontSize: 14,
                            height: 40,
                            borderRadius: 30,
                            border: "none",
                            transition: "all 0.3s ease",
                        }}
                        onClick={() => setShowActivationModal(false)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#0055d4";
                            e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = blueColor;
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        Lanjutkan
                    </Button>
                </Box>
            </Modal>

            {/* OTP Verification Modal */}
            <Modal
                opened={showOtpModal}
                onClose={() => !isVerifyingOtp && setShowOtpModal(false)}
                centered
                size="sm"
                radius="lg"
                closeOnClickOutside={!isVerifyingOtp}
                closeOnEscape={!isVerifyingOtp}
                styles={{
                    content: {
                        backgroundColor: COLORS.bg.primary,
                    },
                    header: {
                        backgroundColor: "transparent",
                        borderBottom: "none",
                        padding: "20px 20px 0 20px",
                    },
                    close: {
                        color: COLORS.text.primary,
                    },
                }}
            >
                <Box style={{ textAlign: "center", paddingBottom: "20px" }}>
                    {/* Icon */}
                    <Box
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: otpVerified 
                                ? "linear-gradient(135deg, #25d366 0%, #128C7E 100%)"
                                : "linear-gradient(135deg, #25d366 0%, #128C7E 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                            boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
                        }}
                    >
                        {otpVerified ? (
                            <IconCheck size={32} color="white" />
                        ) : (
                            <IconPhone size={32} color="white" />
                        )}
                    </Box>

                    {/* Title */}
                    <Title
                        order={2}
                        mb={8}
                        style={{ color: COLORS.text.primary, fontSize: 20, fontWeight: 700 }}
                    >
                        {otpVerified ? "Verifikasi Berhasil!" : "Verifikasi WhatsApp"}
                    </Title>

                    {/* Description */}
                    <Text
                        mb={16}
                        style={{
                            color: COLORS.text.secondary,
                            fontSize: 13,
                            lineHeight: 1.6,
                        }}
                    >
                        {otpVerified 
                            ? "Nomor WhatsApp Anda telah terverifikasi. Anda dapat melanjutkan pendaftaran."
                            : `Masukkan kode 6 digit yang telah dikirim ke WhatsApp ${verifiedPhone || formData.phone}`
                        }
                    </Text>

                    {!otpVerified && (
                        <>
                            {/* OTP Input */}
                            <Box mb={16}>
                                <PinInput
                                    length={6}
                                    type="number"
                                    value={otpCode}
                                    onChange={setOtpCode}
                                    disabled={isVerifyingOtp}
                                    size="lg"
                                    styles={{
                                        input: {
                                            backgroundColor: inputBgColor,
                                            color: COLORS.text.primary,
                                            border: `1px solid ${inputBorder}`,
                                            fontWeight: 700,
                                            fontSize: 18,
                                        },
                                    }}
                                />
                            </Box>

                            {/* Error */}
                            {otpError && (
                                <Alert
                                    icon={<IconX size={16} />}
                                    color="red"
                                    mb={16}
                                    styles={{
                                        root: {
                                            backgroundColor: isDark ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.06)",
                                            border: `1px solid ${isDark ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.2)"}`,
                                            borderRadius: 8,
                                            padding: "10px 12px",
                                        },
                                        message: {
                                            color: isDark ? "#fca5a5" : "#dc2626",
                                            fontSize: 12,
                                        },
                                    }}
                                >
                                    {otpError}
                                </Alert>
                            )}

                            {/* Verify Button */}
                            <Button
                                fullWidth
                                size="md"
                                disabled={otpCode.length !== 6 || isVerifyingOtp}
                                onClick={handleVerifyOtp}
                                style={{
                                    background: otpCode.length === 6 && !isVerifyingOtp ? "#25d366" : "#cccccc",
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    height: 44,
                                    borderRadius: 30,
                                    border: "none",
                                    marginBottom: 12,
                                }}
                            >
                                {isVerifyingOtp ? (
                                    <Loader size={18} color="white" />
                                ) : (
                                    "Verifikasi OTP"
                                )}
                            </Button>

                            {/* Resend OTP */}
                            <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                                Tidak menerima kode?{" "}
                                {countdown > 0 ? (
                                    <span style={{ color: COLORS.text.tertiary }}>
                                        Kirim ulang dalam {countdown}s
                                    </span>
                                ) : (
                                    <span
                                        style={{
                                            color: "#25d366",
                                            fontWeight: 600,
                                            cursor: isSendingOtp ? "not-allowed" : "pointer",
                                        }}
                                        onClick={handleResendOtp}
                                    >
                                        {isSendingOtp ? "Mengirim..." : "Kirim Ulang"}
                                    </span>
                                )}
                            </Text>
                        </>
                    )}

                    {otpVerified && (
                        <Box
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                padding: "12px",
                                backgroundColor: isDark ? "rgba(37, 211, 102, 0.1)" : "rgba(37, 211, 102, 0.08)",
                                borderRadius: 8,
                                marginTop: 8,
                            }}
                        >
                            <IconCheck size={18} color="#25d366" />
                            <Text style={{ color: "#25d366", fontSize: 13, fontWeight: 600 }}>
                                WhatsApp Terverifikasi
                            </Text>
                        </Box>
                    )}
                </Box>
            </Modal>

            {/* Email Verification Modal */}
            <Modal
                opened={showEmailModal}
                onClose={() => {}} // Prevent closing
                centered
                size="md"
                radius="lg"
                closeOnClickOutside={false}
                closeOnEscape={false}
                withCloseButton={false}
                styles={{
                    content: {
                        backgroundColor: COLORS.bg.primary,
                    },
                }}
            >
                <Box style={{ textAlign: "center", padding: "20px" }}>
                    {/* Icon */}
                    <Box
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: "50%",
                            background: emailVerified 
                                ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                                : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                            boxShadow: emailVerified 
                                ? "0 4px 12px rgba(22, 163, 74, 0.3)"
                                : "0 4px 12px rgba(59, 130, 246, 0.3)",
                        }}
                    >
                        {emailVerified ? (
                            <IconCheck size={36} color="white" />
                        ) : (
                            <IconMail size={36} color="white" />
                        )}
                    </Box>

                    {/* Title */}
                    <Title
                        order={2}
                        mb={8}
                        style={{ color: COLORS.text.primary, fontSize: 22, fontWeight: 700 }}
                    >
                        {emailVerified ? "Email Terverifikasi!" : "Verifikasi Email"}
                    </Title>

                    {/* Description */}
                    <Text
                        mb={16}
                        style={{
                            color: COLORS.text.secondary,
                            fontSize: 14,
                            lineHeight: 1.6,
                        }}
                    >
                        {emailVerified 
                            ? "Email Anda telah berhasil diverifikasi. Anda akan diarahkan ke halaman pembayaran..."
                            : <>Kami telah mengirim kode OTP ke email <strong>{signupSuccess?.email}</strong></>
                        }
                    </Text>

                    {!emailVerified && (
                        <>
                            {/* Countdown Badge */}
                            <Box
                                mb={16}
                                style={{
                                    backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.08)",
                                    borderRadius: 8,
                                    padding: "10px 16px",
                                    display: "inline-block",
                                }}
                            >
                                <Text style={{ color: blueColor, fontSize: 14, fontWeight: 600 }}>
                                    Berlaku selama: {formatCountdown(emailCountdown)}
                                </Text>
                            </Box>

                            {/* OTP Label */}
                            <Text mb={8} style={{ color: COLORS.text.primary, fontSize: 13, fontWeight: 600, textAlign: "left" }}>
                                Kode OTP <span style={{ color: "#ef4444" }}>*</span>
                            </Text>

                            {/* OTP Input */}
                            <Box mb={16}>
                                <PinInput
                                    length={6}
                                    type="number"
                                    value={emailOtpCode}
                                    onChange={setEmailOtpCode}
                                    disabled={isVerifyingEmail}
                                    size="lg"
                                    styles={{
                                        input: {
                                            backgroundColor: inputBgColor,
                                            color: COLORS.text.primary,
                                            border: `1px solid ${inputBorder}`,
                                            fontWeight: 700,
                                            fontSize: 18,
                                        },
                                    }}
                                />
                            </Box>

                            {/* Error */}
                            {emailOtpError && (
                                <Alert
                                    icon={<IconX size={16} />}
                                    color="red"
                                    mb={16}
                                    styles={{
                                        root: {
                                            backgroundColor: isDark ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.06)",
                                            border: `1px solid ${isDark ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.2)"}`,
                                            borderRadius: 8,
                                            padding: "10px 12px",
                                        },
                                        message: {
                                            color: isDark ? "#fca5a5" : "#dc2626",
                                            fontSize: 12,
                                        },
                                    }}
                                >
                                    {emailOtpError}
                                </Alert>
                            )}

                            {/* Verify Button */}
                            <Button
                                fullWidth
                                size="md"
                                disabled={emailOtpCode.length !== 6 || isVerifyingEmail}
                                onClick={handleVerifyEmailOtp}
                                style={{
                                    background: emailOtpCode.length === 6 && !isVerifyingEmail ? blueColor : "#cccccc",
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    height: 48,
                                    borderRadius: 30,
                                    border: "none",
                                    marginBottom: 16,
                                }}
                            >
                                {isVerifyingEmail ? (
                                    <Loader size={18} color="white" />
                                ) : (
                                    "Verify Email"
                                )}
                            </Button>

                            {/* Expiry Info */}
                            <Text style={{ color: COLORS.text.tertiary, fontSize: 12 }}>
                                Kode akan expired dalam {formatCountdown(emailCountdown)}
                            </Text>

                            {/* For testing - show OTP */}
                            {/* {signupSuccess?.otp && (
                                <Box mt={12} p={8} style={{ backgroundColor: isDark ? "rgba(251, 191, 36, 0.1)" : "#fef3c7", borderRadius: 8 }}>
                                    <Text style={{ color: "#b45309", fontSize: 11 }}>
                                        🧪 Test OTP: <strong>{signupSuccess.otp}</strong>
                                    </Text>
                                </Box>
                            )} */}
                        </>
                    )}

                    {emailVerified && (
                        <Box
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                padding: "12px",
                                backgroundColor: isDark ? "rgba(22, 163, 74, 0.1)" : "rgba(22, 163, 74, 0.08)",
                                borderRadius: 8,
                            }}
                        >
                            <Loader size={16} color="#16a34a" />
                            <Text style={{ color: "#16a34a", fontSize: 13, fontWeight: 600 }}>
                                Mengarahkan ke pembayaran...
                            </Text>
                        </Box>
                    )}
                </Box>
            </Modal>

            <Flex
                style={{
                    minHeight: "100vh",
                    backgroundColor: COLORS.bg.primary,
                    flexDirection: isMobile ? "column" : "row",
                }}
            >
                {/* Left Side - Form */}
                <Flex
                    justify="center"
                    align="center"
                    style={{
                        flex: isMobile ? 1 : 0.85,
                        padding: isMobile ? "20px" : "20px 50px",
                        backgroundColor: COLORS.bg.primary,
                        minHeight: isMobile ? "auto" : "100vh",
                    }}
                >
                    <Box style={{ width: "100%", maxWidth: 420 }}>
                        {/* Title */}
                        <Title
                            order={1}
                            mb={4}
                            fw={700}
                            style={{ color: COLORS.text.primary, fontSize: isMobile ? 22 : 26 }}
                        >
                            Daftar Affiliate
                        </Title>
                        <Text
                            mb={16}
                            style={{ color: COLORS.text.secondary, fontSize: 12 }}
                        >
                            Buat akun affiliate Anda sekarang
                        </Text>

                        {/* Form */}
                        <form onSubmit={onSubmit}>
                            <Stack gap={12}>
                                {/* Error Alert */}
                                {signupError && (
                                    <Alert
                                        icon={<IconX size={18} />}
                                        color="red"
                                        styles={{
                                            root: {
                                                backgroundColor: isDark ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.06)",
                                                border: `1px solid ${isDark ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.2)"}`,
                                                borderRadius: 8,
                                                padding: "12px 14px",
                                                animation: "slideDown 0.3s ease-out",
                                            },
                                            message: {
                                                color: isDark ? "#fca5a5" : "#dc2626",
                                                fontSize: 13,
                                                fontWeight: 500,
                                            },
                                        }}
                                    >
                                        {signupError}
                                    </Alert>
                                )}

                                <style>{`
                                    @keyframes slideDown {
                                        from {
                                            opacity: 0;
                                            transform: translateY(-10px);
                                        }
                                        to {
                                            opacity: 1;
                                            transform: translateY(0);
                                        }
                                    }
                                    
                                    .mantine-TextInput-input:focus,
                                    .mantine-TextInput-input:focus-visible,
                                    .mantine-PasswordInput-input:focus,
                                    .mantine-PasswordInput-input:focus-visible {
                                        border-color: #0055d4 !important;
                                        outline: none !important;
                                    }
                                    
                                    .mantine-TextInput-input:hover,
                                    .mantine-PasswordInput-input:hover {
                                        border-color: #0055d4 !important;
                                    }
                                `}</style>

                                {/* Name Field */}
                                <div>
                                    <label style={{
                                        display: "block",
                                        color: COLORS.text.primary,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        marginBottom: 8
                                    }}>
                                        Nama Lengkap
                                        <span style={{ color: "#ef4444" }}> *</span>
                                    </label>
                                    <TextInput
                                        placeholder="Masukkan nama lengkap"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        leftSection={<IconUser size={18} color={formData.name ? "#0055d4" : COLORS.text.tertiary} />}
                                        error={errors.name}
                                        required
                                        styles={{
                                            input: {
                                                backgroundColor: inputBgColor,
                                                color: COLORS.text.primary,
                                                border: errors.name ? "2px solid #ef4444" : formData.name ? "2px solid #0055d4" : `1px solid ${inputBorder}`,
                                                height: 40,
                                                paddingLeft: 38,
                                                fontSize: 13,
                                                borderRadius: 8,
                                                transition: "all 0.2s ease",
                                                "&::placeholder": {
                                                    color: COLORS.text.tertiary,
                                                },
                                            },
                                        }}
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label style={{
                                        display: "block",
                                        color: COLORS.text.primary,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        marginBottom: 8
                                    }}>
                                        Email
                                        <span style={{ color: "#ef4444" }}> *</span>
                                    </label>
                                    <TextInput
                                        placeholder="email@example.com"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        leftSection={<IconMail size={18} color={formData.email ? "#0055d4" : COLORS.text.tertiary} />}
                                        error={errors.email}
                                        required
                                        styles={{
                                            input: {
                                                backgroundColor: inputBgColor,
                                                color: COLORS.text.primary,
                                                border: errors.email ? "2px solid #ef4444" : formData.email ? "2px solid #0055d4" : `1px solid ${inputBorder}`,
                                                height: 40,
                                                paddingLeft: 38,
                                                fontSize: 13,
                                                borderRadius: 8,
                                                transition: "all 0.2s ease",
                                                "&::placeholder": {
                                                    color: COLORS.text.tertiary,
                                                },
                                            },
                                        }}
                                    />
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label style={{
                                        display: "block",
                                        color: COLORS.text.primary,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        marginBottom: 8
                                    }}>
                                        Password
                                        <span style={{ color: "#ef4444" }}> *</span>
                                    </label>
                                    <PasswordInput
                                        placeholder="••••••••"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        leftSection={<IconLock size={18} color={formData.password ? "#0055d4" : COLORS.text.tertiary} />}
                                        error={errors.password}
                                        required
                                        styles={{
                                            input: {
                                                backgroundColor: inputBgColor,
                                                color: COLORS.text.primary,
                                                border: errors.password ? "2px solid #ef4444" : formData.password ? "2px solid #0055d4" : `1px solid ${inputBorder}`,
                                                height: 40,
                                                paddingLeft: 38,
                                                fontSize: 13,
                                                borderRadius: 8,
                                                transition: "all 0.2s ease",
                                                "&::placeholder": {
                                                    color: COLORS.text.tertiary,
                                                },
                                            },
                                        }}
                                    />
                                    <Text style={{ color: COLORS.text.tertiary, fontSize: 11, marginTop: 4 }}>
                                        Password minimal 6 karakter
                                    </Text>
                                </div>

                                {/* Phone Field with Send OTP Button */}
                                <div>
                                    <label style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        color: COLORS.text.primary,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        marginBottom: 8
                                    }}>
                                        Nomor WhatsApp
                                        <span style={{ color: "#ef4444" }}> *</span>
                                        {otpVerified && (
                                            <span style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 4,
                                                backgroundColor: "#dcfce7",
                                                color: "#16a34a",
                                                fontSize: 10,
                                                fontWeight: 600,
                                                padding: "2px 8px",
                                                borderRadius: 12,
                                            }}>
                                                <IconCheck size={12} />
                                                Verified
                                            </span>
                                        )}
                                    </label>
                                    <Flex gap={8} align="flex-start">
                                        <TextInput
                                            placeholder="08123456789"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            leftSection={<IconPhone size={18} color={otpVerified ? "#16a34a" : formData.phone ? "#0055d4" : COLORS.text.tertiary} />}
                                            error={errors.phone}
                                            required
                                            disabled={otpVerified}
                                            style={{ flex: 1 }}
                                            styles={{
                                                input: {
                                                    backgroundColor: otpVerified ? (isDark ? "rgba(22, 163, 74, 0.1)" : "#f0fdf4") : inputBgColor,
                                                    color: COLORS.text.primary,
                                                    border: otpVerified ? "2px solid #16a34a" : errors.phone ? "2px solid #ef4444" : formData.phone ? "2px solid #0055d4" : `1px solid ${inputBorder}`,
                                                    height: 40,
                                                    paddingLeft: 38,
                                                    fontSize: 13,
                                                    borderRadius: 8,
                                                    transition: "all 0.2s ease",
                                                    "&::placeholder": {
                                                        color: COLORS.text.tertiary,
                                                    },
                                                },
                                            }}
                                        />
                                        {otpVerified ? (
                                            <Button
                                                variant="filled"
                                                disabled
                                                style={{
                                                    height: 40,
                                                    borderRadius: 8,
                                                    backgroundColor: "#16a34a",
                                                    color: "white",
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    padding: "0 16px",
                                                    minWidth: 90,
                                                    cursor: "default",
                                                }}
                                            >
                                                <IconCheck size={14} style={{ marginRight: 4 }} />
                                                Verified
                                            </Button>
                                        ) : (
                                            <Button
                                                variant={otpSent ? "filled" : "outline"}
                                                disabled={!formData.phone || formData.phone.length < 10 || isSendingOtp || countdown > 0}
                                                onClick={handleSendOtp}
                                                style={{
                                                    height: 40,
                                                    borderRadius: 8,
                                                    borderColor: otpSent ? "transparent" : (formData.phone && formData.phone.length >= 10 && countdown === 0 ? blueColor : COLORS.border),
                                                    backgroundColor: otpSent ? "#25d366" : "transparent",
                                                    color: otpSent ? "white" : (formData.phone && formData.phone.length >= 10 && countdown === 0 ? blueColor : COLORS.text.tertiary),
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    padding: "0 16px",
                                                    minWidth: 90,
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                {isSendingOtp ? (
                                                    <Loader size={16} color={blueColor} />
                                                ) : countdown > 0 ? (
                                                    `${countdown}s`
                                                ) : otpSent ? (
                                                    <>
                                                        <IconCheck size={14} style={{ marginRight: 4 }} />
                                                        Sent
                                                    </>
                                                ) : (
                                                    "Send OTP"
                                                )}
                                            </Button>
                                        )}
                                    </Flex>
                                    {otpError && (
                                        <Text style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>
                                            {otpError}
                                        </Text>
                                    )}
                                    <Text style={{ color: otpVerified ? "#16a34a" : otpSent ? "#25d366" : COLORS.text.tertiary, fontSize: 11, marginTop: 4 }}>
                                        {otpVerified 
                                            ? "✓ Nomor WhatsApp telah diverifikasi" 
                                            : otpSent 
                                                ? "✓ OTP telah dikirim ke WhatsApp Anda" 
                                                : "OTP akan dikirim ke nomor WhatsApp ini"
                                        }
                                    </Text>
                                </div>

                                {/* Referral Code Field */}
                                <div>
                                    <label style={{
                                        display: "block",
                                        color: COLORS.text.primary,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        marginBottom: 8
                                    }}>
                                        Kode Referral
                                        <span style={{ color: "#ef4444" }}> *</span>
                                    </label>
                                    <TextInput
                                        placeholder="Masukkan kode referral"
                                        name="referralCode"
                                        value={formData.referralCode}
                                        onChange={handleInputChange}
                                        leftSection={<IconGift size={18} color={formData.referralCode ? "#0055d4" : COLORS.text.tertiary} />}
                                        error={errors.referralCode}
                                        required
                                        styles={{
                                            input: {
                                                backgroundColor: inputBgColor,
                                                color: COLORS.text.primary,
                                                border: errors.referralCode ? "2px solid #ef4444" : formData.referralCode ? "2px solid #0055d4" : `1px solid ${inputBorder}`,
                                                height: 40,
                                                paddingLeft: 38,
                                                fontSize: 13,
                                                borderRadius: 8,
                                                transition: "all 0.2s ease",
                                                "&::placeholder": {
                                                    color: COLORS.text.tertiary,
                                                },
                                            },
                                        }}
                                    />
                                    <Text style={{ color: COLORS.text.tertiary, fontSize: 11, marginTop: 4 }}>
                                        Masukkan kode dari orang yang mengajak Anda
                                    </Text>
                                </div>

                                {/* reCAPTCHA Enterprise - invisible, no widget */}
                                <Text size="xs" c="dimmed" ta="center" mb={8}>
                                    {RECAPTCHA_DISABLED ? "reCAPTCHA dinonaktifkan" : recaptchaReady ? "Dilindungi oleh reCAPTCHA Enterprise" : "Memuat reCAPTCHA..."}
                                </Text>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    fullWidth
                                    size="md"
                                    disabled={isSignupLoading || !isFormValid || (!recaptchaReady && !RECAPTCHA_DISABLED) || !otpVerified}
                                    style={{
                                        background: isSignupLoading || !isFormValid || (!recaptchaReady && !RECAPTCHA_DISABLED) || !otpVerified ? "#cccccc" : blueColor,
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: 14,
                                        height: 40,
                                        borderRadius: 30,
                                        border: "none",
                                        transition: "all 0.3s ease",
                                        boxShadow: isSignupLoading || !isFormValid || (!recaptchaReady && !RECAPTCHA_DISABLED) || !otpVerified
                                            ? `0 2px 8px rgba(204, 204, 204, 0.15)`
                                            : `0 2px 8px rgba(6, 101, 252, 0.2)`,
                                        marginTop: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        cursor: isSignupLoading || !isFormValid || (!recaptchaReady && !RECAPTCHA_DISABLED) || !otpVerified ? "not-allowed" : "pointer",
                                        opacity: isSignupLoading || !isFormValid || (!recaptchaReady && !RECAPTCHA_DISABLED) || !otpVerified ? 0.6 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSignupLoading && isFormValid && (recaptchaReady || RECAPTCHA_DISABLED) && otpVerified) {
                                            e.currentTarget.style.background = "#0055d4";
                                            e.currentTarget.style.boxShadow = `0 6px 16px rgba(6, 101, 252, 0.3)`;
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSignupLoading && isFormValid && (recaptchaReady || RECAPTCHA_DISABLED) && otpVerified) {
                                            e.currentTarget.style.background = blueColor;
                                            e.currentTarget.style.boxShadow = `0 2px 8px rgba(6, 101, 252, 0.2)`;
                                            e.currentTarget.style.transform = "translateY(0)";
                                        }
                                    }}
                                >
                                    {isSignupLoading ? (
                                        <>
                                            <Loader size={18} color="white" />
                                        </>
                                    ) : (
                                        "Lanjut ke Verifikasi OTP"
                                    )}
                                </Button>
                            </Stack>
                        </form>

                        {/* Sign In Link */}
                        <Flex justify="center" mt={14}>
                            <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                                Sudah punya akun?{" "}
                                <a
                                    href="/signin"
                                    style={{
                                        color: COLORS.text.primary,
                                        textDecoration: "none",
                                        fontWeight: 700,
                                        transition: "opacity 0.2s ease",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                                >
                                    Login di sini
                                </a>
                            </Text>
                        </Flex>

                    </Box>
                </Flex>

                {/* Right Side - Image & Benefits */}
                <Box
                    style={{
                        flex: 1,
                        background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 50%, #1d4ed8 100%)",
                        display: isMobile ? "none" : "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px",
                        minHeight: "100vh",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Decorative shapes */}
                    <Box
                        style={{
                            position: "absolute",
                            top: "10%",
                            right: "-5%",
                            width: 300,
                            height: 300,
                            borderRadius: 40,
                            background: "rgba(255, 255, 255, 0.08)",
                            transform: "rotate(15deg)",
                        }}
                    />
                    <Box
                        style={{
                            position: "absolute",
                            bottom: "15%",
                            left: "-10%",
                            width: 250,
                            height: 250,
                            borderRadius: 40,
                            background: "rgba(255, 255, 255, 0.06)",
                            transform: "rotate(-10deg)",
                        }}
                    />
                    <Box
                        style={{
                            position: "absolute",
                            bottom: "5%",
                            right: "10%",
                            width: 60,
                            height: 60,
                            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                            transform: "rotate(45deg)",
                            borderRadius: 8,
                            zIndex: 1,
                        }}
                    />
                    
                    {/* Logo Image - Centered */}
                    <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, marginBottom: 30 }}>
                        <img
                            src="LogoDMLC.webp"
                            alt="Decorative"
                            style={{
                                maxWidth: "70%",
                                maxHeight: "300px",
                                objectFit: "contain",
                                filter: "drop-shadow(0 8px 32px rgba(0, 0, 0, 0.15))",
                            }}
                        />
                    </Box>

                    {/* Benefits Card */}
                    <Box
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            backdropFilter: "blur(10px)",
                            borderRadius: 16,
                            padding: "24px",
                            width: "80%",
                            maxWidth: 320,
                            zIndex: 1,
                            marginBottom: 20,
                        }}
                    >
                        <Title
                            order={3}
                            mb={16}
                            style={{ color: "white", fontSize: 16, fontWeight: 700 }}
                        >
                            💰 Benefit Jadi Affiliate:
                        </Title>
                        <Stack gap={10}>
                            {[
                                "Komisi Rp 75k per order (Level 1)",
                                "Komisi Rp 12.5k per order (Level 2-10)",
                                "Dashboard & tools gratis",
                            ].map((benefit, index) => (
                                <Flex key={index} gap={10} align="center">
                                    <Box
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <IconCheck size={12} color="white" />
                                    </Box>
                                    <Text style={{ color: "white", fontSize: 13, lineHeight: 1.4 }}>
                                        {benefit}
                                    </Text>
                                </Flex>
                            ))}
                        </Stack>
                    </Box>

                    {/* Registration Steps Card - Below Benefits */}
                    <Box
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            backdropFilter: "blur(10px)",
                            borderRadius: 16,
                            padding: "24px",
                            width: "80%",
                            maxWidth: 320,
                            zIndex: 1,
                        }}
                    >
                        <Title
                            order={3}
                            mb={16}
                            style={{ color: "white", fontSize: 16, fontWeight: 700 }}
                        >
                            📋 Langkah Registrasi:
                        </Title>
                        <Stack gap={10}>
                            {[
                                { num: 1, text: "Isi form registrasi" },
                                { num: 2, text: "Verifikasi OTP via WhatsApp" },
                                { num: 3, text: "Bayar aktivasi Rp 75,000" },
                                { num: 4, text: "Akun aktif, mulai earning! 🎉" },
                            ].map((step) => (
                                <Flex key={step.num} gap={10} align="center">
                                    <Box
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: "white",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {step.num}
                                    </Box>
                                    <Text style={{ color: "white", fontSize: 13, lineHeight: 1.4 }}>
                                        {step.text}
                                    </Text>
                                </Flex>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                {/* Mobile - Benefits & Registration Steps */}
                {isMobile && (
                    <Box style={{ padding: "20px", backgroundColor: COLORS.bg.primary }}>
                        {/* Benefits - First */}
                        <Box
                            style={{
                                backgroundColor: isDark ? COLORS.bg.secondary : "#ffffff",
                                border: `1px solid ${isDark ? "rgba(6, 101, 252, 0.2)" : "rgba(6, 101, 252, 0.15)"}`,
                                borderRadius: 12,
                                padding: "16px",
                                marginBottom: 16,
                            }}
                        >
                            <Title
                                order={3}
                                mb={12}
                                style={{ color: COLORS.text.primary, fontSize: 14, fontWeight: 700 }}
                            >
                                💰 Benefit Jadi Affiliate:
                            </Title>
                            <Stack gap={8}>
                                {[
                                    "Komisi Rp 75k per order (Level 1)",
                                    "Komisi Rp 12.5k per order (Level 2-10)",
                                    "Dashboard & tools gratis",
                                ].map((benefit, index) => (
                                    <Flex key={index} gap={8} align="center">
                                        <Box
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: "50%",
                                                backgroundColor: isDark ? "rgba(6, 101, 252, 0.2)" : "rgba(6, 101, 252, 0.1)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <IconCheck size={10} color={blueColor} />
                                        </Box>
                                        <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                                            {benefit}
                                        </Text>
                                    </Flex>
                                ))}
                            </Stack>
                        </Box>

                        {/* Registration Steps - Below Benefits */}
                        <Alert
                            icon={<IconAlertCircle size={18} color={blueColor} />}
                            styles={{
                                root: {
                                    background: isDark ? "rgba(6, 101, 252, 0.08)" : "rgba(6, 101, 252, 0.05)",
                                    border: `1px solid ${isDark ? "rgba(6, 101, 252, 0.2)" : "rgba(6, 101, 252, 0.15)"}`,
                                    borderRadius: 12,
                                    padding: "16px",
                                },
                                title: {
                                    color: COLORS.text.primary,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    marginBottom: 8,
                                },
                            }}
                            title="📋 Langkah Registrasi:"
                        >
                            <Stack gap={8}>
                                {[
                                    { num: 1, text: "Isi form registrasi" },
                                    { num: 2, text: "Verifikasi OTP via WhatsApp" },
                                    { num: 3, text: "Bayar aktivasi Rp 75,000" },
                                    { num: 4, text: "Akun aktif, mulai earning! 🎉" },
                                ].map((step) => (
                                    <Flex key={step.num} gap={8} align="center">
                                        <Box
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: "50%",
                                                backgroundColor: blueColor,
                                                color: "white",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 10,
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {step.num}
                                        </Box>
                                        <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                                            {step.text}
                                        </Text>
                                    </Flex>
                                ))}
                            </Stack>
                        </Alert>
                    </Box>
                )}
            </Flex>
        </>
    );
};

export default SignUp;
