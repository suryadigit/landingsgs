import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Text,
    Title,
    Button,
    Stack,
    Flex,
    Loader,
    Alert,
} from "@mantine/core";
import {
    IconCheck,
    IconX,
    IconAlertCircle,
} from "@tabler/icons-react";
import { useDarkMode } from "../../hooks/useDarkMode";
import { verifyPaymentNoAuth } from "../../api/apis";

type PaymentStatus = "checking" | "success" | "pending" | "error" | "expired";

const PaymentReturn: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { COLORS, isDark } = useDarkMode();

    const [status, setStatus] = useState<PaymentStatus>("checking");
    const [message, setMessage] = useState("Mengecek status pembayaran...");
    const [details, setDetails] = useState<any>(null);

    const paymentId = searchParams.get("payment_id") || 
                     localStorage.getItem("pendingPayment")
                       ? JSON.parse(localStorage.getItem("pendingPayment") || "{}")?.id
                       : null;

    useEffect(() => {
        const checkStatus = async () => {
            if (!paymentId) {
                setStatus("error");
                setMessage("Payment ID tidak ditemukan");
                return;
            }

            try {
                const response = await verifyPaymentNoAuth(paymentId);

                if (response.paymentStatus === "COMPLETED" || 
                    response.status === "COMPLETED") {
                    setStatus("success");
                    setMessage("✅ Pembayaran Berhasil!");
                    setDetails(response);

                    // Clear storage
                    localStorage.removeItem("pendingPayment");
                    sessionStorage.removeItem("pendingPayment");

                    // Auto redirect after 3 seconds
                    setTimeout(() => {
                        navigate("/signin", { replace: true });
                    }, 3000);
                } else if (response.paymentStatus === "PENDING") {
                    setStatus("pending");
                    setMessage("⏳ Pembayaran Masih Pending");
                    setDetails(response);

                    // Retry in 5 seconds
                    setTimeout(checkStatus, 5000);
                } else if (response.paymentStatus === "EXPIRED") {
                    setStatus("expired");
                    setMessage("⏰ Invoice Telah Expired");
                    setDetails(response);
                } else {
                    setStatus("error");
                    setMessage("❌ Status Pembayaran Tidak Diketahui");
                    setDetails(response);
                }
            } catch (error: any) {
                setStatus("error");
                setMessage("❌ Gagal Mengecek Status Pembayaran");
                setDetails(error?.message);
            }
        };

        checkStatus();
    }, [paymentId, navigate]);

    if (status === "checking") {
        return (
            <Flex
                justify="center"
                align="center"
                style={{
                    minHeight: "100vh",
                    backgroundColor: COLORS.bg.primary,
                }}
            >
                <Stack align="center" gap={16}>
                    <Loader color="#0665fc" size="lg" />
                    <Text style={{ color: COLORS.text.secondary }}>
                        {message}
                    </Text>
                </Stack>
            </Flex>
        );
    }

    if (status === "success") {
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
                        {message}
                    </Title>

                    <Text
                        mb={24}
                        style={{ color: COLORS.text.secondary, fontSize: 14 }}
                    >
                        Akun Anda sudah aktif. Silakan login untuk mulai earning.
                    </Text>

                    {details && (
                        <Box
                            style={{
                                backgroundColor: isDark ? COLORS.bg.secondary : "#f9f9f9",
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: 8,
                                padding: "16px",
                                marginBottom: "24px",
                                textAlign: "left",
                            }}
                        >
                            <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                                Affiliate: <strong>{details.affiliate?.code}</strong>
                            </Text>
                            <Text style={{ color: COLORS.text.secondary, fontSize: 12, marginTop: "8px" }}>
                                Status: <strong style={{ color: "#10b981" }}>ACTIVE</strong>
                            </Text>
                        </Box>
                    )}

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
                        Masuk ke Akun
                    </Button>

                    <Text
                        mt={16}
                        style={{
                            color: COLORS.text.tertiary,
                            fontSize: 12,
                        }}
                    >
                        Redirecting ke login dalam 3 detik...
                    </Text>
                </Box>
            </Flex>
        );
    }

    if (status === "pending") {
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
                            backgroundColor: "rgba(6, 101, 252, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}
                    >
                        <Loader size={40} color="#0665fc" />
                    </Box>

                    <Title
                        order={1}
                        mb={8}
                        style={{ color: COLORS.text.primary }}
                    >
                        {message}
                    </Title>

                    <Text
                        mb={24}
                        style={{ color: COLORS.text.secondary, fontSize: 14 }}
                    >
                        Sistem sedang memproses pembayaran Anda. Mohon tunggu...
                    </Text>

                    <Button
                        fullWidth
                        size="md"
                        variant="light"
                        onClick={() => navigate("/payment", { replace: true })}
                        style={{
                            color: "#0665fc",
                            fontWeight: 700,
                            height: 44,
                            borderRadius: 8,
                        }}
                    >
                        Kembali ke Pembayaran
                    </Button>
                </Box>
            </Flex>
        );
    }

    if (status === "expired") {
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
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}
                    >
                        <IconAlertCircle size={40} color="#ef4444" />
                    </Box>

                    <Title
                        order={1}
                        mb={8}
                        style={{ color: COLORS.text.primary }}
                    >
                        {message}
                    </Title>

                    <Text
                        mb={24}
                        style={{ color: COLORS.text.secondary, fontSize: 14 }}
                    >
                        Invoice telah melewati masa berlaku. Silakan buat invoice baru.
                    </Text>

                    <Stack gap={12}>
                        <Button
                            fullWidth
                            size="md"
                            onClick={() => navigate("/payment", { replace: true })}
                            style={{
                                background: "#0665fc",
                                color: "white",
                                fontWeight: 700,
                                height: 44,
                                borderRadius: 8,
                            }}
                        >
                            Buat Invoice Baru
                        </Button>

                        <Button
                            fullWidth
                            size="md"
                            variant="light"
                            onClick={() => navigate("/signin", { replace: true })}
                            style={{
                                color: "#0665fc",
                                fontWeight: 700,
                                height: 44,
                                borderRadius: 8,
                            }}
                        >
                            Kembali ke Login
                        </Button>
                    </Stack>
                </Box>
            </Flex>
        );
    }

    // Error state
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
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                    }}
                >
                    <IconX size={40} color="#ef4444" />
                </Box>

                <Title
                    order={1}
                    mb={8}
                    style={{ color: COLORS.text.primary }}
                >
                    {message}
                </Title>

                <Text
                    mb={24}
                    style={{ color: COLORS.text.secondary, fontSize: 14 }}
                >
                    Terjadi kesalahan saat mengecek status pembayaran.
                </Text>

                {details && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        color="red"
                        mb={24}
                        style={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                    >
                        <Text style={{ fontSize: 12, color: "#dc2626" }}>
                            {details}
                        </Text>
                    </Alert>
                )}

                <Stack gap={12}>
                    <Button
                        fullWidth
                        size="md"
                        onClick={() => window.location.reload()}
                        style={{
                            background: "#0665fc",
                            color: "white",
                            fontWeight: 700,
                            height: 44,
                            borderRadius: 8,
                        }}
                    >
                        Coba Lagi
                    </Button>

                    <Button
                        fullWidth
                        size="md"
                        variant="light"
                        onClick={() => navigate("/signin", { replace: true })}
                        style={{
                            color: "#0665fc",
                            fontWeight: 700,
                            height: 44,
                            borderRadius: 8,
                        }}
                    >
                        Kembali ke Login
                    </Button>
                </Stack>
            </Box>
        </Flex>
    );
};

export default PaymentReturn;
