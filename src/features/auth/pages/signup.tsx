import React, { useState, useCallback, useEffect, useRef } from "react";
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
import { useDarkMode } from "../../../shared/hooks";
import { useSignup } from "../hooks/useSignup";
import { getOrCreatePaymentByUserId } from "../../../shared/api/paymentApi";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfhjyUsAAAAAPbjPyPC6aDMj5e4MIHEiEVdPpze";
// Only enable reCAPTCHA when the environment variable is explicitly set to 'true'
const RECAPTCHA_ENABLED = import.meta.env.VITE_RECAPTCHA_ENABLED === 'true';

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
    const [showActivationModal, setShowActivationModal] = useState(false); 
    const isSubmittingRef = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();
    
    const {
        verifyEmailOtpHandler,
        setShowOtpModal,
        setOtpCode,
        setOtpError,
        handleInputChange,
        handleSubmit,
        setEmailOtpCode,
        sendOtp,
        verifyOtp,
        resendOtp,
        formData,
        errors,
        isSignupLoading,
        signupError,
        signupSuccess,
        isFormValid,
        otpCode,
        recaptchaReady,
        isSendingOtp,
        otpSent,
        otpError,
        countdown,
        showOtpModal,
        showEmailModal,
        isVerifyingOtp,
        otpVerified,
        verifiedPhone,
        whatsappVerificationToken,
        emailOtpCode,
        isVerifyingEmail,
        emailVerified,
        emailOtpError,
        emailCountdown,
    } = useSignup();

    const { COLORS, isDark } = useDarkMode();
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {
        if (signupSuccess) {
            setShowSuccessModal(true);
            const payment = (signupSuccess as any).payment;
            const handlePaymentRedirect = async () => {
                if (payment) {
                    const paymentData = {
                        id: payment.id,
                        amount: payment.amount,
                        invoiceUrl: payment.invoiceUrl,
                        expiredAt: payment.expiredAt,
                        status: payment.status,
                    };
                    localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
                    setTimeout(() => {
                        setShowSuccessModal(false);
                        navigate("/payment", {
                            state: {
                                payment: paymentData,
                                userId: signupSuccess.userId,
                                email: signupSuccess.email,
                                isNewAffiliate: true,
                            },
                        });
                    }, 2000);
                } else {
                    
                    try {
                        const paymentResponse = await getOrCreatePaymentByUserId(signupSuccess.userId);
                        console.log("💳 Payment created/retrieved:", paymentResponse);
                        
                        const paymentData = {
                            id: paymentResponse.payment.id,
                            amount: paymentResponse.payment.amount,
                            invoiceUrl: paymentResponse.payment.invoiceUrl,
                            expiredAt: paymentResponse.payment.expiredAt,
                            status: paymentResponse.payment.status,
                        };
                        localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
                        
                        setTimeout(() => {
                            setShowSuccessModal(false);
                            navigate("/payment", {
                                state: {
                                    payment: paymentData,
                                    userId: signupSuccess.userId,
                                    email: signupSuccess.email,
                                    isNewAffiliate: true,
                                },
                            });
                        }, 2000);
                    } catch (paymentError: any) {
                        localStorage.setItem('pendingUserId', signupSuccess.userId);
                        localStorage.setItem('pendingUserEmail', signupSuccess.email);
                        setTimeout(() => {
                            setShowSuccessModal(false);
                            navigate("/signin", {
                                state: {
                                    message: "Registrasi berhasil! Silakan login untuk melanjutkan ke pembayaran aktivasi.",
                                    email: signupSuccess.email,
                                    needsPayment: true,
                                },
                            });
                        }, 2000);
                    }
                }
            };
            
            handlePaymentRedirect();
        }
    }, [signupSuccess, navigate]);
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (isSubmittingRef.current || isSubmitting || isSignupLoading) {
            return;
        }
        if (!otpVerified || !whatsappVerificationToken) {
            setOtpError("Anda harus memverifikasi nomor WhatsApp terlebih dahulu");
            return;
        }

        if (RECAPTCHA_ENABLED) {
            if (!recaptchaReady || !window.grecaptcha?.enterprise) {
                return;
            }
        }

        if (verifiedPhone && formData.phone) {
            let formattedFormPhone = formData.phone;
            if (formattedFormPhone.startsWith("0")) {
                formattedFormPhone = "62" + formattedFormPhone.slice(1);
            } else if (!formattedFormPhone.startsWith("62")) {
                formattedFormPhone = "62" + formattedFormPhone;
            }
            
            if (formattedFormPhone !== verifiedPhone) {
                setOtpError("Nomor WhatsApp tidak sesuai dengan yang diverifikasi");
                return;
            }
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            if (RECAPTCHA_ENABLED) {
                const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action: "SIGNUP" });
                const fakeEvent = {
                    preventDefault: () => {},
                } as React.FormEvent<HTMLFormElement>;
                await handleSubmit(fakeEvent, token, whatsappVerificationToken);
            } else {
                const fakeEvent = {
                    preventDefault: () => {},
                } as React.FormEvent<HTMLFormElement>;
                await handleSubmit(fakeEvent, undefined, whatsappVerificationToken);
            }
        } catch (error) {
        } finally {
            setTimeout(() => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }, 2000);
        }
    }, [recaptchaReady, handleSubmit, otpVerified, whatsappVerificationToken, verifiedPhone, formData.phone, isSubmitting, isSignupLoading]);

    const blueColor = "#0665fc";
    const inputBgColor = isDark ? COLORS.bg.secondary : "#f9f9f9";
    const inputBorder = COLORS.border;

    return (
        <>
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

                    <Title
                        order={2}
                        mb={8}
                        style={{ color: COLORS.text.primary, fontSize: 20, fontWeight: 700 }}
                    >
                        Biaya Aktivasi
                    </Title>

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

            <Modal
                opened={showSuccessModal}
                onClose={() => {}}
                centered
                size="sm"
                radius="lg"
                withCloseButton={false}
                closeOnClickOutside={false}
                closeOnEscape={false}
                styles={{
                    content: {
                        backgroundColor: COLORS.bg.primary,
                    },
                    header: {
                        backgroundColor: "transparent",
                        borderBottom: "none",
                        padding: "20px 20px 0 20px",
                    },
                }}
            >
                <Box style={{ textAlign: "center", padding: "30px 20px" }}>
                    <Box
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                            boxShadow: `0 8px 24px rgba(34, 197, 94, 0.3)`,
                            animation: "pulse 2s infinite",
                        }}
                    >
                        <IconCheck size={40} color="white" stroke={3} />
                    </Box>

                    <Title
                        order={2}
                        mb={10}
                        style={{ color: COLORS.text.primary, fontSize: 24, fontWeight: 700 }}
                    >
                        Registrasi Berhasil!
                    </Title>

                    <Text
                        mb={8}
                        style={{
                            color: COLORS.text.secondary,
                            fontSize: 14,
                            lineHeight: 1.6,
                        }}
                    >
                        Akun Anda berhasil dibuat dan terverifikasi.
                    </Text>

                    <Text
                        style={{
                            color: blueColor,
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        <Loader size="xs" color={blueColor} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Mengalihkan ke halaman pembayaran...
                    </Text>
                </Box>
            </Modal>

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

                    <Title
                        order={2}
                        mb={8}
                        style={{ color: COLORS.text.primary, fontSize: 20, fontWeight: 700 }}
                    >
                        {otpVerified ? "Verifikasi Berhasil!" : "Verifikasi WhatsApp"}
                    </Title>

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

                            <Button
                                fullWidth
                                size="md"
                                disabled={otpCode.length !== 6 || isVerifyingOtp}
                                onClick={verifyOtp}
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
                                        onClick={resendOtp}
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

            <Modal
                opened={showEmailModal}
                onClose={() => {}} 
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

                    <Title
                        order={2}
                        mb={8}
                        style={{ color: COLORS.text.primary, fontSize: 22, fontWeight: 700 }}
                    >
                        {emailVerified ? "Email Terverifikasi!" : "Verifikasi Email"}
                    </Title>

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

                            <Text mb={8} style={{ color: COLORS.text.primary, fontSize: 13, fontWeight: 600, textAlign: "left" }}>
                                Kode OTP <span style={{ color: "#ef4444" }}>*</span>
                            </Text>

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

                            <Button
                                fullWidth
                                size="md"
                                disabled={emailOtpCode.length !== 6 || isVerifyingEmail}
                                onClick={() => verifyEmailOtpHandler(signupSuccess?.userId)}
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
                            <Text style={{ color: COLORS.text.tertiary, fontSize: 12 }}>
                                Kode akan expired dalam {formatCountdown(emailCountdown)}
                            </Text>
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

                        <form onSubmit={onSubmit}>
                            <Stack gap={12}>
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
                                                onClick={sendOtp}
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

                                <Text size="xs" c="dimmed" ta="center" mb={8}>
                                    {recaptchaReady ? "Dilindungi oleh reCAPTCHA Enterprise" : "Memuat reCAPTCHA..."}
                                </Text>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="md"
                                    disabled={isSignupLoading || isSubmitting || !isFormValid || !recaptchaReady || !otpVerified}
                                    loading={isSignupLoading || isSubmitting}
                                    style={{
                                        background: isSignupLoading || isSubmitting || !isFormValid || !recaptchaReady || !otpVerified ? "#cccccc" : blueColor,
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: 14,
                                        height: 40,
                                        borderRadius: 30,
                                        border: "none",
                                        transition: "all 0.3s ease",
                                        boxShadow: isSignupLoading || isSubmitting || !isFormValid || !recaptchaReady || !otpVerified
                                            ? `0 2px 8px rgba(204, 204, 204, 0.15)`
                                            : `0 2px 8px rgba(6, 101, 252, 0.2)`,
                                        marginTop: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                    cursor: isSignupLoading || isSubmitting || !isFormValid || !recaptchaReady || !otpVerified ? "not-allowed" : "pointer",
                                    opacity: isSignupLoading || isSubmitting || !isFormValid || !recaptchaReady || !otpVerified ? 0.6 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSignupLoading && !isSubmitting && isFormValid && recaptchaReady && otpVerified) {
                                            e.currentTarget.style.background = "#0055d4";
                                            e.currentTarget.style.boxShadow = `0 6px 16px rgba(6, 101, 252, 0.3)`;
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSignupLoading && !isSubmitting && isFormValid && recaptchaReady && otpVerified) {
                                            e.currentTarget.style.background = blueColor;
                                            e.currentTarget.style.boxShadow = `0 2px 8px rgba(6, 101, 252, 0.2)`;
                                            e.currentTarget.style.transform = "translateY(0)";
                                        }
                                    }}
                                >
                                    {isSignupLoading || isSubmitting ? (
                                        <>
                                            <Loader size={18} color="white" />
                                        </>
                                    ) : (
                                        "Lanjut ke Verifikasi OTP"
                                    )}
                                </Button>
                            </Stack>
                        </form>
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

                {isMobile && (
                    <Box style={{ padding: "20px", backgroundColor: COLORS.bg.primary }}>
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
