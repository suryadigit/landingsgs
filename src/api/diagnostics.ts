/**
 * API Health Check & Debugging Utilities
 * 
 * Use these utilities to diagnose API issues:
 * 1. Check if backend is running
 * 2. Verify authentication token
 * 3. Test referral endpoint
 * 4. Debug response structure
 */

import axiosClient from './apis';

/**
 * Test backend health
 */
export const checkBackendHealth = async () => {
  try {
    console.log('🏥 Checking backend health...');
    
    // Try a simple health check endpoint
    const response = await axiosClient.get('/health', { timeout: 5000 });
    console.log('✅ Backend is healthy:', response.data);
    return { healthy: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Backend health check failed:', {
      status: error.response?.status,
      message: error.message,
    });
    return { healthy: false, error: error.message };
  }
};

/**
 * Verify authentication token is valid
 */
export const checkAuthToken = async () => {
  try {
    console.log('🔐 Checking authentication token...');
    
    // Get token from localStorage
    const tokenKey = import.meta.env.VITE_TOKEN_KEY || 'auth_token';
    const token = localStorage.getItem(tokenKey);
    
    if (!token) {
      console.warn('⚠️ No token found in localStorage');
      return { valid: false, reason: 'No token in localStorage' };
    }
    
    console.log('✅ Token found in localStorage');
    
    // Check if token is in axios headers
    const authHeader = axiosClient.defaults.headers.common['Authorization'];
    console.log('📋 Authorization header:', authHeader ? 'Set' : 'Not set');
    
    // Try to verify token with backend
    const response = await axiosClient.get('/v1/user/profile', { timeout: 5000 });
    console.log('✅ Token is valid. User profile:', response.data);
    return { valid: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Token verification failed:', {
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data,
    });
    return { 
      valid: false, 
      reason: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

/**
 * Test referral hierarchy endpoint
 */
export const testReferralEndpoint = async () => {
  try {
    console.log('📡 Testing referral hierarchy endpoint...');
    
    const response = await axiosClient.get('/v1/commissions/referral-hierarchy', { 
      timeout: 15000 
    });
    
    console.log('✅ Referral endpoint successful:', {
      status: 200,
      messageCount: response.data?.message?.length,
      affiliateId: response.data?.affiliate?.id,
      referralCount: Array.isArray(response.data?.referrals) 
        ? response.data.referrals.length
        : response.data?.referrals?.list?.length,
    });
    
    return { 
      success: true, 
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('❌ Referral endpoint failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code,
      responseData: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    return { 
      success: false,
      error: {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        details: error.response?.data,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Run full diagnostic
 */
export const runFullDiagnostic = async () => {
  console.log('🔍 ========== RUNNING FULL DIAGNOSTIC ==========');
  
  const results = {
    timestamp: new Date().toISOString(),
    backend: await checkBackendHealth(),
    auth: await checkAuthToken(),
    referral: await testReferralEndpoint(),
  };
  
  console.log('🔍 ========== DIAGNOSTIC COMPLETE ==========');
  console.log('📊 Results:', results);
  
  return results;
};

/**
 * Export results as JSON for debugging
 */
export const exportDiagnosticResults = async () => {
  const results = await runFullDiagnostic();
  const json = JSON.stringify(results, null, 2);
  
  // Copy to clipboard
  navigator.clipboard.writeText(json).catch(err => console.error('Failed to copy:', err));
  
  // Also log it
  console.log('📋 Diagnostic results (also copied to clipboard):');
  console.log(json);
  
  return results;
};
