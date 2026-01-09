import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/auth.context";
import { loginUser } from "../../../api/auth";

interface FormState {
    email: string;
    password: string;
}

interface PendingPayment {
    id: string;
    amount: number;
    invoiceUrl: string;
    status: string;
    expiredAt: string;
    remainingMinutes: number;
}

interface OtpResponse {
    message: string;
    nextStep: string;
    userId: string;
    maskedPhone: string;
    phone?: string; // Full phone number for resending OTP
    expiresIn: string;
    instruction: string;
}

export const useSignin = () => {
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();

    const [formData, setFormData] = useState<FormState>({
        email: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpData, setOtpData] = useState<OtpResponse | null>(null);

    const isFormValid = formData.email.trim() !== "" && formData.password.trim() !== "";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError(null);
    };

    const handlePaymentRedirect = (payment: PendingPayment, email: string) => {
        localStorage.setItem("pendingPayment", JSON.stringify(payment));
        sessionStorage.setItem("pendingPayment", JSON.stringify(payment));

        setError("Akun belum aktif. Mengarahkan ke halaman pembayaran...");

        setTimeout(() => {
            navigate("/payment", {
                replace: true,
                state: {
                    email,
                    redirectFromLogin: true,
                    payment,
                },
            });
        }, 1500);
    };

    const handleLoginSuccess = async (userId: string | undefined, phone: string | null, maskedPhoneFromResponse?: string) => {
        setSuccess(true);
        console.log("✅ Login successful! userId:", userId, "phone:", phone);

        // Jika userId ada, tampilkan OTP modal
        if (userId) {
            console.log("📱 Showing OTP modal for userId:", userId);

            // Gunakan maskedPhone dari response atau mask phone lokal
            let finalMaskedPhone = maskedPhoneFromResponse;
            if (!finalMaskedPhone && phone) {
                finalMaskedPhone = phone.replace(/(\d)(?=(\d{4})+(?!\d))/g, "*");
            }

            setOtpData({
                message: "Kode OTP telah dikirim ke WhatsApp Anda",
                nextStep: "Verifikasi OTP untuk melanjutkan login",
                userId,
                maskedPhone: finalMaskedPhone || "****",
                phone: phone || undefined, // Store full phone for resending
                expiresIn: "5 menit",
                instruction: "Masukkan 4 digit kode OTP yang diterima",
            });

            // Show OTP modal
            console.log("🎯 Showing OTP modal...");
            setShowOtpModal(true);
        } else {
            console.error("⚠️ No userId provided!");
            setError("Login gagal: User ID tidak diterima");
        }
    };

    const handleOtpSuccess = async (otpResponse?: { token?: string; user?: any }) => {
        console.log("🎉 handleOtpSuccess called with:", otpResponse);
        
        const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";
        
        // Prioritas 1: Token dari OTP response
        let token = otpResponse?.token;
        
        // Prioritas 2: Cek localStorage (mungkin sudah disimpan oleh verifyPhoneOtp)
        if (!token) {
            token = localStorage.getItem(tokenKey) || undefined;
            console.log("📦 Token from localStorage:", token ? "found" : "not found");
        }
        
        if (!token) {
            console.error("❌ No token found after OTP verification!");
            console.error("OTP Response was:", otpResponse);
            setError("Token tidak ditemukan. Backend mungkin tidak mengirim token.");
            setShowOtpModal(false);
            return;
        }
        
        console.log("✅ Token obtained, saving to localStorage and auth context...");
        
        // Simpan token ke localStorage (jika belum)
        localStorage.setItem(tokenKey, token);
        
        // Update auth context with token
        setToken(token);
        
        // If user data available from OTP response, set it
        if (otpResponse?.user) {
            setUser(otpResponse.user);
            console.log("✅ User data synced from OTP response");
        }
        
        // Close modal dan redirect berdasarkan role
        setShowOtpModal(false);
        
        // Determine redirect path based on user role
        const userRole = otpResponse?.user?.role?.toUpperCase();
        let redirectPath = "/dashboard-affiliate"; // Default untuk MEMBER
        
        if (userRole === "SUPERADMIN" || userRole === "ADMIN") {
            redirectPath = "/admin/dashboard";
            console.log("👑 Admin/SuperAdmin detected, redirecting to admin dashboard");
        } else {
            console.log("👤 Member detected, redirecting to affiliate dashboard");
        }
        
        setTimeout(() => {
            console.log("🚀 Navigating to:", redirectPath);
            navigate(redirectPath, { replace: true });
        }, 500);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, recaptchaToken?: string | null) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Email dan password harus diisi");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const payload: any = {
                email: formData.email,
                password: formData.password,
            };

            if (recaptchaToken) {
                payload.recaptchaToken = recaptchaToken;
            }

            const response = await loginUser(payload);

            console.log("📤 Login Response:", response);

            // Handle response format dengan userId langsung
            const userId = response?.user?.id || response?.userId;
            const userPhone = response?.user?.phone || null;
            const maskedPhone = response?.maskedPhone;
            
            if (!userId) {
                throw new Error("User ID tidak diterima dari server");
            }
            
            // Only set user and token if they exist in response
            // For OTP flow, token might not be available until OTP is verified
            if (response?.user) {
                setUser(response.user);
            }
            
            // Only set token if it's actually provided
            if (response?.token) {
                setToken(response.token);
                console.log("✅ Token saved from login response");
            } else {
                console.log("ℹ️ No token in login response - will be provided after OTP verification");
            }

            console.log("✅ Extracted userId:", userId, "phone:", userPhone, "maskedPhone:", maskedPhone);
            await handleLoginSuccess(userId, userPhone, maskedPhone);
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorStatus = err?.response?.status;

            // User belum bayar - status 401 dengan payment info
            if (errorStatus === 401 && errorData?.payment) {
                const payment: PendingPayment = {
                    id: errorData.payment.id,
                    amount: errorData.payment.amount,
                    invoiceUrl: errorData.payment.invoiceUrl,
                    status: errorData.payment.status,
                    expiredAt: errorData.payment.expiredAt,
                    remainingMinutes: errorData.payment.remainingMinutes,
                };

                handlePaymentRedirect(payment, formData.email);
            } else {
                const errorMessage =
                    errorData?.message ||
                    err.message ||
                    "Login gagal. Silakan periksa email dan password Anda.";
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        isLoading,
        error,
        success,
        showPassword,
        showOtpModal,
        otpData,
        isFormValid,
        handleInputChange,
        handleSubmit,
        setShowPassword,
        handleOtpSuccess,
        setShowOtpModal,
    };
};