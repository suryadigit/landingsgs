import React from "react";
import { Box, Title, Text, Button, Flex } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconHome, IconArrowLeft } from "@tabler/icons-react";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Flex
            justify="center"
            align="center"
            style={{
                minHeight: "100vh",
                backgroundColor: "#f1f5f9",
                padding: "20px",
            }}
        >
            <Box style={{ textAlign: "center", maxWidth: 500 }}>
                {/* 404 Text */}
                <Text
                    style={{
                        fontSize: 120,
                        fontWeight: 900,
                        color: "#e2e8f0",
                        lineHeight: 1,
                        marginBottom: "16px",
                    }}
                >
                    404
                </Text>

                {/* Title */}
                <Title
                    order={1}
                    mb={12}
                    style={{
                        color: "#1a1a1a",
                        fontSize: 32,
                        fontWeight: 700,
                    }}
                >
                    Halaman Tidak Ditemukan
                </Title>

                {/* Description */}
                <Text
                    mb={32}
                    style={{
                        color: "#666666",
                        fontSize: 16,
                        lineHeight: 1.6,
                    }}
                >
                    Maaf, halaman yang Anda cari tidak ada atau sudah dihapus. Silakan kembali ke
                    halaman utama atau coba navigasi lagi.
                </Text>

                {/* Buttons */}
                <Flex gap={12} justify="center">
                    <Button
                        leftSection={<IconArrowLeft size={18} />}
                        variant="default"
                        size="md"
                        style={{
                            backgroundColor: "#e2e8f0",
                            color: "#1a1a1a",
                            fontWeight: 700,
                            fontSize: 14,
                            height: 44,
                            borderRadius: 8,
                            border: "none",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => navigate(-1)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#cbd5e1";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#e2e8f0";
                        }}
                    >
                        Kembali
                    </Button>
                    <Button
                        leftSection={<IconHome size={18} />}
                        size="md"
                        style={{
                            background: "linear-gradient(135deg, #618bc9ff 0%, #3761d4ff 100%)",
                            color: "white",
                            fontWeight: 700,
                            fontSize: 14,
                            height: 44,
                            borderRadius: 8,
                            border: "none",
                            transition: "all 0.2s ease",
                            boxShadow: `0 2px 8px rgba(201, 169, 97, 0.2)`,
                        }}
                        onClick={() => navigate("/")}
                    >
                        Ke Halaman Utama
                    </Button>
                </Flex>

                {/* Footer Text */}
                <Text
                    mt={32}
                    style={{
                        color: "#999999",
                        fontSize: 12,
                    }}
                >
                    Error Code: 404 | Halaman tidak ditemukan
                </Text>
            </Box>
        </Flex>
    );
};

export default NotFound;