import { useState } from "react";
import { signupUser } from "../../../api/auth";

interface FormState {
    name: string;
    email: string;
    password: string;
    phone: string;
    referralCode: string;
}

interface SignupSuccessData {
    userId: string;
    email: string;
    otp?: string; // For testing
}

export const useSignup = () => {
    const [formData, setFormData] = useState<FormState>({
        name: "",
        email: "",
        password: "",
        phone: "",
        referralCode: "",
    });

    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [isSignupLoading, setIsSignupLoading] = useState(false);
    const [signupError, setSignupError] = useState<string | null>(null);
    const [signupSuccess, setSignupSuccess] = useState<SignupSuccessData | null>(null);

    const isFormValid =
        formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.password.trim() !== "" &&
        formData.phone.trim() !== "" &&
        formData.referralCode.trim() !== "";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name as keyof FormState]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Partial<FormState> = {};

        if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
        if (!formData.email.trim()) newErrors.email = "Email harus diisi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Format email tidak valid";
        if (!formData.password.trim()) newErrors.password = "Password harus diisi";
        if (formData.password.length < 6)
            newErrors.password = "Password minimal 6 karakter";
        if (!formData.phone.trim()) newErrors.phone = "Nomor WhatsApp harus diisi";
        if (!formData.referralCode.trim())
            newErrors.referralCode = "Kode referral wajib diisi";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, recaptchaToken?: string, whatsappVerificationToken?: string | null) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }


        // ✅ SECURITY: Require WhatsApp verification token
        if (!whatsappVerificationToken) {
            setSignupError("Verifikasi WhatsApp diperlukan. Silakan verifikasi nomor WhatsApp Anda.");
            return;
        }

        setIsSignupLoading(true);
        setSignupError(null);

        try {
            const payload: any = {
                email: formData.email,
                password: formData.password,
                fullName: formData.name,
                phone: formData.phone,
                referralCode: formData.referralCode,
            };

            if (recaptchaToken) payload.recaptchaToken = recaptchaToken;
            if (whatsappVerificationToken) payload.whatsappVerificationToken = whatsappVerificationToken;

            const signupResponse = await signupUser(payload);

            console.log("Signup berhasil:", signupResponse);

            const userId =
                (signupResponse as any).user?.id || (signupResponse as any).userId;
            const userEmail =
                (signupResponse as any).user?.email || formData.email;
            const otp = (signupResponse as any).otp; // For testing

            console.log("Extract: userId =", userId, "email =", userEmail);

            // Set success data to trigger email verification modal
            setSignupSuccess({
                userId,
                email: userEmail,
                otp,
            });
        } catch (error: any) {
            console.error("Signup error:", error);
            
            // Handle specific error messages
            const errorMessage = error.message || "Signup failed, please try again";
            
            if (errorMessage.includes("Referrer tidak aktif")) {
                setSignupError("Kode referral tidak valid. Referrer harus sudah AKTIF (sudah bayar) untuk bisa mengundang member baru. Silakan hubungi referrer Anda untuk mengaktifkan akunnya terlebih dahulu.");
            } else if (errorMessage.includes("Referral code not found")) {
                setSignupError("Kode referral tidak ditemukan. Pastikan kode referral yang Anda masukkan benar.");
            } else {
                setSignupError(errorMessage);
            }
        } finally {
            setIsSignupLoading(false);
        }
    };

    return {
        formData,
        errors,
        isSignupLoading,
        signupError,
        signupSuccess,
        isFormValid,
        handleInputChange,
        handleSubmit,
        setSignupSuccess,
    };
};