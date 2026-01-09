import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
    IconLock,
    IconAlertCircle,
    IconCheck,
    IconX,
    IconEye,
    IconEyeOff,
} from "@tabler/icons-react";
import { useDarkMode } from "../../../shared/hooks";
import { useSignin } from "../hooks/useSignin";


interface LocationState {
    message?: string;
    email?: string;
    needsPayment?: boolean;
}

const SignIn: React.FC = () => {
    const location = useLocation();
    const locationState = location.state as LocationState | null;
    
    const [signupMessage, setSignupMessage] = useState<string | null>(locationState?.message || null);

    const {
        formData,
        isLoading,
        error,
        success,
        showPassword,
        isFormValid,
        handleInputChange,
        recaptchaReady,
        submitWithRecaptcha,
        setShowPassword,
    } = useSignin();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { COLORS, isDark } = useDarkMode();
    
    useEffect(() => {
        if (locationState?.email && formData.email === '') {
            handleInputChange({ target: { name: 'email', value: locationState.email } } as React.ChangeEvent<HTMLInputElement>);
        }
        if (signupMessage) {
            const timer = setTimeout(() => setSignupMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [locationState, signupMessage]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    const blueColor = "#0665fc";
    const inputBgColor = isDark ? COLORS.bg.secondary : "#f9f9f9";
    const inputBorder = COLORS.border;

    

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
                        Login Affiliate
                    </Title>
                    <Text
                        mb={16}
                        style={{ color: COLORS.text.secondary, fontSize: 12 }}
                    >
                        Masuk ke akun affiliate Anda
                    </Text>

                    <form onSubmit={submitWithRecaptcha}>
                        <Stack gap={12}>
                            {signupMessage && (
                                <Alert
                                    icon={<IconCheck size={18} />}
                                    color="green"
                                    styles={{
                                        root: {
                                            backgroundColor: isDark ? "rgba(34, 197, 94, 0.08)" : "rgba(34, 197, 94, 0.06)",
                                            border: `1px solid ${isDark ? "rgba(34, 197, 94, 0.4)" : "rgba(34, 197, 94, 0.2)"}`,
                                            borderRadius: 8,
                                            padding: "12px 14px",
                                            animation: "slideDown 0.3s ease-out",
                                        },
                                        message: {
                                            color: isDark ? "#86efac" : "#16a34a",
                                            fontSize: 13,
                                            fontWeight: 500,
                                        },
                                    }}
                                >
                                    {signupMessage}
                                </Alert>
                            )}

                            {error && (
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
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert
                                    icon={<IconCheck size={18} />}
                                    color="orange"
                                    styles={{
                                        root: {
                                            backgroundColor: isDark ? "rgba(185, 114, 16, 0.08)" : "rgba(185, 129, 16, 0.06)",
                                            border: `1px solid ${isDark ? "rgba(185, 123, 16, 0.4)" : "rgba(16, 185, 129, 0.2)"}`,
                                            borderRadius: 8,
                                            padding: "12px 14px",
                                            animation: "slideDown 0.3s ease-out",
                                        },
                                        message: {
                                            color: isDark ? "#efc386ff" : "#964b05ff",
                                            fontSize: 13,
                                            fontWeight: 500,
                                        },
                                    }}
                                >
                                    Sedang verifikasi OTP...
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
                                
                                /* Focus styles for inputs */
                                .mantine-TextInput-input:focus,
                                .mantine-TextInput-input:focus-visible {
                                    border-color: #0055d4 !important;
                                    outline: none !important;
                                }
                                
                                .mantine-TextInput-input:hover {
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
                                    Email atau WhatsApp
                                    <span style={{ color: "#ef4444" }}> *</span>
                                </label>
                                <TextInput
                                    placeholder="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    leftSection={<IconMail size={18} color={formData.email ? "#0055d4" : COLORS.text.tertiary} />}
                                    required
                                    styles={{
                                        input: {
                                            backgroundColor: inputBgColor,
                                            color: COLORS.text.primary,
                                            border: formData.email ? "2px solid #0055d4" : `1px solid ${inputBorder}`,
                                            height: 40,
                                            paddingLeft: 38,
                                            fontSize: 13,
                                            borderRadius: 8,
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                borderColor: "#0055d4",
                                            },
                                            "&:focus": {
                                                borderColor: "#0055d4",
                                                boxShadow: "0 0 0 2px rgba(212, 175, 55, 0.2)",
                                                outline: "none",
                                            },
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
                                <TextInput
                                    placeholder="••••••••"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    leftSection={<IconLock size={18} color={formData.password ? "#0055d4" : COLORS.text.tertiary} />}
                                    rightSection={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "0 8px",
                                            }}
                                        >
                                            {showPassword ? (
                                                <IconEyeOff size={18} color={COLORS.text.tertiary} />
                                            ) : (
                                                <IconEye size={18} color={COLORS.text.tertiary} />
                                            )}
                                        </button>
                                    }
                                    required
                                    styles={{
                                        input: {
                                            backgroundColor: inputBgColor,
                                            color: COLORS.text.primary,
                                            border: formData.password ? "2px solid #0055d4" : `1px solid ${inputBorder}`,
                                            height: 40,
                                            paddingLeft: 38,
                                            paddingRight: 38,
                                            fontSize: 13,
                                            borderRadius: 8,
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                borderColor: "#0055d4",
                                            },
                                            "&:focus": {
                                                borderColor: "#0055d4",
                                                boxShadow: "0 0 0 2px rgba(212, 175, 55, 0.2)",
                                                outline: "none",
                                            },
                                            "&::placeholder": {
                                                color: COLORS.text.tertiary,
                                            },
                                        },
                                    }}
                                />
                            </div>

                            <Flex justify="flex-end" mb={4}>
                                <a
                                    href="/forgot-password"
                                    style={{
                                        color: COLORS.text.primary,
                                        fontWeight: 600,
                                        fontSize: 12,
                                        textDecoration: "none",
                                        transition: "opacity 0.2s ease",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                                >
                                    Lupa password?
                                </a>
                            </Flex>

                            <Text size="xs" c="dimmed" ta="center" mb={8}>
                                {recaptchaReady ? "Dilindungi oleh reCAPTCHA Enterprise" : "Memuat reCAPTCHA..."}
                            </Text>
                            <Button
                                type="submit"
                                fullWidth
                                size="md"
                                disabled={isLoading || !isFormValid || !recaptchaReady}
                                style={{
                                    background: isLoading || !isFormValid || !recaptchaReady ? "#cccccc" : blueColor,
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    height: 40,
                                    borderRadius: 30,
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    boxShadow: isLoading || !isFormValid || !recaptchaReady
                                        ? `0 2px 8px rgba(204, 204, 204, 0.15)`
                                        : `0 2px 8px rgba(6, 101, 252, 0.2)`,
                                    marginTop: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px",
                                    cursor: isLoading || !isFormValid || !recaptchaReady ? "not-allowed" : "pointer",
                                    opacity: isLoading || !isFormValid || !recaptchaReady ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading && isFormValid && recaptchaReady) {
                                        e.currentTarget.style.background = "#0055d4";
                                        e.currentTarget.style.boxShadow = `0 6px 16px rgba(6, 101, 252, 0.3)`;
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading && isFormValid && recaptchaReady) {
                                        e.currentTarget.style.background = blueColor;
                                        e.currentTarget.style.boxShadow = `0 2px 8px rgba(6, 101, 252, 0.2)`;
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader size={18} color="white" />
                                    </>
                                ) : (
                                    "Masuk"
                                )}
                            </Button>
                        </Stack>
                    </form>

                    <Flex justify="center" mt={14}>
                        <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                            Belum punya akun?{" "}
                            <a
                                href="/signup"
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
                                Daftar di sini
                            </a>
                        </Text>
                    </Flex>

                    {!isMobile && (
                        <Alert
                            icon={<IconAlertCircle size={16} color={blueColor} />}
                            mt={16}
                            styles={{
                                root: {
                                    background: isDark ? "rgba(6, 101, 252, 0.08)" : "rgba(6, 101, 252, 0.05)",
                                    border: `1px solid ${isDark ? "rgba(6, 101, 252, 0.2)" : "rgba(6, 101, 252, 0.15)"}`,
                                    borderRadius: 10,
                                    padding: "12px 14px",
                                },
                                title: {
                                    color: COLORS.text.primary,
                                    fontWeight: 700,
                                    fontSize: 12,
                                    marginBottom: 4,
                                },
                                message: {
                                    color: COLORS.text.secondary,
                                    fontSize: 11,
                                    lineHeight: 1.4,
                                },
                            }}
                            title="Catatan Penting:"
                        >
                            <Stack gap={3} style={{ marginLeft: "2px" }}>
                                <Flex gap={6} align="flex-start">
                                    <Box
                                        style={{
                                            width: 3,
                                            height: 3,
                                            borderRadius: "50%",
                                            backgroundColor: blueColor,
                                            marginTop: "5px",
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Text style={{ color: COLORS.text.secondary, fontSize: 11 }}>
                                        Jika akun belum diaktivasi, Anda akan diarahkan ke halaman pembayaran
                                    </Text>
                                </Flex>
                                <Flex gap={6} align="flex-start">
                                    <Box
                                        style={{
                                            width: 3,
                                            height: 3,
                                            borderRadius: "50%",
                                            backgroundColor: blueColor,
                                            marginTop: "5px",
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Text style={{ color: COLORS.text.secondary, fontSize: 11 }}>
                                        Selesaikan pembayaran Rp 75,000 untuk aktivasi akun
                                    </Text>
                                </Flex>
                            </Stack>
                        </Alert>
                    )}
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
                        bottom: "-3%",
                        right: "25%",
                        width: 60,
                        height: 60,
                        background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                        transform: "rotate(45deg)",
                        borderRadius: 8,
                        zIndex: 0,
                    }}
                />
                
                <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                    <img
                        src="LogoDMLC.webp"
                        alt="Decorative"
                        style={{
                            maxWidth: "80%",
                            maxHeight: "400px",
                            objectFit: "contain",
                            filter: "drop-shadow(0 8px 32px rgba(0, 0, 0, 0.15))",
                        }}
                    />
                </Box>
            </Box>

            {isMobile && (
                <Alert
                    icon={<IconAlertCircle size={18} color="#d43737ff" />}
                    mt={20}
                    mx={20}
                    mb={20}
                    styles={{
                        root: {
                            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(255, 237, 74, 0.05) 100%)",
                            border: "1px solid rgba(212, 175, 55, 0.3)",
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
                    title="Catatan Penting:"
                >
                    <Stack gap={6}>
                        <Flex gap={8} align="flex-start">
                            <Box
                                style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    backgroundColor: blueColor,
                                    marginTop: "5px",
                                    flexShrink: 0,
                                }}
                            />
                            <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                                Jika akun belum diaktivasi, Anda akan diarahkan ke halaman pembayaran
                            </Text>
                        </Flex>
                        <Flex gap={8} align="flex-start">
                            <Box
                                style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    backgroundColor: blueColor,
                                    marginTop: "5px",
                                    flexShrink: 0,
                                }}
                            />
                            <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                                Selesaikan pembayaran Rp 75,000 untuk aktivasi akun
                            </Text>
                        </Flex>
                       
                    </Stack>
                </Alert>
            )}
        </Flex>
    );
};

export default SignIn;