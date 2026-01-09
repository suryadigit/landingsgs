export const reportErrorToUI = async (err: any, response?: Response | any) => {
  try {
    console.error('Reported error:', err, response || null);
    return { message: err?.message || String(err), raw: err };
  } catch (e) {
    console.error('Error while reporting error:', e);
    return { message: String(err || 'Unknown error'), raw: err };
  }
};

export default reportErrorToUI;
