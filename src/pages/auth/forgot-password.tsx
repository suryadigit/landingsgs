import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Button,
    Title,
    Text,
    Box,
    Stack,
    Flex,
    Alert,
    PasswordInput,
    Progress,
    TextInput,
} from "@mantine/core";
import {
    IconMail,
    IconLock,
    IconCheck,
    IconX,
    IconArrowLeft,
    IconPhone,
} from "@tabler/icons-react";
import { useDarkMode } from "../../hooks/useDarkMode";
import {
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendResetOtp,
} from "../../api/auth";

// Step constants
const STEP_REQUEST = 1;
const STEP_VERIFY_OTP = 2;
const STEP_NEW_PASSWORD = 3;

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const { COLORS, isDark } = useDarkMode();

    // Current step
    const [currentStep, setCurrentStep] = useState(STEP_REQUEST);

    // Form data
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [otpDigits, setOtpDigits] = useState<string[]>(["" , "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // OTP input refs
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Step 1 response data
    const [userId, setUserId] = useState<string | null>(null);
    const [maskedPhone, setMaskedPhone] = useState<string | null>(null);

    // Step 2 response data
    const [resetToken, setResetToken] = useState<string | null>(null);

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Resend OTP cooldown
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    // Password strength
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Cooldown timer for resend button
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Calculate password strength
    useEffect(() => {
        let strength = 0;
        if (newPassword.length >= 6) strength += 25;
        if (newPassword.length >= 8) strength += 25;
        if (/[A-Z]/.test(newPassword)) strength += 25;
        if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) strength += 25;
        setPasswordStrength(strength);
    }, [newPassword]);

    const blueColor = "#0665fc";
    const inputBgColor = isDark ? COLORS.bg.secondary : "#f9f9f9";
    const inputBorder = COLORS.border;

    // Check if input is email or phone
    const isEmail = (value: string) => value.includes("@");

    // Step 1: Request password reset
    const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!emailOrPhone.trim()) {
            setError("Email atau nomor WhatsApp wajib diisi");
            return;
        }

        setIsLoading(true);

        try {
            const payload = isEmail(emailOrPhone)
                ? { email: emailOrPhone }
                : { phone: emailOrPhone };

            const response = await forgotPassword(payload);

            if (response.userId) {
                setUserId(response.userId);
                setMaskedPhone(response.maskedPhone || null);
                setSuccess(response.message || "Kode OTP telah dikirim ke WhatsApp Anda");
                setCurrentStep(STEP_VERIFY_OTP);
                setResendCooldown(30); // Start cooldown
            } else {
                // User not found case - still show success for security
                setSuccess(response.message || "Jika akun ditemukan, kode OTP akan dikirim ke WhatsApp terdaftar");
            }
        } catch (err: any) {
            setError(err.message || "Gagal memproses permintaan reset password");
        } finally {
            setIsLoading(false);
        }
    };

    // Get complete OTP code from digits
    const getOtpCode = () => otpDigits.join("");
    const isOtpComplete = otpDigits.every(digit => digit !== "");

    // Handle OTP digit input
    const handleOtpChange = (index: number, value: string) => {
        // Only allow single digit
        const digit = value.replace(/\D/g, "").slice(-1);
        
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);

        // Auto-focus next input if digit entered
        if (digit && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace on OTP input
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste for OTP
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData) {
            const newDigits = [...otpDigits];
            for (let i = 0; i < pastedData.length && i < 6; i++) {
                newDigits[i] = pastedData[i];
            }
            setOtpDigits(newDigits);
            // Focus last filled input or last input
            const focusIndex = Math.min(pastedData.length, 5);
            otpInputRefs.current[focusIndex]?.focus();
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const otpCode = getOtpCode();

        if (!otpCode) {
            setError("Kode OTP wajib diisi");
            return;
        }

        if (otpCode.length < 6) {
            setError("Kode OTP harus 6 digit");
            return;
        }

        if (!userId) {
            setError("Sesi tidak valid, silakan ulangi proses");
            setCurrentStep(STEP_REQUEST);
            return;
        }

        setIsLoading(true);

        try {
            const response = await verifyResetOtp({
                userId,
                code: getOtpCode(),
            });

            if (response.resetToken) {
                setResetToken(response.resetToken);
                setSuccess("OTP terverifikasi");
                setCurrentStep(STEP_NEW_PASSWORD);
            }
        } catch (err: any) {
            setError(err.message || "Kode OTP tidak valid atau sudah kedaluwarsa");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!newPassword.trim()) {
            setError("Password baru wajib diisi");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Konfirmasi password tidak sama");
            return;
        }

        if (!resetToken) {
            setError("Token reset tidak valid, silakan ulangi proses");
            setCurrentStep(STEP_REQUEST);
            return;
        }

        setIsLoading(true);

        try {
            const response = await resetPassword({
                resetToken,
                newPassword,
            });

            setSuccess(response.message || "Password berhasil diubah");

            // Redirect to signin after 2 seconds
            setTimeout(() => {
                navigate("/signin", { replace: true });
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Gagal mengubah password");
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (!userId || resendCooldown > 0) return;

        setIsResending(true);
        setError(null);

        try {
            const response = await resendResetOtp({ userId });
            setSuccess(response.message || "Kode OTP baru telah dikirim");
            setResendCooldown(60); // 60 second cooldown
            setOtpDigits(["", "", "", "", "", ""]); // Clear input
            otpInputRefs.current[0]?.focus(); // Focus first input
        } catch (err: any) {
            setError(err.message || "Gagal mengirim ulang OTP");
        } finally {
            setIsResending(false);
        }
    };

    // Go back to previous step
    const handleBack = () => {
        setError(null);
        setSuccess(null);
        if (currentStep === STEP_VERIFY_OTP) {
            setCurrentStep(STEP_REQUEST);
            setOtpDigits(["", "", "", "", "", ""]);
        } else if (currentStep === STEP_NEW_PASSWORD) {
            setCurrentStep(STEP_VERIFY_OTP);
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    // Get step icon
    const getStepIcon = (step: number) => {
        switch (step) {
            case STEP_REQUEST:
                return <IconMail size={24} />;
            case STEP_VERIFY_OTP:
                return <IconPhone size={24} />;
            case STEP_NEW_PASSWORD:
                return <IconLock size={24} />;
            default:
                return <IconMail size={24} />;
        }
    };

    // Get step title
    const getStepTitle = () => {
        switch (currentStep) {
            case STEP_REQUEST:
                return "Lupa Password";
            case STEP_VERIFY_OTP:
                return "Verifikasi OTP";
            case STEP_NEW_PASSWORD:
                return "Password Baru";
            default:
                return "Lupa Password";
        }
    };

    // Get step description
    const getStepDescription = () => {
        switch (currentStep) {
            case STEP_REQUEST:
                return "Masukkan email atau nomor WhatsApp yang terdaftar";
            case STEP_VERIFY_OTP:
                return maskedPhone
                    ? `Masukkan kode OTP yang dikirim ke WhatsApp ${maskedPhone}`
                    : "Masukkan kode OTP yang dikirim ke WhatsApp Anda";
            case STEP_NEW_PASSWORD:
                return "Buat password baru untuk akun Anda";
            default:
                return "";
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 25) return "red";
        if (passwordStrength <= 50) return "orange";
        if (passwordStrength <= 75) return "yellow";
        return "green";
    };

    return (
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
                    {/* Back button */}
                    {currentStep > STEP_REQUEST && (
                        <Button
                            variant="subtle"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={handleBack}
                            mb={16}
                            style={{
                                color: COLORS.text.secondary,
                                padding: "4px 8px",
                            }}
                        >
                            Kembali
                        </Button>
                    )}

                    {/* Step indicator */}
                    <Flex gap={8} mb={24} align="center">
                        {[STEP_REQUEST, STEP_VERIFY_OTP, STEP_NEW_PASSWORD].map((step) => (
                            <Box
                                key={step}
                                style={{
                                    width: step === currentStep ? 32 : 24,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor:
                                        step <= currentStep
                                            ? blueColor
                                            : isDark
                                            ? "rgba(255,255,255,0.1)"
                                            : "rgba(0,0,0,0.1)",
                                    transition: "all 0.3s ease",
                                }}
                            />
                        ))}
                        <Text size="xs" c="dimmed" ml={8}>
                            Langkah {currentStep} dari 3
                        </Text>
                    </Flex>

                    {/* Icon */}
                    <Box
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 16,
                            backgroundColor: isDark ? "rgba(6, 101, 252, 0.15)" : "rgba(6, 101, 252, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                            color: blueColor,
                        }}
                    >
                        {getStepIcon(currentStep)}
                    </Box>

                    {/* Title */}
                    <Title
                        order={1}
                        mb={4}
                        fw={700}
                        style={{ color: COLORS.text.primary, fontSize: isMobile ? 22 : 26 }}
                    >
                        {getStepTitle()}
                    </Title>
                    <Text mb={16} style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                        {getStepDescription()}
                    </Text>

                    {/* Error Alert */}
                    {error && (
                        <Alert
                            icon={<IconX size={18} />}
                            color="red"
                            mb={16}
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

                    {/* Success Alert */}
                    {success && (
                        <Alert
                            icon={<IconCheck size={18} />}
                            color="green"
                            mb={16}
                            styles={{
                                root: {
                                    backgroundColor: isDark
                                        ? "rgba(34, 197, 94, 0.08)"
                                        : "rgba(34, 197, 94, 0.06)",
                                    border: `1px solid ${
                                        isDark
                                            ? "rgba(34, 197, 94, 0.4)"
                                            : "rgba(34, 197, 94, 0.2)"
                                    }`,
                                    borderRadius: 8,
                                    padding: "12px 14px",
                                },
                                message: {
                                    color: isDark ? "#86efac" : "#16a34a",
                                    fontSize: 13,
                                    fontWeight: 500,
                                },
                            }}
                        >
                            {success}
                        </Alert>
                    )}

                    {/* Step 1: Request Reset */}
                    {currentStep === STEP_REQUEST && (
                        <form onSubmit={handleRequestReset}>
                            <Stack gap={16}>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            color: COLORS.text.primary,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Email atau WhatsApp
                                        <span style={{ color: "#ef4444" }}> *</span>
                                    </label>
                                    <TextInput
                                        placeholder="Email atau nomor WhatsApp"
                                        value={emailOrPhone}
                                        onChange={(e) => setEmailOrPhone(e.target.value)}
                                        leftSection={
                                            isEmail(emailOrPhone) ? (
                                                <IconMail
                                                    size={18}
                                                    color={emailOrPhone ? blueColor : COLORS.text.tertiary}
                                                />
                                            ) : (
                                                <IconPhone
                                                    size={18}
                                                    color={emailOrPhone ? blueColor : COLORS.text.tertiary}
                                                />
                                            )
                                        }
                                        required
                                        styles={{
                                            input: {
                                                backgroundColor: inputBgColor,
                                                color: COLORS.text.primary,
                                                border: emailOrPhone
                                                    ? `2px solid ${blueColor}`
                                                    : `1px solid ${inputBorder}`,
                                                height: 44,
                                                paddingLeft: 38,
                                                fontSize: 14,
                                                borderRadius: 8,
                                                transition: "all 0.2s ease",
                                            },
                                        }}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="md"
                                    loading={isLoading}
                                    disabled={isLoading || !emailOrPhone.trim()}
                                    style={{
                                        background:
                                            isLoading || !emailOrPhone.trim()
                                                ? "#cccccc"
                                                : blueColor,
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: 14,
                                        height: 44,
                                        borderRadius: 30,
                                        border: "none",
                                        transition: "all 0.3s ease",
                                        marginTop: 8,
                                    }}
                                >
                                    {isLoading ? "Mengirim..." : "Kirim Kode OTP"}
                                </Button>

                                <Flex justify="center" mt={8}>
                                    <Link
                                        to="/signin"
                                        style={{
                                            color: blueColor,
                                            fontWeight: 600,
                                            fontSize: 13,
                                            textDecoration: "none",
                                        }}
                                    >
                                        Kembali ke Login
                                    </Link>
                                </Flex>
                            </Stack>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {currentStep === STEP_VERIFY_OTP && (
                        <form onSubmit={handleVerifyOtp}>
                            <Stack gap={16}>
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
                                    
                                    {/* 6 OTP Input Boxes */}
                                    <Flex gap={8} justify="center" onPaste={handleOtpPaste}>
                                        {otpDigits.map((digit, index) => (
                                            <Box
                                                key={index}
                                                style={{
                                                    position: "relative",
                                                    width: isMobile ? 44 : 52,
                                                    height: isMobile ? 52 : 60,
                                                }}
                                            >
                                                <input
                                                    ref={(el) => {
                                                        otpInputRefs.current[index] = el;
                                                    }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        textAlign: "center",
                                                        fontSize: isMobile ? 20 : 24,
                                                        fontWeight: 600,
                                                        color: COLORS.text.primary,
                                                        backgroundColor: inputBgColor,
                                                        border: digit
                                                            ? `2px solid ${blueColor}`
                                                            : `1px solid ${inputBorder}`,
                                                        borderRadius: 8,
                                                        outline: "none",
                                                        transition: "all 0.2s ease",
                                                        caretColor: blueColor,
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = blueColor;
                                                        e.target.style.boxShadow = `0 0 0 3px rgba(6, 101, 252, 0.15)`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = digit ? blueColor : inputBorder;
                                                        e.target.style.boxShadow = "none";
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Flex>
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="md"
                                    loading={isLoading}
                                    disabled={isLoading || !isOtpComplete}
                                    style={{
                                        background:
                                            isLoading || !isOtpComplete
                                                ? "#cccccc"
                                                : blueColor,
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: 14,
                                        height: 44,
                                        borderRadius: 30,
                                        border: "none",
                                        transition: "all 0.3s ease",
                                        marginTop: 8,
                                    }}
                                >
                                    {isLoading ? "Memverifikasi..." : "Verifikasi OTP"}
                                </Button>

                                {/* Resend OTP */}
                                <Flex justify="center" align="center" gap={4}>
                                    <Text size="sm" c="dimmed">
                                        Tidak menerima kode?
                                    </Text>
                                    <Text
                                        size="sm"
                                        component="span"
                                        onClick={resendCooldown > 0 || isResending ? undefined : handleResendOtp}
                                        style={{
                                            color: resendCooldown > 0 || isResending ? COLORS.text.tertiary : blueColor,
                                            fontWeight: 600,
                                            cursor: resendCooldown > 0 || isResending ? "default" : "pointer",
                                            opacity: isResending ? 0.7 : 1,
                                        }}
                                    >
                                        {isResending
                                            ? "Mengirim..."
                                            : resendCooldown > 0
                                            ? `Kirim ulang (${resendCooldown}s)`
                                            : "Kirim ulang"}
                                    </Text>
                                </Flex>
                            </Stack>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {currentStep === STEP_NEW_PASSWORD && (
                        <form onSubmit={handleResetPassword}>
                            <Stack gap={16}>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            color: COLORS.text.primary,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Password Baru
                                        <span style={{ color: "#ef4444" }}> *</span>
                                    </label>
                                    <PasswordInput
                                        placeholder="Minimal 6 karakter"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        leftSection={
                                            <IconLock
                                                size={18}
                                                color={newPassword ? blueColor : COLORS.text.tertiary}
                                            />
                                        }
                                        required
                                        styles={{
                                            input: {
                                                backgroundColor: inputBgColor,
                                                color: COLORS.text.primary,
                                                border: newPassword
                                                    ? `2px solid ${blueColor}`
                                                    : `1px solid ${inputBorder}`,
                                                height: 44,
                                                paddingLeft: 38,
                                                fontSize: 14,
                                                borderRadius: 8,
                                                transition: "all 0.2s ease",
                                            },
                                            innerInput: {
                                                height: 44,
                                            },
                                        }}
                                    />
                                    {newPassword && (
                                        <Box mt={8}>
                                            <Progress
                                                value={passwordStrength}
                                                color={getPasswordStrengthColor()}
                                                size="xs"
                                                radius="xl"
                                            />
                                            <Text size="xs" c="dimmed" mt={4}>
                                                Kekuatan password:{" "}
                                                {passwordStrength <= 25
                                                    ? "Lemah"
                                                    : passwordStrength <= 50
                                                    ? "Cukup"
                                                    : passwordStrength <= 75
                                                    ? "Baik"
                                                    : "Kuat"}
                                            </Text>
                                        </Box>
                                    )}
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            color: COLORS.text.primary,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Konfirmasi Password
                                        <span style={{ color: "#ef4444" }}> *</span>
                                    </label>
                                    <PasswordInput
                                        placeholder="Masukkan ulang password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        leftSection={
                                            <IconLock
                                                size={18}
                                                color={confirmPassword ? blueColor : COLORS.text.tertiary}
                                            />
                                        }
                                        required
                                        error={
                                            confirmPassword &&
                                            newPassword !== confirmPassword
                                                ? "Password tidak sama"
                                                : undefined
                                        }
                                        styles={{
                                            input: {
                                                backgroundColor: inputBgColor,
                                                color: COLORS.text.primary,
                                                border:
                                                    confirmPassword && newPassword === confirmPassword
                                                        ? "2px solid #22c55e"
                                                        : confirmPassword
                                                        ? `2px solid ${blueColor}`
                                                        : `1px solid ${inputBorder}`,
                                                height: 44,
                                                paddingLeft: 38,
                                                fontSize: 14,
                                                borderRadius: 8,
                                                transition: "all 0.2s ease",
                                            },
                                            innerInput: {
                                                height: 44,
                                            },
                                        }}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="md"
                                    loading={isLoading}
                                    disabled={
                                        isLoading ||
                                        !newPassword ||
                                        newPassword.length < 6 ||
                                        newPassword !== confirmPassword
                                    }
                                    style={{
                                        background:
                                            isLoading ||
                                            !newPassword ||
                                            newPassword.length < 6 ||
                                            newPassword !== confirmPassword
                                                ? "#cccccc"
                                                : blueColor,
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: 14,
                                        height: 44,
                                        borderRadius: 30,
                                        border: "none",
                                        transition: "all 0.3s ease",
                                        marginTop: 8,
                                    }}
                                >
                                    {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
                                </Button>
                            </Stack>
                        </form>
                    )}
                </Box>
            </Flex>

            {/* Right Side - Decorative */}
            {!isMobile && (
                <Flex
                    justify="center"
                    align="center"
                    style={{
                        flex: 0.5,
                        background: `linear-gradient(135deg, ${blueColor} 0%, #0044cc 100%)`,
                        minHeight: "100vh",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Background pattern */}
                    <Box
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0.1,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />

                    <Box style={{ textAlign: "center", color: "white", zIndex: 1, padding: 40 }}>
                        <IconLock size={80} style={{ marginBottom: 24, opacity: 0.9 }} />
                        <Title order={2} mb={16} style={{ fontWeight: 700 }}>
                            Reset Password
                        </Title>
                        <Text size="md" style={{ opacity: 0.9, maxWidth: 280, margin: "0 auto" }}>
                            Kami akan mengirimkan kode OTP ke WhatsApp yang terdaftar untuk
                            memverifikasi identitas Anda
                        </Text>
                    </Box>
                </Flex>
            )}
        </Flex>
    );
};

export default ForgotPassword;
