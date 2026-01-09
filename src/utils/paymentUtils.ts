export interface PaymentInfo {
  id: string;
  amount: number;
  invoiceUrl: string;
  status: string;
  expiredAt: string;
  remainingMinutes?: number;
}

export const savePaymentInfo = (payment: PaymentInfo): void => {
  const data = JSON.stringify(payment);
  localStorage.setItem("pendingPayment", data);
  sessionStorage.setItem("pendingPayment", data);
};

export const loadPaymentInfo = (): PaymentInfo | null => {
  const stored = localStorage.getItem("pendingPayment");
  if (stored) {
    try {
      return JSON.parse(stored) as PaymentInfo;
    } catch (e) {
      localStorage.removeItem("pendingPayment");
    }
  }

  const sessionStored = sessionStorage.getItem("pendingPayment");
  if (sessionStored) {
    try {
      const data = JSON.parse(sessionStored) as PaymentInfo;
      localStorage.setItem("pendingPayment", sessionStored);
      sessionStorage.removeItem("pendingPayment");
      return data;
    } catch (e) {
      sessionStorage.removeItem("pendingPayment");
    }
  }

  return null;
};

export const clearPaymentInfo = (): void => {
  localStorage.removeItem("pendingPayment");
  sessionStorage.removeItem("pendingPayment");
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const calculateRemainingTime = (expiredAt: string): {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formattedTime: string;
} => {
  const now = new Date();
  const expireTime = new Date(expiredAt);
  const diff = expireTime.getTime() - now.getTime();

  const totalSeconds = Math.floor(diff / 1000);
  const isExpired = totalSeconds <= 0;

  if (isExpired) {
    return {
      totalSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formattedTime: "Expired",
    };
  }

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  let formattedTime = "";
  if (hours > 0) {
    formattedTime = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  return {
    totalSeconds,
    hours,
    minutes,
    seconds,
    isExpired: false,
    formattedTime,
  };
};

export const isPaymentFromLogin = (): boolean => {
  const state = sessionStorage.getItem("paymentState");
  return state === "from-login";
};

export const markPaymentFromLogin = (): void => {
  sessionStorage.setItem("paymentState", "from-login");
};

export const clearPaymentState = (): void => {
  sessionStorage.removeItem("paymentState");
};

export const openPaymentWindow = (invoiceUrl: string): void => {
  if (!invoiceUrl) {
    return;
  }

  const paymentWindow = window.open(invoiceUrl, "_blank", "width=600,height=700");

  if (!paymentWindow) {
    window.location.href = invoiceUrl;
  }
};

export const logPaymentAction = (
  action: string,
  details: Record<string, any>
): void => {
  const timestamp = new Date().toLocaleTimeString("id-ID");
  console.log(
    `[${timestamp}] 💳 Payment Action: ${action}`,
    details
  );
};
