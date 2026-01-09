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
    IconCheck,
    IconX,
    IconAlertCircle,
} from "@tabler/icons-react";
import { useDarkMode } from "../../../shared/hooks";
import { verifyLoginOtp, useAuth } from "../../../features/auth";
import { getOrCreatePaymentByUserId, checkPaymentStatusByUserId } from "../../../shared/api";

const OtpVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { COLORS, isDark } = useDarkMode();
    const { setToken, setUser, refreshProfile } = useAuth();
    const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
    const [otpExpired, setOtpExpired] = useState(false);
    const [resendAttempts, setResendAttempts] = useState(0);
    const [pendingRedirect, setPendingRedirect] = useState<null | { type: 'external' | 'internal'; url?: string; path?: string; state?: any }>(null);
    const [purchaseCountdown, setPurchaseCountdown] = useState(0);

    const state = (location.state || {}) as any;
    const params = new URLSearchParams(location.search);
    const safeUserId = state?.userId || params.get("userId") || "";
    const safeMaskedPhone = state?.maskedPhone || params.get("maskedPhone") || "****";
    const phone = state?.phone || params.get("phone") || "";
    const email = state?.email || params.get("email") || "";

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!pendingRedirect || purchaseCountdown <= 0) return;
        const iv = setInterval(() => {
            setPurchaseCountdown((c) => {
                if (c <= 1) {
                    clearInterval(iv);
                    const pr = pendingRedirect;
                    setPendingRedirect(null);
                    if (pr.type === 'external' && pr.url) {
                        window.location.href = pr.url;
                    } else if (pr.type === 'internal' && pr.path) {
                        navigate(pr.path, { replace: true, state: pr.state });
                    }
                    return 0;
                }
                return c - 1;
            });
        }, 1000);

        return () => clearInterval(iv);
    }, [pendingRedirect, purchaseCountdown, navigate]);

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
                let pendingLocal: any = null;
                try {
                    pendingLocal = JSON.parse(localStorage.getItem("pendingOtp") || "null");
                } catch {}
                const userIdToUse = safeUserId || pendingLocal?.userId || undefined;

                const response = await verifyLoginOtp({
                    userId: userIdToUse as string,
                    code: otpCode,
                });

                console.log("verifyLoginOtp response:", response);

                const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
                const token = response?.token || localStorage.getItem(tokenKey) || undefined;

                if (token) {
                    localStorage.setItem(tokenKey, token);
                    setToken(token);

                    if (!response?.user) {
                        try {
                            if (typeof refreshProfile === 'function') {
                                await refreshProfile();
                            } else {
                                const stored = localStorage.getItem('user_profile');
                                if (stored) setUser(JSON.parse(stored));
                            }
                        } catch (profileErr) {
                            console.warn("Failed to refresh user profile after OTP verification:", profileErr);
                        }
                    }
                }

                if (response?.user) {
                    const userWithTimestamps = {
                        ...response.user,
                        createdAt: (response.user as any).createdAt ?? new Date().toISOString(),
                        updatedAt: (response.user as any).updatedAt ?? new Date().toISOString(),
                    };
                    setUser(userWithTimestamps as any);
                    localStorage.setItem("user_profile", JSON.stringify(userWithTimestamps));
                }

                setSuccess(true);
                if (response?.loginSuccess === false && response?.purchaseRequired) {
                    const ref = response.referrerLink as any;
                    const shopUrl = ref?.shopUrl || ref?.referralLink || ref?.shop_url || (ref as any)?.url;

                    let redirectObj: any = null;
                    if (shopUrl) {
                        redirectObj = { type: 'external', url: shopUrl };
                    } else {
                        const affiliateId = ref?.slicewpId || ref?.wpAffiliateId || ref?.affiliateId;
                        if (affiliateId) {
                            redirectObj = { type: 'external', url: `https://jagobikinaplikasi.com/woo/shop/?slicewp_ref=${affiliateId}` };
                        } else {
                            redirectObj = { type: 'external', url: (import.meta as any).env?.VITE_SHOP_URL || 'https://jagobikinaplikasi.com/woo/shop/' };
                        }
                    }

                    setPendingRedirect(redirectObj);
                    setPurchaseCountdown(10);
                    return;
                }

                const userRole = (response?.user?.role || (localStorage.getItem("user_profile") ? JSON.parse(localStorage.getItem("user_profile") || "{}")?.role : undefined) || "").toUpperCase();
                let redirectPath = "/dashboard-affiliate";
                if (userRole === "SUPERADMIN" || userRole === "ADMIN") {
                    redirectPath = "/admin/dashboard";
                }

                setTimeout(() => {
                    navigate(redirectPath, { replace: true });
                }, 500);
            } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message || "Verifikasi OTP gagal";
            const errorLower = errorMessage.toLowerCase();
            const status = err?.response?.status;

            const isOtpExpired =
                status === 410 ||
                errorLower.includes("expired") ||
                errorLower.includes("kedaluwarsa") ||
                errorLower.includes("kadaluarsa") ||
                errorLower.includes("otp expired");

            if (isOtpExpired) {
                setOtpExpired(true);
                setError("Kode OTP telah kedaluwarsa. Silakan minta kode baru.");
                setIsLoading(false);
                return;
            }
            const isAccountNotActive =
                errorLower.includes("belum aktif") ||
                errorLower.includes("not active") ||
                errorLower.includes("pending") ||
                errorLower.includes("payment") ||
                errorLower.includes("bayar") ||
                errorLower.includes("aktivasi") ||
                errorLower.includes("75.000") ||
                errorLower.includes("75000");

            if (isAccountNotActive) {
                setError("Akun Anda belum aktif. Mengambil data pembayaran...");
                setIsRedirectingToPayment(true);
                setIsLoading(false);

                try {
                    let paymentData = null;

                    try {
                        const paymentResponse = await getOrCreatePaymentByUserId(safeUserId);
                        paymentData = paymentResponse?.payment;
                    } catch (apiErr) {
                        const statusResponse = await checkPaymentStatusByUserId(safeUserId);
                        paymentData = statusResponse?.payment || statusResponse;
                    }

                    const payment = paymentData && (paymentData.invoiceUrl || paymentData.invoice_url) ? {
                        id: paymentData.id,
                        amount: paymentData.amount || 75000,
                        status: paymentData.status,
                        invoiceUrl: paymentData.invoiceUrl || paymentData.invoice_url,
                        expiredAt: paymentData.expiredAt || paymentData.expired_at,
                        remainingMinutes: paymentData.remainingMinutes,
                    } : null;

                    const redirectState = payment ? { redirectFromLogin: true, payment } : { redirectFromLogin: true, userId: safeUserId };
                    setPendingRedirect({ type: 'internal', path: '/payment', state: redirectState });
                    setPurchaseCountdown(5);
                } catch (paymentErr: any) {
                    setPendingRedirect({ type: 'internal', path: '/payment', state: { redirectFromLogin: true, userId: safeUserId } });
                    setPurchaseCountdown(5);
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
        let pending: any = null;
        try {
            pending = JSON.parse(localStorage.getItem("pendingOtp") || "null");
        } catch (e) {
            pending = null;
        }

        const payload = {
            userId: pending?.userId || safeUserId || undefined,
            phone: pending?.phone || phone || undefined,
            email: pending?.email || email || undefined,
            otpChannel: pending?.otpMethod || "WHATSAPP",
        } as any;

        if (!payload.userId && !payload.phone) {
            setError("Sesi OTP kedaluwarsa. Silakan masuk kembali.");
            setIsResending(false);
            setTimeout(() => navigate("/signin"), 800);
            return;
        }

        try {
            if (resendAttempts >= 5) {
                setError("Terlalu banyak percobaan. Silakan coba lagi nanti.");
                setIsResending(false);
                return;
            }

            const apiBase = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || "";
            const base = apiBase.replace(/\/$/, "");

            let url = "";
            let body: any = {};

            if (payload.phone) {
                url = `${base}/v1/users/request-phone-otp`;
                body = { userId: payload.userId, phone: payload.phone };
            } else if ((pending && pending.email) || (state && state.email)) {
                const email = pending?.email || state?.email || params.get("email");
                url = `${base}/v1/users/request-email-otp`;
                body = { userId: payload.userId, email };
            } else {
                if (payload.userId) {
                    url = `${base}/v1/users/request-phone-otp`;
                    body = { userId: payload.userId };
                } else {
                    setError("userId and phone are required");
                    setIsResending(false);
                    return;
                }
            }

            const { axiosPublic } = await import('../../../shared/api/axios');
            const endpoint = url.replace(base, '') || '/v1/users/request-phone-otp';
            const resp = await axiosPublic.post(endpoint, body);
            const data = resp.data || {};

            setResendAttempts((s) => s + 1);
            setOtpExpired(false);
            setResendCooldown(60);
            setOtpDigits(["", "", "", "", "", ""]);
            setSuccess;

            try {
                const store = { userId: data?.userId || payload.userId, phone: payload.phone, email: data?.email || (pending?.email || state?.email), otpMethod: payload.otpChannel || pending?.otpMethod, createdAt: new Date().toISOString() };
                localStorage.setItem("pendingOtp", JSON.stringify(store));
            } catch {}
        } catch (err: any) {
            setError(err?.message || "Gagal mengirim ulang OTP");
        } finally {
            setIsResending(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const numericValue = value.replace(/\D/g, "");
        if (numericValue.length > 1) return;
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = numericValue;
        setOtpDigits(newOtpDigits);
        if (error) setError(null);
        if (numericValue && index < 5) {
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
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData.length > 0) {
            const newOtpDigits = pastedData.split("").concat(Array(6 - pastedData.length).fill("")).slice(0, 6);
            setOtpDigits(newOtpDigits);
            if (pastedData.length < 6) {
                const nextInput = document.getElementById(`otp-${pastedData.length}`) as HTMLInputElement;
                nextInput?.focus();
            }
        }
    };

    const blueColor = "#0665fc";
    const inputBgColor = isDark ? COLORS.bg.secondary : "#f9f9f9";

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
                    flex: isMobile ? 1 : 0.6,
                    padding: isMobile ? "20px" : "20px 50px",
                    minHeight: isMobile ? "auto" : "100vh",
                }}
            >
                <Box style={{ width: "100%", maxWidth: 420 }}>
                    <Title order={1} mb={4} fw={700} style={{ color: COLORS.text.primary, fontSize: isMobile ? 22 : 26 }}>
                        Verifikasi OTP
                    </Title>
                    <Text mb={16} style={{ color: COLORS.text.secondary, fontSize: 13 }}>
                        Kami telah mengirim kode OTP ke WhatsApp {safeMaskedPhone}
                    </Text>

                    <Box style={{ backgroundColor: COLORS.bg.secondary, padding: 20, borderRadius: 8 }}>
                        {success && (
                            <Alert icon={<IconCheck size={16} />} color="green" mb={16}>
                                Nomor WhatsApp Anda telah berhasil diverifikasi!
                            </Alert>
                        )}

                        {isRedirectingToPayment && (
                            <Alert icon={<IconAlertCircle size={16} />} color="yellow" mb={16}>
                                {error || "Mengarahkan ke halaman pembayaran..."}
                            </Alert>
                        )}

                        {purchaseCountdown > 0 && (
                            <Alert icon={<IconAlertCircle size={16} />} color="yellow" mb={16}>
                                Kamu belum melakukan pembelian kelas. Mengarahkan ke halaman pembelian dalam {purchaseCountdown}s
                            </Alert>
                        )}

                        {!success && !isRedirectingToPayment && (
                            <form onSubmit={handleVerifyOtp}>
                                <Stack gap={16}>
                                    {otpExpired ? (
                                        <Alert color="red">
                                            <Stack>
                                                <Text style={{ fontWeight: 700 }}>{error}</Text>
                                                <Stack gap={8} align="center">
                                                    <Button onClick={handleResendOtp} disabled={isResending || resendAttempts >= 5} size="sm">
                                                        {isResending ? 'Mengirim...' : 'Minta kode baru'}
                                                    </Button>
                                                    <Button variant="default" size="sm" onClick={() => navigate('/signin')}>
                                                        Kembali ke Login
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        </Alert>
                                    ) : (
                                        error && (
                                            <Alert icon={<IconX size={16} />} color="red">
                                                {error}
                                            </Alert>
                                        )
                                    )}

                                    <div>
                                        <label style={{ display: "block", color: COLORS.text.primary, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                                            Kode OTP<span style={{ color: "#ef4444" }}> *</span>
                                        </label>
                                        <Flex gap={6} justify="center">
                                            {otpDigits.map((digit, index) => (
                                                <TextInput
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    placeholder="0"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.currentTarget.value)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    onPaste={handlePaste}
                                                    maxLength={1}
                                                    disabled={isLoading}
                                                    styles={{ input: { width: "40px", height: "50px", backgroundColor: inputBgColor, color: COLORS.text.primary, border: `1px solid ${COLORS.border}`, fontSize: 20, textAlign: "center", fontWeight: 700, borderRadius: 8, padding: 0 } }}
                                                />
                                            ))}
                                        </Flex>
                                        <Text style={{ color: COLORS.text.tertiary, fontSize: 12, marginTop: 8, textAlign: "center" }}>Masukkan 6 digit kode OTP</Text>
                                    </div>

                                    <Button type="submit" fullWidth size="md" disabled={isLoading || otpDigits.some(d => d === "")} style={{ background: isLoading || otpDigits.some(d => d === "") ? "#cccccc" : blueColor, color: "white", fontWeight: 700 }}>
                                        {isLoading ? <Loader size={16} color="white" /> : "Verifikasi OTP"}
                                    </Button>

                                    <Text style={{ color: COLORS.text.secondary, fontSize: 13, textAlign: "center" }}>
                                        Belum menerima kode?{' '}
                                        <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0 || isResending} style={{ background: "none", border: "none", color: resendCooldown > 0 ? COLORS.text.tertiary : blueColor, fontWeight: 700, cursor: resendCooldown > 0 ? "not-allowed" : "pointer", fontSize: 13, padding: 0, opacity: resendCooldown > 0 ? 0.5 : 1 }}>
                                            {isResending ? "Mengirim..." : resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown}s` : "Kirim ulang"}
                                        </button>
                                    </Text>

                                    <Button type="button" fullWidth size="md" disabled={isLoading} onClick={() => navigate(-1)} style={{ background: "transparent", color: COLORS.text.secondary, fontWeight: 600, border: `1px solid ${COLORS.border}` }}>
                                        Batal
                                    </Button>
                                </Stack>
                            </form>
                        )}
                    </Box>
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
        </Flex>
    );
};

export default OtpVerificationPage;
