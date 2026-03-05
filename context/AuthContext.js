import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getUserProfile, loginUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData,  setUserData]  = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const appState        = useRef(AppState.currentState);
  const wasInBackground = useRef(false);
  const pollingRef      = useRef(null);

  useEffect(() => {
    clearAndStart();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current === 'active' && nextState === 'background') {
        wasInBackground.current = true;
        stopPolling();
      }
      if (nextState === 'active' && wasInBackground.current) {
        wasInBackground.current = false;
        if (userData?.status === 'pending') {
          startPolling(userData._id || userData.id);
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
    pollingRef.current = setInterval(async () => {
      try {
        const data = await getUserProfile(userId);
        if (data) {
          const freshUser = syncBalance(data?.user || data);
          if (freshUser.status !== 'pending') {
            setUserData(freshUser);
            stopPolling();
          }
        }
      } catch (e) {
        console.log('Polling error:', e?.message);
      }
    }, 30000);
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

  const login = async (email, password) => {
    try {
      setUserToken(null);
      setUserData(null);
      await AsyncStorage.multiRemove(['userToken', 'userData']);

      const data = await loginUser(email, password);

      // ✅ FIXED: token না থাকলেও login হবে — success চেক করো
      if (!data?.success) {
        throw { msg: data?.msg || 'লগইন ব্যর্থ হয়েছে।' };
      }

      const syncedUser = syncBalance(data.user || data);

      // ✅ token থাকলে set করো, না থাকলে 'logged_in' দাও
      const token = data.token || 'logged_in';

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