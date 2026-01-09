import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    TextInput,
    Button,
    Title,
    Text,
    Box,
    Stack,
    Flex,
    Alert,
    Loader,
} from "@mantine/core";
import {
    IconPhone,
    IconCheck,
    IconX,
} from "@tabler/icons-react";
import { COLORS } from "../../../shared/types";
import { verifyPhoneOtp, requestPhoneOtp } from "../api";

const VerifyPhone: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [otpCode, setOtpCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const userId = (location.state as any)?.userId;
    const phone = (location.state as any)?.phone;
    const fromLogin = (location.state as any)?.fromLogin; 

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!userId || !phone) {
            navigate("/signup", { replace: true });
        }
    }, [userId, phone, navigate]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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
            await verifyPhoneOtp({
                userId,
                code: otpCode,
            });

            setSuccess(true);

            setTimeout(() => {
                if (fromLogin) {
                    navigate("/dashboard-affiliate", { replace: true });
                } else {
                    navigate("/signin", { replace: true });
                }
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Verifikasi OTP gagal, silakan coba lagi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        setError(null);

        try {
            await requestPhoneOtp({
                userId,
                phone,
                method: "WHATSAPP",
            });

            setResendCooldown(60); 
            setOtpCode(""); 
        } catch (err: any) {
            setError(err.message || "Gagal mengirim ulang OTP");
        } finally {
            setIsResending(false);
        }
    };

    const greenColor = "#25d366"; 
    const inputBgColor = "#f9f9f9";

    return (
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
                    flex: 1,
                    padding: isMobile ? "20px" : "40px 20px",
                    backgroundColor: COLORS.bg.primary,
                    minHeight: isMobile ? "auto" : "100vh",
                }}
            >
                <Box style={{ width: "100%", maxWidth: 420 }}>
                    {/* Icon */}
                    <Box
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            backgroundColor: "rgba(37, 211, 102, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}
                    >
                        <IconPhone size={32} color={greenColor} />
                    </Box>

                    <Title
                        order={1}
                        mb={8}
                        fw={700}
                        style={{
                            color: COLORS.text.primary,
                            fontSize: isMobile ? 24 : 32,
                            textAlign: "center",
                        }}
                    >
                        Verifikasi WhatsApp
                    </Title>
                    <Text
                        mb={32}
                        style={{
                            color: COLORS.text.secondary,
                            fontSize: 14,
                            textAlign: "center",
                        }}
                    >
                        Kami telah mengirim kode OTP ke WhatsApp{" "}
                        <Text component="span" fw={600}>
                            {phone}
                        </Text>
                    </Text>

                    <form onSubmit={handleSubmit}>
                        <Stack gap={16}>
                            {error && (
                                <Alert
                                    icon={<IconX size={18} />}
                                    color="red"
                                    styles={{
                                        root: {
                                            backgroundColor:
                                                "rgba(239, 68, 68, 0.1)",
                                            border: `1px solid rgba(239, 68, 68, 0.3)`,
                                            borderRadius: 8,
                                            padding: "12px",
                                        },
                                        message: {
                                            color: "#dc2626",
                                            fontSize: 13,
                                        },
                                    }}
                                    title="Error"
                                >
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert
                                    icon={<IconCheck size={18} />}
                                    color="green"
                                    styles={{
                                        root: {
                                            backgroundColor:
                                                "rgba(16, 185, 129, 0.1)",
                                            border: `1px solid rgba(16, 185, 129, 0.3)`,
                                            borderRadius: 8,
                                            padding: "12px",
                                        },
                                        message: {
                                            color: "#059669",
                                            fontSize: 13,
                                        },
                                    }}
                                    title="Sukses"
                                >
                                    {fromLogin ? "WhatsApp verified! Redirecting to dashboard..." : "WhatsApp verified! Redirecting to login..."}
                                </Alert>
                            )}

                            <div>
                                <label
                                    htmlFor="otpInput"
                                    style={{
                                        display: "block",
                                        color: COLORS.text.primary,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        marginBottom: 8,
                                    }}
                                >
                                    Kode OTP{" "}
                                    <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <TextInput
                                    id="otpInput"
                                    placeholder="000000"
                                    value={otpCode}
                                    onChange={(e) => {
                                        setOtpCode(
                                            e.currentTarget.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                        );
                                        if (error) setError(null);
                                    }}
                                    maxLength={6}
                                    disabled={isLoading || success}
                                    styles={{
                                        input: {
                                            backgroundColor: inputBgColor,
                                            color: COLORS.text.primary,
                                            border: `1px solid ${COLORS.border}`,
                                            height: 60,
                                            fontSize: 24,
                                            textAlign: "center",
                                            letterSpacing: 8,
                                            fontWeight: 700,
                                            borderRadius: 8,
                                            transition: "all 0.2s ease",
                                            "&:focus": {
                                                borderColor: greenColor,
                                                boxShadow: `0 0 0 3px rgba(37, 211, 102, 0.1)`,
                                            },
                                            "&::placeholder": {
                                                color: COLORS.text.tertiary,
                                            },
                                        },
                                    }}
                                />
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

                            <Button
                                type="submit"
                                fullWidth
                                size="md"
                                disabled={isLoading || success || otpCode.length < 6}
                                style={{
                                    background: isLoading || success ? "#999999" : greenColor,
                                    color: "#ffffff",
                                    fontWeight: 700,
                                    fontSize: 15,
                                    height: 44,
                                    borderRadius: 8,
                                    border: "none",
                                    transition: "all 0.2s ease",
                                    boxShadow: `0 2px 8px rgba(37, 211, 102, 0.2)`,
                                    marginTop: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    cursor:
                                        isLoading || success ? "not-allowed" : "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading && !success) {
                                        e.currentTarget.style.background =
                                            "#1fa85e";
                                        e.currentTarget.style.boxShadow = `0 4px 12px rgba(37, 211, 102, 0.3)`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading && !success) {
                                        e.currentTarget.style.background =
                                            greenColor;
                                        e.currentTarget.style.boxShadow = `0 2px 8px rgba(37, 211, 102, 0.2)`;
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader size={16} color="white" />
                                        Verifying...
                                    </>
                                ) : success ? (
                                    <>
                                        <IconCheck size={16} />
                                        Verified!
                                    </>
                                ) : (
                                    "Verify WhatsApp"
                                )}
                            </Button>

                            <Text
                                style={{
                                    color: COLORS.text.secondary,
                                    fontSize: 13,
                                    textAlign: "center",
                                    marginTop: 8,
                                }}
                            >
                                Belum menerima kode?{" "}
                                <button
                                    onClick={handleResendOTP}
                                    disabled={resendCooldown > 0 || isResending}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: resendCooldown > 0 ? COLORS.text.tertiary : greenColor,
                                        textDecoration: "none",
                                        fontWeight: 700,
                                        cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
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
                                    {isResending ? "Mengirim..." : resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown}s` : "Kirim ulang"}
                                </button>
                            </Text>
                        </Stack>
                    </form>
                </Box>
            </Flex>

            <Box
                style={{
                    flex: 1,
                    background:
                        "linear-gradient(135deg, #e7f5eeff 0%, #25d366ff 100%)",
                    display: isMobile ? "none" : "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px",
                    minHeight: "100vh",
                }}
            >
                <Box
                    style={{
                        backgroundColor: "#ffffff",
                        border: "2px solid #25d366",
                        borderRadius: 12,
                        padding: "24px",
                        maxWidth: 400,
                        textAlign: "center",
                    }}
                >
                    <IconPhone size={48} color={greenColor} style={{ margin: "0 auto 16px" }} />
                    <Title
                        order={3}
                        mb={12}
                        style={{ color: "#1a1a1a", fontSize: 18, fontWeight: 700 }}
                    >
                        Verifikasi WhatsApp
                    </Title>
                    <Text
                        mb={16}
                        style={{
                            color: "#666666",
                            fontSize: 13,
                            lineHeight: 1.6,
                        }}
                    >
                        WhatsApp verification adalah cara cepat dan aman untuk memverifikasi akun Anda.
                    </Text>
                    <Stack gap={8}>
                        <Flex gap={8} align="flex-start">
                            <Text style={{ color: greenColor, fontSize: 16, marginTop: "2px" }}>
                                ✓
                            </Text>
                            <Text style={{ color: "#666666", fontSize: 12, textAlign: "left" }}>
                                Cek pesan WhatsApp Anda
                            </Text>
                        </Flex>
                        <Flex gap={8} align="flex-start">
                            <Text style={{ color: greenColor, fontSize: 16, marginTop: "2px" }}>
                                ✓
                            </Text>
                            <Text style={{ color: "#666666", fontSize: 12, textAlign: "left" }}>
                                Masukkan kode OTP 6 digit
                            </Text>
                        </Flex>
                        <Flex gap={8} align="flex-start">
                            <Text style={{ color: greenColor, fontSize: 16, marginTop: "2px" }}>
                                ✓
                            </Text>
                            <Text style={{ color: "#666666", fontSize: 12, textAlign: "left" }}>
                                Akun siap digunakan
                            </Text>
                        </Flex>
                    </Stack>
                </Box>
            </Box>
        </Flex>
    );
};

export default VerifyPhone;
