import axiosClient, { axiosPublic } from "./axios";

export interface PaymentStatus {
  id: string;
  status: string;
  amount: number;
  invoiceUrl?: string;
  expiredAt?: string;
  paidAt?: string;
  paymentMethod?: string;
}

export interface PaymentResponse {
  message: string;
  payment: PaymentStatus;
}

export interface GetOrCreatePaymentResponse {
  payment: {
    id: string;
    amount: number;
    status: string;
    invoiceUrl: string;
    expiredAt: string;
    remainingMinutes?: number;
  };
  isNew: boolean;
  message: string;
}

export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatus> => {
  const response = await axiosClient.get<PaymentResponse>(`/v1/payments/${paymentId}`);
  return response.data.payment;
};

export const getUserPendingPayment = async (userId: string): Promise<PaymentStatus | null> => {
  try {
    const response = await axiosClient.get<PaymentResponse>(`/v1/payments/user/${userId}/pending`);
    return response.data.payment;
  } catch {
    return null;
  }
};

export const checkActivationStatus = async () => {
  const response = await axiosClient.get("/v1/invoices/activation-status");
  return response.data;
};

export const checkPaymentStatusById = async (paymentId: string) => {
  const response = await axiosPublic.get(`/v1/invoices/${paymentId}/status`);
  return response.data;
};

export const checkPaymentStatusByUserId = async (userId: string) => {
  const response = await axiosPublic.get(`/v1/users/${userId}/payment-status`);
  return response.data;
};

export const verifyPaymentFromXendit = async () => {
  const response = await axiosClient.post("/v1/payments/verify-from-xendit");
  return response.data;
};

export const verifyPaymentNoAuth = async (paymentId?: string, userId?: string) => {
  const params = new URLSearchParams();
  if (paymentId) params.append("paymentId", paymentId);
  if (userId) params.append("userId", userId);
  const response = await axiosPublic.post(`/v1/payments/verify-no-auth?${params.toString()}`);
  return response.data;
};

export const refreshPaymentInvoice = async () => {
  const response = await axiosClient.post("/v1/payments/refresh-invoice");
  return response.data;
};

export const getCompleteActivationStatus = async () => {
  const response = await axiosClient.get("/v1/invoices/activation-complete");
  return response.data;
};

export const getOrCreatePaymentByUserId = async (userId: string): Promise<GetOrCreatePaymentResponse> => {
  const response = await axiosPublic.post<GetOrCreatePaymentResponse>(`/v1/payments/get-or-create`, { userId });
  return response.data;
};
