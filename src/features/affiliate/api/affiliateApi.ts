import axiosClient from "../../../shared/api/axios";

export const refreshInvoice = async () => {
  const response = await axiosClient.post("/v1/payments/refresh-invoice");
  return response.data;
};

export const startPaymentPolling = async () => {
  const response = await axiosClient.post("/v1/payments/start-polling");
  return response.data;
};

export const getAffiliateStatus = async () => {
  const response = await axiosClient.get("/v1/affiliate/status");
  return response.data;
};

export const getAffiliateDashboard = async () => {
  const response = await axiosClient.get("/v1/affiliate/dashboard/komisi");
  return response.data;
};

export const sendInvoiceEmail = async (paymentId: string, email?: string) => {
  const response = await axiosClient.post('/v1/payments/send-invoice-email', { paymentId, email });
  return response.data;
};
