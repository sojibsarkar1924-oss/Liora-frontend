import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getUserProfile, loginUser } from '../services/api';

export const AuthContext = createContext();

// ✅ pending অবস্থায় থাকলে কত ঘনঘন backend status চেক হবে (মিলিসেকেন্ড)
const POLL_INTERVAL_MS = 8000; // ৮ সেকেন্ড — আগে ৩০ সেকেন্ড ছিল, অনেক ধীর ছিল

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData,  setUserData]  = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const appState        = useRef(AppState.currentState);
  const wasInBackground = useRef(false);
  const pollingRef      = useRef(null);
  const userDataRef     = useRef(null); // সবসময় সর্বশেষ userData রেফারেন্স রাখার জন্য (stale closure এড়াতে)

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  // ✅ App চালু হওয়ার সময় আগের session থাকলে সেটা restore করা হবে —
  // আগে এখানে সবসময় clear করে দেওয়া হতো, ফলে app বন্ধ করে খুললেই লগআউট হয়ে যেত
  useEffect(() => {
    restoreSession();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current === 'active' && nextState === 'background') {
        wasInBackground.current = true;
        stopPolling();
      }
      if (nextState === 'active' && wasInBackground.current) {
        wasInBackground.current = false;
        // ✅ App আবার foreground-এ এলে সাথে সাথে একবার status রিফ্রেশ করা,
        // পোলিং ইন্টারভালের জন্য অপেক্ষা না করেই
        const current = userDataRef.current;
        const userId  = current?._id || current?.id;
        if (current?.status === 'pending' && userId) {
          refreshStatus(userId);
          startPolling(userId);
        }
      }
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
      stopPolling();
    };
  }, []);

  useEffect(() => {
    if (userData?.status === 'pending' && userToken) {
      const userId = userData._id || userData.id;
      startPolling(userId);
    } else {
      stopPolling();
    }
  }, [userData?.status, userToken]);

  const startPolling = (userId) => {
    stopPolling();
    // ✅ ইন্টারভাল শুরুর আগে একবার সাথে সাথে চেক করা (প্রথম ৮ সেকেন্ড অপেক্ষা না করেই)
    refreshStatus(userId);
    pollingRef.current = setInterval(() => {
      refreshStatus(userId);
    }, POLL_INTERVAL_MS);
  };

  const refreshStatus = async (userId) => {
    try {
      const data = await getUserProfile(userId);
      if (data) {
        const freshUser = syncBalance(data?.user || data);
        setUserData(freshUser);
        await persistUserData(freshUser);
        if (freshUser.status !== 'pending') {
          stopPolling();
        }
      }
    } catch (e) {
      console.log('Status refresh error:', e?.message);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const persistUserData = async (user) => {
    try {
      if (user) await AsyncStorage.setItem('userData', JSON.stringify(user));
    } catch (e) {
      console.error('persistUserData error:', e);
    }
  };

  // ✅ App চালু হলে AsyncStorage থেকে আগের token/userData ফিরিয়ে আনা হয়।
  // থাকলে সাথে সাথে backend থেকে সর্বশেষ status-ও একবার চেক করে নেওয়া হয়
  // (যাতে app বন্ধ থাকা অবস্থায় admin approve করলেও তা মিস না হয়)
  const restoreSession = async () => {
    try {
      const [token, savedUser] = await AsyncStorage.multiGet(['userToken', 'userData']);
      const savedToken = token?.[1];
      const savedData  = savedUser?.[1] ? JSON.parse(savedUser[1]) : null;

      if (savedToken && savedData) {
        setUserToken(savedToken);
        setUserData(savedData);

        const userId = savedData._id || savedData.id;
        if (userId) {
          try {
            const fresh = await getUserProfile(userId);
            if (fresh) {
              const syncedUser = syncBalance(fresh?.user || fresh);
              setUserData(syncedUser);
              await persistUserData(syncedUser);
            }
          } catch (e) {
            // নেটওয়ার্ক সমস্যা হলে অন্তত পুরনো (cached) ডাটা নিয়েই রাখা হবে
            console.log('restoreSession refresh error:', e?.message);
          }
        }
      }
    } catch (e) {
      console.error('restoreSession error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const syncBalance = (user) => {
    if (!user) return user;
    const balance = Math.max(Number(user.balance || 0), Number(user.wallet || 0));
    return { ...user, balance, wallet: balance };
  };

  const updateUserData = async (userId) => {
    try {
      if (!userId) return;
      const data = await getUserProfile(userId);
      if (data) {
        const syncedUser = syncBalance(data?.user || data);
        setUserData(syncedUser);
        await persistUserData(syncedUser);
        return syncedUser;
      }
    } catch (error) {
      console.error('updateUserData error:', error?.msg || error?.message);
    }
  };

  // ✅ UPDATED: referralCode → loginId
  // index.tsx থেকে login(loginId, password) call আসবে
  // loginId এর জায়গায় ইউজার নাম (name) অথবা referral code — দুটোর যেকোনো একটা দেওয়া যাবে
  const login = async (loginId, password) => {
    try {
      setUserToken(null);
      setUserData(null);
      await AsyncStorage.multiRemove(['userToken', 'userData']);

      // ✅ loginId (name বা referralCode) দিয়ে login
      const data = await loginUser(loginId, password);

      if (!data?.success) {
        throw { msg: data?.msg || 'Login failed.' };
      }

      const syncedUser = syncBalance(data.user || data);
      const token      = data.token || 'logged_in';

      setUserToken(token);
      setUserData(syncedUser);

      // ✅ session persist করা — এখন app বন্ধ করে খুললেও লগইন অবস্থা থাকবে
      await AsyncStorage.setItem('userToken', token);
      await persistUserData(syncedUser);

      return syncedUser;

    } catch (error) {
      setUserToken(null);
      setUserData(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      stopPolling();
      await AsyncStorage.multiRemove(['userToken', 'userData']);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUserToken(null);
      setUserData(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ login, logout, userToken, userData, isLoading, updateUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};