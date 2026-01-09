import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Modal,
    TextInput,
    Button,
    Title,
    Text,
    Box,
    Stack,
    Flex,
    Alert,
    Loader,
    Center,
} from "@mantine/core";
import {
    IconCheck,
    IconX,
    IconPhone,
    IconAlertCircle,
    IconCreditCard,
} from "@tabler/icons-react";
import { useDarkMode } from "../../../hooks/useDarkMode";
import { verifyLoginOtp, requestPhoneOtp, type VerifyPhoneOtpResponse } from "../../../api/auth";
import { getOrCreatePaymentByUserId, checkPaymentStatusByUserId } from "../../../api/apis";

interface OtpVerificationModalProps {
    isOpen: boolean;
    userId: string;
    maskedPhone: string;
    phone?: string; // Full phone number for resending OTP
    expiresIn: string;
    onSuccess: (response?: VerifyPhoneOtpResponse) => void;
    onClose: () => void;
}

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
    isOpen,
    userId,
    maskedPhone,
    phone,
    expiresIn,
    onSuccess,
    onClose,
}) => {
    const navigate = useNavigate();
    const { COLORS, isDark } = useDarkMode();
    const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

    // Safety checks for required props
    const safeUserId = userId || "";
    const safeMaskedPhone = maskedPhone || "****";
    const safeExpiresIn = expiresIn || "5 menit";

    // Resend cooldown timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        const otpCode = otpDigits.join("");

        if (!otpCode.trim()) {
            setError("Kode OTP harus diisi");
            return;
        }

        if (otpCode.length < 6) {
            setError("Kode OTP harus 6 digit");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await verifyLoginOtp({
                userId: safeUserId,
                code: otpCode,
            });
            
            setSuccess(true);

            // Redirect setelah 1.5 detik - pass response ke callback
            setTimeout(() => {
                onSuccess(response);
            }, 1500);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message || "Verifikasi OTP gagal";
            
            console.log("🔍 OTP Error:", errorMessage);
            
            // Check if error is about account not active (belum bayar)
            const errorLower = errorMessage.toLowerCase();
            const isAccountNotActive = 
                errorLower.includes("belum aktif") ||
                errorLower.includes("not active") ||
                errorLower.includes("pending") ||
                errorLower.includes("payment") ||
                errorLower.includes("bayar") ||
                errorLower.includes("aktivasi") ||
                errorLower.includes("75.000") ||
                errorLower.includes("75000");
            
            console.log("🔍 isAccountNotActive:", isAccountNotActive);
            
            if (isAccountNotActive) {
                // Try to get or create payment for this user
                setError("Akun Anda belum aktif. Mengambil data pembayaran...");
                setIsRedirectingToPayment(true);
                setIsLoading(false);
                
                try {
                    console.log("📤 Trying to get payment for userId:", safeUserId);
                    
                    // Try the new API first
                    let paymentData = null;
                    
                    try {
                        const paymentResponse = await getOrCreatePaymentByUserId(safeUserId);
                        console.log("📥 getOrCreatePayment response:", paymentResponse);
                        paymentData = paymentResponse?.payment;
                    } catch (apiErr) {
                        console.log("⚠️ getOrCreatePayment failed, trying checkPaymentStatus...");
                        // Fallback to checkPaymentStatusByUserId
                        const statusResponse = await checkPaymentStatusByUserId(safeUserId);
                        console.log("📥 checkPaymentStatus response:", statusResponse);
                        paymentData = statusResponse?.payment || statusResponse;
                    }
                    
                    if (paymentData && (paymentData.invoiceUrl || paymentData.invoice_url)) {
                        const payment = {
                            id: paymentData.id,
                            amount: paymentData.amount || 75000,
                            status: paymentData.status,
                            invoiceUrl: paymentData.invoiceUrl || paymentData.invoice_url,
                            expiredAt: paymentData.expiredAt || paymentData.expired_at,
                            remainingMinutes: paymentData.remainingMinutes,
                        };
                        
                        console.log("✅ Payment data ready:", payment);
                        
                        // Save payment to storage
                        localStorage.setItem("pendingPayment", JSON.stringify(payment));
                        sessionStorage.setItem("pendingPayment", JSON.stringify(payment));
                        
                        setError("Mengarahkan ke halaman pembayaran...");
                        
                        // Redirect to payment page
                        setTimeout(() => {
                            onClose();
                            navigate("/payment", {
                                replace: true,
                                state: {
                                    redirectFromLogin: true,
                                    payment,
                                },
                            });
                        }, 1500);
                    } else {
                        console.log("❌ No valid payment data, redirecting to payment page anyway");
                        // Even if no payment data, redirect to payment page
                        setError("Mengarahkan ke halaman pembayaran...");
                        setTimeout(() => {
                            onClose();
                            navigate("/payment", {
                                replace: true,
                                state: {
                                    redirectFromLogin: true,
                                    userId: safeUserId,
                                },
                            });
                        }, 1500);
                    }
                } catch (paymentErr: any) {
                    console.error("❌ Failed to get payment:", paymentErr);
                    // Redirect to payment page anyway
                    setError("Mengarahkan ke halaman pembayaran...");
                    setTimeout(() => {
                        onClose();
                        navigate("/payment", {
                            replace: true,
                            state: {
                                redirectFromLogin: true,
                                userId: safeUserId,
                            },
                        });
                    }, 1500);
                }
            } else {
                setError(errorMessage);
                setIsLoading(false);
            }
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        setError(null);

        try {
            console.log("📤 Resending OTP for userId:", safeUserId);
            
            // Call the actual resend OTP API
            await requestPhoneOtp({
                userId: safeUserId,
                phone: phone || "", // Use the phone prop if available
                method: "WHATSAPP",
            });
            
            console.log("✅ OTP resent successfully");
            setResendCooldown(60);
            setOtpDigits(["", "", "", "", "", ""]);
            
            // Show success message briefly
            setError(null);
        } catch (err: any) {
            console.error("❌ Failed to resend OTP:", err);
            setError(err?.message || "Gagal mengirim ulang OTP");
        } finally {
            setIsResending(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        // Hanya terima angka
        const numericValue = value.replace(/\D/g, "");
        
        if (numericValue.length > 1) return; // Maksimal 1 digit per kotak
        
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = numericValue;
        setOtpDigits(newOtpDigits);

        if (error) setError(null);

        // Auto-focus ke input berikutnya
        if (numericValue && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace untuk auto-focus ke input sebelumnya
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        
        if (pastedData.length > 0) {
            const newOtpDigits = pastedData.split("").concat(Array(6 - pastedData.length).fill("")).slice(0, 6);
            setOtpDigits(newOtpDigits);
            
            // Auto-focus ke input terakhir yang terisi
            if (pastedData.length < 6) {
                const nextInput = document.getElementById(`otp-${pastedData.length}`) as HTMLInputElement;
                nextInput?.focus();
            }
        }
    };

    const blueColor = "#0665fc";
    const greenColor = "#25d366";
    const inputBgColor = isDark ? COLORS.bg.secondary : "#f9f9f9";

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            centered
            size="sm"
            withCloseButton={false}
            closeOnClickOutside={false}
            closeOnEscape={false}
            styles={{
                content: {
                    backgroundColor: COLORS.bg.primary,
                },
            }}
        >
            <Box style={{ padding: "24px" }}>
                {/* Icon */}
                <Center mb={24}>
                    <Box
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            backgroundColor: success
                                ? "rgba(16, 185, 129, 0.1)"
                                : "rgba(37, 211, 102, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {success ? (
                            <IconCheck size={32} color="#10b981" />
                        ) : (
                            <IconPhone size={32} color={greenColor} />
                        )}
                    </Box>
                </Center>

                {/* Title */}
                <Title
                    order={3}
                    mb={8}
                    style={{
                        color: COLORS.text.primary,
                        textAlign: "center",
                        fontSize: 18,
                    }}
                >
                    {success ? "Verifikasi Berhasil ✓" : "Verifikasi OTP WhatsApp"}
                </Title>

                {/* Subtitle */}
                <Text
                    mb={24}
                    style={{
                        color: COLORS.text.secondary,
                        textAlign: "center",
                        fontSize: 13,
                    }}
                >
                    {success
                        ? "Siap untuk melanjutkan ke dashboard..."
                        : `Kami telah mengirim kode OTP ke WhatsApp ${safeMaskedPhone}`}
                </Text>

                {/* Success Alert */}
                {success && (
                    <Alert
                        icon={<IconCheck size={16} />}
                        color="green"
                        mb={24}
                        styles={{
                            root: {
                                backgroundColor: isDark
                                    ? "rgba(16, 185, 129, 0.08)"
                                    : "rgba(16, 185, 129, 0.06)",
                                border: `1px solid ${
                                    isDark
                                        ? "rgba(16, 185, 129, 0.4)"
                                        : "rgba(16, 185, 129, 0.2)"
                                }`,
                                borderRadius: 8,
                                padding: "12px 14px",
                            },
                            message: {
                                color: isDark ? "#86efac" : "#059669",
                                fontSize: 13,
                                fontWeight: 500,
                            },
                        }}
                    >
                        Nomor WhatsApp Anda telah berhasil diverifikasi!
                    </Alert>
                )}

                {/* Redirecting to Payment */}
                {isRedirectingToPayment && (
                    <Box style={{ textAlign: "center", padding: "20px 0" }}>
                        <Box
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                backgroundColor: "rgba(245, 158, 11, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                            }}
                        >
                            <IconCreditCard size={32} color="#f59e0b" />
                        </Box>
                        <Title
                            order={4}
                            mb={8}
                            style={{ color: COLORS.text.primary }}
                        >
                            Akun Belum Aktif
                        </Title>
                        <Text
                            mb={16}
                            style={{ color: COLORS.text.secondary, fontSize: 13 }}
                        >
                            {error || "Mengambil data pembayaran..."}
                        </Text>
                        <Flex justify="center" gap={8} align="center">
                            <Loader size={16} color="#f59e0b" />
                            <Text style={{ color: "#f59e0b", fontSize: 13, fontWeight: 500 }}>
                                Mengarahkan ke halaman pembayaran...
                            </Text>
                        </Flex>
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            color="yellow"
                            mt={16}
                            styles={{
                                root: {
                                    backgroundColor: isDark
                                        ? "rgba(245, 158, 11, 0.08)"
                                        : "rgba(245, 158, 11, 0.06)",
                                    border: `1px solid ${
                                        isDark
                                            ? "rgba(245, 158, 11, 0.4)"
                                            : "rgba(245, 158, 11, 0.2)"
                                    }`,
                                    borderRadius: 8,
                                    padding: "12px 14px",
                                },
                                message: {
                                    color: isDark ? "#fcd34d" : "#d97706",
                                    fontSize: 12,
                                },
                            }}
                        >
                            Selesaikan pembayaran Rp 75.000 untuk mengaktifkan akun Anda.
                        </Alert>
                    </Box>
                )}

                {/* Form */}
                {!success && !isRedirectingToPayment && (
                    <form onSubmit={handleVerifyOtp}>
                        <Stack gap={16}>
                            {/* Error Alert */}
                            {error && (
                                <Alert
                                    icon={<IconX size={16} />}
                                    color="red"
                                    styles={{
                                        root: {
                                            backgroundColor: isDark
                                                ? "rgba(239, 68, 68, 0.08)"
                                                : "rgba(239, 68, 68, 0.06)",
                                            border: `1px solid ${
                                                isDark
                                                    ? "rgba(239, 68, 68, 0.4)"
                                                    : "rgba(239, 68, 68, 0.2)"
                                            }`,
                                            borderRadius: 8,
                                            padding: "12px 14px",
                                        },
                                        message: {
                                            color: isDark ? "#fca5a5" : "#dc2626",
                                            fontSize: 13,
                                            fontWeight: 500,
                                        },
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            {/* OTP Input - 6 kotak */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        color: COLORS.text.primary,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        marginBottom: 12,
                                    }}
                                >
                                    Kode OTP
                                    <span style={{ color: "#ef4444" }}> *</span>
                                </label>
                                <Flex gap={6} justify="center">
                                    {otpDigits.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            id={`otp-${index}`}
                                            placeholder="0"
                                            value={digit}
                                            onChange={(e) =>
                                                handleOtpChange(index, e.currentTarget.value)
                                            }
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            maxLength={1}
                                            disabled={isLoading}
                                            styles={{
                                                input: {
                                                    width: "40px",
                                                    height: "50px",
                                                    backgroundColor: inputBgColor,
                                                    color: COLORS.text.primary,
                                                    border: `1px solid ${COLORS.border}`,
                                                    fontSize: 20,
                                                    textAlign: "center",
                                                    fontWeight: 700,
                                                    borderRadius: 8,
                                                    transition: "all 0.2s ease",
                                                    padding: 0,
                                                    "&:focus": {
                                                        borderColor: blueColor,
                                                        boxShadow: `0 0 0 3px rgba(6, 101, 252, 0.1)`,
                                                    },
                                                    "&:disabled": {
                                                        opacity: 0.5,
                                                        cursor: "not-allowed",
                                                    },
                                                },
                                            }}
                                        />
                                    ))}
                                </Flex>
                                <Text
                                    style={{
                                        color: COLORS.text.tertiary,
                                        fontSize: 12,
                                        marginTop: 8,
                                        textAlign: "center",
                                    }}
                                >
                                    Masukkan 6 digit kode OTP
                                </Text>
                            </div>

                            {/* Info Box */}
                            <Box
                                style={{
                                    backgroundColor: isDark
                                        ? "rgba(6, 101, 252, 0.05)"
                                        : "rgba(6, 101, 252, 0.05)",
                                    border: `1px solid ${
                                        isDark
                                            ? "rgba(6, 101, 252, 0.2)"
                                            : "rgba(6, 101, 252, 0.1)"
                                    }`,
                                    borderRadius: 8,
                                    padding: "12px",
                                }}
                            >
                                <Flex gap={8} align="flex-start">
                                    <IconAlertCircle
                                        size={16}
                                        color="#0665fc"
                                        style={{ marginTop: "2px", flexShrink: 0 }}
                                    />
                                    <Text
                                        style={{
                                            color: COLORS.text.secondary,
                                            fontSize: 12,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        Kode OTP berlaku selama <strong>{safeExpiresIn}</strong>. Jika belum menerima kode,
                                    kirim ulang.
                                    </Text>
                                </Flex>
                            </Box>

                            {/* Verify Button */}
                            <Button
                                type="submit"
                                fullWidth
                                size="md"
                                disabled={isLoading || otpDigits.some(d => d === "")}
                                style={{
                                    background:
                                        isLoading || otpDigits.some(d => d === "")
                                            ? "#cccccc"
                                            : blueColor,
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    height: 44,
                                    borderRadius: 8,
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    boxShadow:
                                        isLoading || otpDigits.some(d => d === "")
                                            ? `0 2px 8px rgba(204, 204, 204, 0.15)`
                                            : `0 2px 8px rgba(6, 101, 252, 0.2)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    cursor:
                                        isLoading || otpDigits.some(d => d === "")
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading && !otpDigits.some(d => d === "")) {
                                        e.currentTarget.style.background = "#0055d4";
                                        e.currentTarget.style.boxShadow = `0 6px 16px rgba(6, 101, 252, 0.3)`;
                                        e.currentTarget.style.transform =
                                            "translateY(-2px)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading && !otpDigits.some(d => d === "")) {
                                        e.currentTarget.style.background = blueColor;
                                        e.currentTarget.style.boxShadow = `0 2px 8px rgba(6, 101, 252, 0.2)`;
                                        e.currentTarget.style.transform =
                                            "translateY(0)";
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader size={16} color="white" />
                                    </>
                                ) : (
                                    "Verifikasi OTP"
                                )}
                            </Button>

                            {/* Resend Option */}
                            <Text
                                style={{
                                    color: COLORS.text.secondary,
                                    fontSize: 13,
                                    textAlign: "center",
                                }}
                            >
                                Belum menerima kode?{" "}
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendCooldown > 0 || isResending}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color:
                                            resendCooldown > 0
                                                ? COLORS.text.tertiary
                                                : blueColor,
                                        textDecoration: "none",
                                        fontWeight: 700,
                                        cursor:
                                            resendCooldown > 0 ? "not-allowed" : "pointer",
                                        fontSize: 13,
                                        padding: 0,
                                        opacity: resendCooldown > 0 ? 0.5 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (resendCooldown === 0 && !isResending) {
                                            e.currentTarget.style.opacity = "0.7";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (resendCooldown === 0 && !isResending) {
                                            e.currentTarget.style.opacity = "1";
                                        }
                                    }}
                                >
                                    {isResending
                                        ? "Mengirim..."
                                        : resendCooldown > 0
                                          ? `Kirim ulang dalam ${resendCooldown}s`
                                          : "Kirim ulang"}
                                </button>
                            </Text>

                            {/* Cancel Button */}
                            <Button
                                type="button"
                                fullWidth
                                size="md"
                                disabled={isLoading}
                                onClick={onClose}
                                style={{
                                    background: "transparent",
                                    color: COLORS.text.secondary,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    height: 44,
                                    borderRadius: 8,
                                    border: `1px solid ${COLORS.border}`,
                                    transition: "all 0.2s ease",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                Batal
                            </Button>
                        </Stack>
                    </form>
                )}

                {/* Loading Success */}
                {success && (
                    <Flex justify="center" gap={12}>
                        <Loader size={16} color={greenColor} />
                        <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>
                            Redirecting to dashboard...
                        </Text>
                    </Flex>
                )}
            </Box>
        </Modal>
    );
};

export default OtpVerificationModal;
