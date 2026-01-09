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
    IconMail,
    IconCheck,
    IconX,
} from "@tabler/icons-react";
import { COLORS } from "../../../shared/types";
import { verifyEmailOtp, requestEmailOtp } from "../api";

const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds

    const userId = (location.state as any)?.userId;
    const email = (location.state as any)?.email;
    const isNewAffiliate = (location.state as any)?.isNewAffiliate;
    const referralCode = (location.state as any)?.referralCode;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!userId || !email) {
            navigate("/signup", { replace: true });
        }
    }, [userId, email, navigate]);

    useEffect(() => {
        if (timeLeft <= 0 || success) return;
        
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setError("Kode OTP telah expired. Silakan kirim ulang.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, success]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; 

        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value.slice(-1); 
        setOtpDigits(newOtpDigits);
        setError(null);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        
        const digitsOnly = pastedData.replace(/\D/g, "");
        if (digitsOnly.length > 0) {
            const digits = digitsOnly.slice(0, 6).split("");
            const newOtpDigits = [...otpDigits];
            digits.forEach((digit, i) => {
                if (i < 6) newOtpDigits[i] = digit;
            });
            setOtpDigits(newOtpDigits);
            setError(null);
            
            const nextIndex = Math.min(digits.length, 5);
            const nextInput = document.getElementById(`otp-${nextIndex}`) as HTMLInputElement;
            nextInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (timeLeft <= 0) {
            setError("Kode OTP telah expired. Silakan kirim ulang.");
            return;
        }

        const otpCode = otpDigits.join("");
        if (otpCode.length < 6) {
            setError("Kode OTP harus 6 digit");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await verifyEmailOtp({
                userId,
                code: otpCode,
            });

            setSuccess(true);

            // Jika new affiliate, redirect ke PAYMENT (bukan dashboard)
            // User HARUS bayar 75k dulu sebelum bisa login
            if (isNewAffiliate) {
                // Save payment ke storage SEBELUM redirect (agar payment page bisa load)
                if (response.payment) {
                    localStorage.setItem("pendingPayment", JSON.stringify(response.payment));
                    sessionStorage.setItem("pendingPayment", JSON.stringify(response.payment));
                }
                
                // Redirect to payment page setelah 2 seconds (TIDAK auto-login!)
                // Jika backend belum return payment info, pass userId saja
                setTimeout(() => {
                    navigate("/payment", {
                        replace: true,
                        state: {
                            userId: response.user?.id || userId,
                            email: response.user?.email || email,
                            referralCode,
                            isFromSignup: true,
                            payment: response.payment, 
                        },
                    });
                }, 2000);
            } else {
                // Redirect to login after 2 seconds (forgot password flow)
                setTimeout(() => {
                    navigate("/signin", { replace: true });
                }, 2000);
            }
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
            if (timeLeft > 0) {
                setIsResending(false);
                return;
            }

            await requestEmailOtp({
                userId,
                email,
            });

            setTimeLeft(5 * 60); // Reset timer
            setOtpDigits(["", "", "", "", "", ""]); 
        } catch (err: any) {
            setError(err.message || "Gagal mengirim ulang OTP");
        } finally {
            setIsResending(false);
        }
    };

    const blueColor = "#0665fc";
    const inputBgColor = "#f9f9f9";
    const isExpired = timeLeft <= 0;

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
                    <Box
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}
                    >
                        <IconMail size={32} color={blueColor} />
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
                        Verifikasi Email
                    </Title>
                    <Text
                        mb={24}
                        style={{
                            color: COLORS.text.secondary,
                            fontSize: 14,
                            textAlign: "center",
                        }}
                    >
                        Kami telah mengirim kode OTP ke email{" "}
                        <Text component="span" fw={600}>
                            {email}
                        </Text>
                    </Text>

                    <Box
                        style={{
                            backgroundColor: isExpired ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)",
                            borderRadius: 8,
                            padding: "12px",
                            marginBottom: "16px",
                            textAlign: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: isExpired ? "#dc2626" : blueColor,
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            {isExpired ? "Kode telah expired" : `Berlaku selama: ${formatTime(timeLeft)}`}
                        </Text>
                    </Box>

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
                                    {isNewAffiliate
                                        ? "Email verified! Redirecting to payment... (Harus bayar Rp 75,000 untuk aktivasi)"
                                        : "Email verified! Redirecting to login..."}
                                </Alert>
                            )}

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
                                    Kode OTP{" "}
                                    <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <Flex gap={8} justify="center">
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
                                            disabled={isLoading || success || isExpired}
                                            autoFocus={index === 0}
                                            styles={{
                                                input: {
                                                    backgroundColor: inputBgColor,
                                                    color: COLORS.text.primary,
                                                    border: `2px solid ${isExpired ? "#fca5a5" : COLORS.border}`,
                                                    width: "48px",
                                                    height: "56px",
                                                    fontSize: 22,
                                                    textAlign: "center",
                                                    fontWeight: 700,
                                                    borderRadius: 8,
                                                    transition: "all 0.2s ease",
                                                    "&:focus": {
                                                        borderColor: isExpired ? "#dc2626" : blueColor,
                                                        boxShadow: `0 0 0 3px ${isExpired ? "rgba(220, 38, 38, 0.1)" : "rgba(6, 101, 252, 0.1)"}`,
                                                    },
                                                    "&::placeholder": {
                                                        color: COLORS.text.tertiary,
                                                    },
                                                },
                                            }}
                                        />
                                    ))}
                                </Flex>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="md"
                                disabled={isLoading || success || otpDigits.join("").length < 6 || isExpired}
                                style={{
                                    background: isLoading || success || isExpired ? "#999999" : blueColor,
                                    color: "#ffffff",
                                    fontWeight: 700,
                                    fontSize: 15,
                                    height: 44,
                                    borderRadius: 8,
                                    border: "none",
                                    transition: "all 0.2s ease",
                                    boxShadow: `0 2px 8px rgba(6, 101, 252, 0.2)`,
                                    marginTop: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    cursor:
                                        isLoading || success || isExpired ? "not-allowed" : "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading && !success && !isExpired) {
                                        e.currentTarget.style.background =
                                            "#0044b1";
                                        e.currentTarget.style.boxShadow = `0 4px 12px rgba(6, 101, 252, 0.3)`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading && !success && !isExpired) {
                                        e.currentTarget.style.background =
                                            blueColor;
                                        e.currentTarget.style.boxShadow = `0 2px 8px rgba(6, 101, 252, 0.2)`;
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
                                    "Verify Email"
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
                                {timeLeft > 0 ? (
                                    <span>Kode akan expired dalam <strong>{formatTime(timeLeft)}</strong></span>
                                ) : (
                                    <>
                                        Belum menerima kode?{" "}
                                        <button
                                            onClick={handleResendOTP}
                                            disabled={isResending || isLoading || success}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: blueColor,
                                                textDecoration: "none",
                                                fontWeight: 700,
                                                cursor: isResending ? "not-allowed" : "pointer",
                                                fontSize: 13,
                                                padding: 0,
                                                opacity: isResending ? 0.5 : 1,
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isResending && !isLoading && !success) {
                                                    e.currentTarget.style.opacity = "0.7";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isResending && !isLoading && !success) {
                                                    e.currentTarget.style.opacity = "1";
                                                }
                                            }}
                                        >
                                            {isResending ? "Mengirim..." : "Kirim ulang"}
                                        </button>
                                    </>
                                )}
                            </Text>
                        </Stack>
                    </form>
                </Box>
            </Flex>

            <Box
                style={{
                    flex: 1,
                    background:
                        "linear-gradient(135deg, #f0f6ffff 0%, #0044b1ff 100%)",
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
                        border: "2px solid #0044b1ff",
                        borderRadius: 12,
                        padding: "24px",
                        maxWidth: 400,
                        textAlign: "center",
                    }}
                >
                    <IconMail size={48} color={blueColor} style={{ margin: "0 auto 16px" }} />
                    <Title
                        order={3}
                        mb={12}
                        style={{ color: "#1a1a1a", fontSize: 18, fontWeight: 700 }}
                    >
                        Verifikasi Email
                    </Title>
                    <Text
                        mb={16}
                        style={{
                            color: "#666666",
                            fontSize: 13,
                            lineHeight: 1.6,
                        }}
                    >
                        Email verification adalah langkah penting untuk keamanan akun Anda.
                    </Text>
                    <Stack gap={8}>
                        <Flex gap={8} align="flex-start">
                            <Text style={{ color: blueColor, fontSize: 16, marginTop: "2px" }}>
                                ✓
                            </Text>
                            <Text style={{ color: "#666666", fontSize: 12, textAlign: "left" }}>
                                Cek inbox email Anda
                            </Text>
                        </Flex>
                        <Flex gap={8} align="flex-start">
                            <Text style={{ color: blueColor, fontSize: 16, marginTop: "2px" }}>
                                ✓
                            </Text>
                            <Text style={{ color: "#666666", fontSize: 12, textAlign: "left" }}>
                                Masukkan kode OTP 6 digit
                            </Text>
                        </Flex>
                        <Flex gap={8} align="flex-start">
                            <Text style={{ color: blueColor, fontSize: 16, marginTop: "2px" }}>
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

export default VerifyEmail;
