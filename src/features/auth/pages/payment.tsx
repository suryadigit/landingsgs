import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Text,
    Title,
    Button,
    Stack,
    Flex,
    Alert,
    Loader,
    Badge,
} from "@mantine/core";
import { useState } from 'react';
import {
    IconCreditCard,
    IconCheck,
    IconX,
    IconClock,
} from "@tabler/icons-react";
import { useDarkMode, usePaymentFlow } from "../../../shared/hooks";
import { useAuth } from '../../auth';
import { sendInvoiceEmail } from '../../affiliate/api/affiliateApi';

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { COLORS, isDark } = useDarkMode();
    
    const {
        payment,
        isPolling,
        isPaid,
        timeLeft,
        error,
        startPolling,
        stopPolling,
        loadPaymentFromStorage,
        clearPayment,
        setPaymentFromState,
    } = usePaymentFlow();

    const { user } = useAuth();

    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
    const [loadTimeout, setLoadTimeout] = React.useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        const state = location.state as any;
        
        if (state?.payment && !payment) {
            setPaymentFromState(state.payment);
            return;
        }
        
        if (!payment) {
            loadPaymentFromStorage();
        }
        
        const timeoutId = setTimeout(() => {
            if (!payment) {
                setLoadTimeout(true);
            }
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [location.state, payment, setPaymentFromState, loadPaymentFromStorage]);

    useEffect(() => {
        if (isPaid) {
            setTimeout(() => {
                clearPayment();
                navigate("/signin", { replace: true });
            }, 2000);
        }
    }, [isPaid, navigate, clearPayment]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    const handlePayNow = () => {
        if (!payment?.invoiceUrl) {
            return;
        }

        (async () => {
            try {
                const userEmail = user?.email || null;
                if (payment?.id) {
                    await sendInvoiceEmail(payment.id, userEmail || undefined);
                    setEmailSent(true);
                }
            } catch (err) {
            }
        })();

        try {
            const newWin = window.open('about:blank', '_blank');
            if (newWin) {
                newWin.location.href = payment.invoiceUrl;
            }
        } catch (err) {
        }

        setTimeout(() => startPolling(), 1500);
    };


    const formatCurrency = (amount?: number) => {
        if (!amount) return "Rp 0";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount);
    };

    if (isPaid) {
        return (
            <Flex
                justify="center"
                align="center"
                style={{
                    minHeight: "100vh",
                    backgroundColor: COLORS.bg.primary,
                    padding: "20px",
                }}
            >
                <Box style={{ textAlign: "center", maxWidth: 400 }}>
                    <Box
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}
                    >
                        <IconCheck size={40} color="#10b981" />
                    </Box>

                    <Title
                        order={1}
                        mb={8}
                        style={{ color: COLORS.text.primary }}
                    >
                        Pembayaran Berhasil! ✅
                    </Title>
                    <Text
                        mb={24}
                        style={{ color: COLORS.text.secondary, fontSize: 14 }}
                    >
                        Akun Anda sudah aktif. Silakan login kembali.
                    </Text>

                    <Button
                        fullWidth
                        size="md"
                        onClick={() => navigate("/signin", { replace: true })}
                        style={{
                            background: "#10b981",
                            color: "white",
                            fontWeight: 700,
                            height: 44,
                            borderRadius: 8,
                        }}
                    >
                        Kembali ke Login
                    </Button>
                </Box>
            </Flex>
        );
    }

    if (!payment) {
        return (
            <Flex
                justify="center"
                align="center"
                style={{
                    minHeight: "100vh",
                    backgroundColor: COLORS.bg.primary,
                    padding: "20px",
                }}
            >
                <Box style={{ textAlign: "center", maxWidth: 400 }}>
                    <Stack align="center" gap={16}>
                        <Loader color="#0665fc" size="lg" />
                        <Text style={{ color: COLORS.text.secondary }}>
                            Loading pembayaran...
                        </Text>
                        <Text style={{ color: COLORS.text.tertiary, fontSize: 12 }}>
                            Memuat data pembayaran dari penyimpanan...
                        </Text>
                    </Stack>

                    {loadTimeout && (
                        <Alert
                            icon={<IconX size={18} />}
                            color="yellow"
                            mt={24}
                            styles={{
                                root: {
                                    backgroundColor: "rgba(251, 191, 36, 0.1)",
                                    border: "1px solid rgba(251, 191, 36, 0.3)",
                                    borderRadius: 8,
                                },
                            }}
                        >
                            <Stack gap={12}>
                                <Text style={{ fontSize: 13, fontWeight: 600 }}>
                                    ⚠️ Pembayaran tidak ditemukan
                                </Text>
                                <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                                    Silakan kembali ke login dan coba lagi
                                </Text>
                                <Button
                                    size="sm"
                                    fullWidth
                                    variant="light"
                                    onClick={() => navigate("/signin", { replace: true })}
                                >
                                    Kembali ke Login
                                </Button>
                                <Button
                                    size="sm"
                                    fullWidth
                                    variant="subtle"
                                    onClick={() => {
                                        loadPaymentFromStorage();
                                        setLoadTimeout(false);
                                    }}
                                >
                                    Coba Lagi
                                </Button>
                            </Stack>
                        </Alert>
                    )}
                </Box>
            </Flex>
        );
    }

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
                    padding: isMobile ? "20px" : "40px",
                    minHeight: isMobile ? "auto" : "100vh",
                }}
            >
                <Box style={{ width: "100%", maxWidth: 420 }}>
                    {/* Header */}
                    <Box style={{ marginBottom: 32, textAlign: "center" }}>
                        <Box
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                backgroundColor: "rgba(6, 101, 252, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                            }}
                        >
                            <IconCreditCard size={32} color="#0665fc" />
                        </Box>
                        <Title
                            order={1}
                            style={{
                                color: COLORS.text.primary,
                                fontSize: isMobile ? 24 : 28,
                            }}
                        >
                            Aktivasi Akun
                        </Title>
                        <Text
                            mt={8}
                            style={{
                                color: COLORS.text.secondary,
                                fontSize: 14,
                            }}
                        >
                            Selesaikan pembayaran untuk mengaktifkan akun Anda
                        </Text>
                    </Box>

                    {error && (
                        <Alert
                            icon={<IconX size={18} />}
                            color="red"
                            mb={20}
                            styles={{
                                root: {
                                    backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    borderRadius: 8,
                                },
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box
                        style={{
                            backgroundColor: isDark ? COLORS.bg.secondary : "#f9f9f9",
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 8,
                            padding: "16px",
                            marginBottom: "24px",
                        }}
                    >
                        <Stack gap={12}>
                            <Flex justify="space-between" align="center">
                                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>
                                    Jumlah Pembayaran
                                </Text>
                                <Text
                                    style={{
                                        color: "#0665fc",
                                        fontSize: 16,
                                        fontWeight: 700,
                                    }}
                                >
                                    {formatCurrency(payment.amount)}
                                </Text>
                            </Flex>

                            <Flex justify="space-between" align="center">
                                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>
                                    Status
                                </Text>
                                <Badge color="blue" variant="light">
                                    Menunggu Pembayaran
                                </Badge>
                            </Flex>

                            <Flex justify="space-between" align="center">
                                <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>
                                    Berlaku Sampai
                                </Text>
                                <Text 
                                    style={{ 
                                        color: timeLeft === "Expired" ? "#ef4444" : COLORS.text.secondary,
                                        fontSize: 13,
                                        fontWeight: timeLeft === "Expired" ? 700 : 400,
                                    }}
                                >
                                    {timeLeft || "Loading..."}
                                </Text>
                            </Flex>
                        </Stack>
                    </Box>

                    {isPolling && (
                        <Alert
                            icon={<IconClock size={18} />}
                            color="blue"
                            mb={20}
                            styles={{
                                root: {
                                    backgroundColor: "rgba(6, 101, 252, 0.1)",
                                    border: "1px solid rgba(6, 101, 252, 0.3)",
                                    borderRadius: 8,
                                },
                            }}
                        >
                            <Flex align="center" gap={8}>
                                <Loader size={14} color="#0665fc" />
                            </Flex>
                        </Alert>
                    )}

                    <Stack gap={12}>
                        {emailSent && (
                            <Alert color="blue" variant="light">Link tagihan telah dikirim ke email Anda.</Alert>
                        )}
                        <Button
                            fullWidth
                            size="md"
                            disabled={isPolling}
                            onClick={handlePayNow}
                            style={{
                                background: "#0665fc",
                                color: "white",
                                fontWeight: 700,
                                fontSize: 15,
                                height: 44,
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                cursor: isPolling ? "not-allowed" : "pointer",
                            }}
                        >
                            {isPolling ? (
                                <>
                                    <Loader size={16} color="white" />
                                    
                                </>
                            ) : (
                                <>
                                    <IconCreditCard size={18} />
                                    Bayar Sekarang
                                </>
                            )}
                        </Button>

                        {isPolling && (
                            <Text
                                style={{
                                    color: COLORS.text.secondary,
                                    fontSize: 12,
                                    textAlign: "center",
                                }}
                            >
                                ⏳ Jangan tutup halaman ini sampai pembayaran selesai
                            </Text>
                        )}

                        <Button
                            fullWidth
                            size="md"
                            variant="light"
                            onClick={() => navigate("/signin", { replace: true })}
                            style={{
                                color: "#0665fc",
                                fontWeight: 700,
                                fontSize: 15,
                                height: 44,
                                borderRadius: 8,
                            }}
                        >
                            Kembali ke Login
                        </Button>
                    </Stack>

                    {/* Info */}
                    <Text
                        mt={24}
                        style={{
                            color: COLORS.text.tertiary,
                            fontSize: 12,
                            textAlign: "center",
                            lineHeight: 1.6,
                        }}
                    >
                        💳 Pembayaran diproses melalui Xendit
                        <br />
                        🔒 Transaksi Anda aman dan terenkripsi
                    </Text>
                </Box>
            </Flex>

            <Box
                style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #f0f6ffff 0%, #0044b1ff 100%)",
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
                        border: "2px solid rgba(0, 68, 177, 0.2)",
                        borderRadius: 12,
                        padding: "24px",
                        maxWidth: 350,
                        textAlign: "center",
                    }}
                >
                    <Title
                        order={3}
                        mb={16}
                        style={{
                            color: "#1a1a1a",
                            fontSize: 18,
                            fontWeight: 700,
                        }}
                    >
                        Pembayaran Aman & Cepat
                    </Title>
                    <Stack gap={12}>
                        <Flex gap={8} align="flex-start">
                            <Text
                                style={{
                                    color: "#0665fc",
                                    fontSize: 18,
                                    marginTop: "2px",
                                    minWidth: 20,
                                }}
                            >
                                ✓
                            </Text>
                            <Text
                                style={{
                                    color: "#555",
                                    fontSize: 13,
                                    textAlign: "left",
                                }}
                            >
                                Berbagai metode pembayaran tersedia
                            </Text>
                        </Flex>
                        <Flex gap={8} align="flex-start">
                            <Text
                                style={{
                                    color: "#555",
                                    fontSize: 13,
                                    textAlign: "left",
                                }}
                            >
                                Enkripsi tingkat bank
                            </Text>
                        </Flex>
                        <Flex gap={8} align="flex-start">
                            <Text
                                style={{
                                    color: "#555",
                                    fontSize: 13,
                                    textAlign: "left",
                                }}
                            >
                                Akun aktif dalam hitungan detik
                            </Text>
                        </Flex>
                    </Stack>
                </Box>
            </Box>
        </Flex>
    );
};

export default PaymentPage;