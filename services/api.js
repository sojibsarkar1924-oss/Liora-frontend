const API_URL = 'https://liora-backend-production-74f1.up.railway.app/api';
// ============================================================
// ✅ রেজিস্ট্রেশন
// ============================================================
export const registerUser = async ({ name, email, password, referralCode, packageDetails }) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password, referralCode, packageDetails }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw { msg: data?.msg || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' };
    }
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'সার্ভারে সংযোগ হচ্ছে না।' };
  }
};

// ============================================================
// ✅ লগইন
// ============================================================
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw { msg: data?.msg || 'লগইন ব্যর্থ হয়েছে।' };
    }
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'সার্ভারে সংযোগ হচ্ছে না।' };
  }
};

// ============================================================
// ✅ User Profile
// ============================================================
export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/user/profile/${userId}`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw { msg: data?.msg || 'প্রোফাইল লোড ব্যর্থ।' };
    }
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

// ============================================================
// ✅ পেমেন্ট সাবমিট
// ============================================================
export const submitDeposit = async (data) => {
  try {
    const response = await fetch(`${API_URL}/payment/request`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        userId:       data.userId,
        packageName:  data.packageName,
        packagePrice: data.packagePrice,
        packageTasks: data.packageTasks,
        amount:       data.amount,
        method:       data.method || 'Bkash',
        senderNumber: data.senderNumber,
        trxId:        data.trxId,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw { msg: result?.msg || 'সার্ভার এরর।' };
    }
    return result;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

// ============================================================
// ✅ উইথড্র রিকোয়েস্ট
// ============================================================
export const requestWithdraw = async (data, token) => {
  try {
    const response = await fetch(`${API_URL}/withdraw/request`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ userId: data.userId, amount: data.amount, method: data.method, number: data.number }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw { msg: result?.msg || 'উইথড্র ব্যর্থ হয়েছে।' };
    }
    return result;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

// ============================================================
// ✅ Task করা
// ============================================================
export const doTask = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/task/do`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw { msg: data?.msg || 'কাজ সম্পন্ন হয়নি।' };
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

// ============================================================
// ✅ Task Status
// ============================================================
export const getTaskStatus = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/task/status/${userId}`);
    const data = await response.json();
    if (!response.ok) throw { msg: data?.msg || 'লোড ব্যর্থ।' };
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

// ============================================================
// ✅ Transaction History
// ============================================================
export const getMyTransactions = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/history/${userId}`);
    const data = await response.json();
    if (!response.ok) throw { msg: data?.msg || 'লোড ব্যর্থ।' };
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

// ============================================================
// ✅ NEW: Referral Info — রেফারেল তথ্য
// ============================================================
export const getReferralInfo = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/user/referral/${userId}`);
    const data = await response.json();
    if (!response.ok) throw { msg: data?.msg || 'লোড ব্যর্থ।' };
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

// ============================================================
// ✅ Admin functions
// ============================================================
export const getAdminPayments = async (token) => {
  try {
    const response = await fetch(`${API_URL}/payment/admin/pending-deposits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw { msg: data?.msg || 'লোড ব্যর্থ।' };
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

export const getAdminWithdraws = async (token) => {
  try {
    const response = await fetch(`${API_URL}/withdraw/admin/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw { msg: data?.msg || 'লোড ব্যর্থ।' };
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

export const adminApprovePayment = async (paymentId, token) => {
  try {
    const response = await fetch(`${API_URL}/payment/admin/approve-deposit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ paymentId }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw { msg: data?.msg || 'ব্যর্থ।' };
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

export const adminRejectPayment = async (paymentId, token) => {
  try {
    const response = await fetch(`${API_URL}/payment/admin/reject-deposit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ paymentId }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw { msg: data?.msg || 'ব্যর্থ।' };
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};

export const adminWithdrawAction = async (withdrawId, status, token) => {
  try {
    const response = await fetch(`${API_URL}/withdraw/admin/action`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ withdrawId, status }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw { msg: data?.msg || 'ব্যর্থ।' };
    return data;
  } catch (error) {
    throw error?.msg ? error : { msg: 'নেটওয়ার্ক সমস্যা।' };
  }
};