export type FriendlyError = {
  kind: 'network' | 'auth' | 'server' | 'client' | 'unknown';
  title: string;
  message: string;
  code?: string | number;
  requireLogin?: boolean;
  retryable?: boolean;
  redirectTo?: string | null;
  raw?: any;
};

export const parseFetchError = async (err: any, response?: Response): Promise<FriendlyError> => {
  try {
    const message = (err && err.message) || (response && typeof response === 'object' && (response as any).statusText) || String(err) || 'Terjadi kesalahan';
    const code = response && (response as any).status ? (response as any).status : (err && err.code) || undefined;
    return {
      kind: 'unknown',
      title: 'Error',
      message,
      code,
      raw: err,
    };
  } catch (e) {
    return {
      kind: 'unknown',
      title: 'Error',
      message: String(err) || 'Terjadi kesalahan',
      raw: err,
    };
  }
};

export default parseFetchError;

export const parseAxiosError = async (error: any): Promise<FriendlyError> => {
  try {
    const resp = error?.response;
    const status = resp?.status;
    const body = resp?.data;
    const message = (body && (body.message || body.error)) || error?.message || (resp && resp.statusText) || 'Terjadi kesalahan';
    return {
      kind: 'unknown',
      title: 'Error',
      message,
      code: status,
      raw: error,
    };
  } catch (e) {
    return {
      kind: 'unknown',
      title: 'Error',
      message: error?.message || 'Terjadi kesalahan',
      raw: error,
    };
  }
};

