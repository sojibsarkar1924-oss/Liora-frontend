import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getUserProfile, loginUser } from '../services/api';

export const AuthContext = createContext();

// ✅ pending অবস্থায় থাকলে কত ঘনঘন backend status চেক হবে (মিলিসেকেন্ড)
const POLL_INTERVAL_MS = 8000; // ৮ সেকেন্ড

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData,  setUserData]  = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const appState        = useRef(AppState.currentState);
  const wasInBackground = useRef(false);
  const pollingRef      = useRef(null);
  const userDataRef     = useRef(null);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  // ✅ App চালু হলে (recent apps থেকে মুছে আবার খোলা হলেও) সবসময়
  // fresh state — আগের session clear করে দেওয়া হয়, প্রথম থেকে (লগইন
  // স্ক্রিন থেকে) শুরু হয়। এখানে আর কোনো session persist/restore করা হচ্ছে না।
  useEffect(() => {
    clearAndStart();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current === 'active' && nextState === 'background') {
        wasInBackground.current = true;
        stopPolling();
      }
      if (nextState === 'active' && wasInBackground.current) {
        wasInBackground.current = false;
        // ✅ App আবার foreground-এ এলে সাথে সাথে একবার status রিফ্রেশ করা
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
    // ✅ ইন্টারভাল শুরুর আগে একবার সাথে সাথে চেক করা
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

  const clearAndStart = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUserToken(null);
      setUserData(null);
    } catch (e) {
      console.error('clearAndStart error:', e);
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
        return syncedUser;
      }
    } catch (error) {
      console.error('updateUserData error:', error?.msg || error?.message);
    }
  };

  // ✅ UPDATED: referralCode → loginId
  const login = async (loginId, password) => {
    try {
      setUserToken(null);
      setUserData(null);
      await AsyncStorage.multiRemove(['userToken', 'userData']);

      const data = await loginUser(loginId, password);

      if (!data?.success) {
        throw { msg: data?.msg || 'Login failed.' };
      }

      const syncedUser = syncBalance(data.user || data);
      const token      = data.token || 'logged_in';

      setUserToken(token);
      setUserData(syncedUser);

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