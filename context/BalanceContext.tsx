/**
 * context/BalanceContext.tsx
 * পুরো অ্যাপের কেন্দ্রীয় ব্যালেন্স/আয় সিস্টেম।
 * AsyncStorage দিয়ে ডিভাইসে সংরক্ষিত থাকে, তাই অ্যাপ বন্ধ করে
 * আবার খুললেও ব্যালেন্স ঠিক থাকবে।
 *
 * ইনস্টল করতে হবে (যদি আগে থেকে না থাকে):
 *   npx expo install @react-native-async-storage/async-storage
 *
 * ব্যবহার (যেকোনো স্ক্রিনে):
 *   import { useBalance } from '../context/BalanceContext';
 *   const { balance, todaysEarning, totalEarning, addEarning, withdraw } = useBalance();
 *
 * অ্যাপের রুটে (app/_layout.tsx) BalanceProvider দিয়ে সব র‍্যাপ করতে হবে —
 * নিচে _layout.tsx এর উদাহরণ দেওয়া আছে।
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

const STORAGE_KEY = 'liora_balance_data_v1';

type BalanceData = {
  balance: number;
  todaysEarning: number;
  totalEarning: number;
  lastEarningDate: string; // YYYY-MM-DD ফরম্যাটে, "আজকের উপার্জন" রিসেট করার জন্য
};

type BalanceContextType = BalanceData & {
  isLoaded: boolean;
  addEarning: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<boolean>; // false = ব্যালেন্স যথেষ্ট নেই
};

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

const defaultData: BalanceData = {
  balance: 0,
  todaysEarning: 0,
  totalEarning: 0,
  lastEarningDate: getTodayString(),
};

const BalanceContext = createContext<BalanceContextType | undefined>(
  undefined
);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BalanceData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // অ্যাপ চালু হওয়ার সময় সংরক্ষিত ডেটা লোড করা
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: BalanceData = JSON.parse(stored);
          const today = getTodayString();
          // নতুন দিন শুরু হলে "আজকের উপার্জন" রিসেট করা
          if (parsed.lastEarningDate !== today) {
            parsed.todaysEarning = 0;
            parsed.lastEarningDate = today;
          }
          setData(parsed);
        }
      } catch (e) {
        console.warn('ব্যালেন্স লোড করতে সমস্যা হয়েছে', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const persist = async (newData: BalanceData) => {
    setData(newData);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.warn('ব্যালেন্স সংরক্ষণ করতে সমস্যা হয়েছে', e);
    }
  };

  const addEarning = async (amount: number) => {
    const today = getTodayString();
    const isNewDay = data.lastEarningDate !== today;
    const newData: BalanceData = {
      balance: data.balance + amount,
      todaysEarning: (isNewDay ? 0 : data.todaysEarning) + amount,
      totalEarning: data.totalEarning + amount,
      lastEarningDate: today,
    };
    await persist(newData);
  };

  const withdraw = async (amount: number): Promise<boolean> => {
    if (amount > data.balance) return false;
    const newData: BalanceData = {
      ...data,
      balance: data.balance - amount,
    };
    await persist(newData);
    return true;
  };

  return (
    <BalanceContext.Provider
      value={{ ...data, isLoaded, addEarning, withdraw }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const ctx = useContext(BalanceContext);
  if (!ctx) {
    throw new Error('useBalance অবশ্যই BalanceProvider এর ভেতরে ব্যবহার করতে হবে');
  }
  return ctx;
}