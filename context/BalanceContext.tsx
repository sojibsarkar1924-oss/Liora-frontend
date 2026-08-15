/**
 * context/BalanceContext.tsx
 *
 * বড় আপডেট — দুই ধরনের আয় আলাদা করা হয়েছে:
 *
 * ১) "টাস্ক-আয়" (addTaskEarning) — গেম/ক্যাপচা/ভিডিও থেকে আয়।
 *    প্রতিটা টাস্ক দিনে মাত্র ১ বার করা যাবে। মোট দৈনিক সীমা:
 *      মেমরি ম্যাচ   → ৳৫  (একবার)
 *      অড ওয়ান আউট  → ৳৫  (একবার)
 *      ক্যাপচা       → ৳৮  (একবার)
 *      ভিডিও         → ৳৯  (একবার)
 *      ────────────────────────────
 *      মোট          → ৳২৭ / দিন (সর্বোচ্চ)
 *    একই টাস্ক দ্বিতীয়বার সম্পন্ন করলে টাকা যোগ হবে না (addTaskEarning
 *    false রিটার্ন করবে) — তাই "আনলিমিটেড ইনকাম" আর সম্ভব না।
 *
 * ২) "বোনাস-আয়" (addBonusEarning) — রেফার বোনাস (৳৫০) ও লেভেল বোনাস
 *    (৳১০)। এগুলোর কোনো দৈনিক সীমা নেই।
 *
 * ইনস্টল করতে হবে (যদি আগে থেকে না থাকে):
 *   npx expo install @react-native-async-storage/async-storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

const STORAGE_KEY = 'liora_balance_data_v2';

export type TaskKey = 'memory' | 'oddOneOut' | 'captcha' | 'video';

type DailyTasks = {
  memory: boolean;
  oddOneOut: boolean;
  captcha: boolean;
  video: boolean;
  date: string;
};

type BalanceData = {
  balance: number;
  todaysEarning: number;
  totalEarning: number;
  lastEarningDate: string;
  dailyTasks: DailyTasks;
};

type BalanceContextType = BalanceData & {
  isLoaded: boolean;
  addTaskEarning: (taskKey: TaskKey, amount: number) => Promise<boolean>;
  addBonusEarning: (amount: number) => Promise<void>;
  isTaskDoneToday: (taskKey: TaskKey) => boolean;
  withdraw: (amount: number) => Promise<boolean>;
};

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function freshDailyTasks(): DailyTasks {
  return {
    memory: false,
    oddOneOut: false,
    captcha: false,
    video: false,
    date: getTodayString(),
  };
}

const defaultData: BalanceData = {
  balance: 0,
  todaysEarning: 0,
  totalEarning: 0,
  lastEarningDate: getTodayString(),
  dailyTasks: freshDailyTasks(),
};

const BalanceContext = createContext<BalanceContextType | undefined>(
  undefined
);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BalanceData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: BalanceData = JSON.parse(stored);
          const today = getTodayString();

          if (parsed.lastEarningDate !== today) {
            parsed.todaysEarning = 0;
            parsed.lastEarningDate = today;
          }
          if (!parsed.dailyTasks || parsed.dailyTasks.date !== today) {
            parsed.dailyTasks = freshDailyTasks();
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

  const addTaskEarning = async (
    taskKey: TaskKey,
    amount: number
  ): Promise<boolean> => {
    const today = getTodayString();
    const currentTasks: DailyTasks =
      data.dailyTasks.date === today ? data.dailyTasks : freshDailyTasks();

    if (currentTasks[taskKey]) {
      return false; // আজ ইতিমধ্যে সম্পন্ন হয়েছে — আর টাকা না
    }

    const isNewDay = data.lastEarningDate !== today;
    const newData: BalanceData = {
      balance: data.balance + amount,
      todaysEarning: (isNewDay ? 0 : data.todaysEarning) + amount,
      totalEarning: data.totalEarning + amount,
      lastEarningDate: today,
      dailyTasks: { ...currentTasks, [taskKey]: true },
    };
    await persist(newData);
    return true;
  };

  const addBonusEarning = async (amount: number) => {
    const today = getTodayString();
    const isNewDay = data.lastEarningDate !== today;
    const currentTasks: DailyTasks =
      data.dailyTasks.date === today ? data.dailyTasks : freshDailyTasks();

    const newData: BalanceData = {
      balance: data.balance + amount,
      todaysEarning: (isNewDay ? 0 : data.todaysEarning) + amount,
      totalEarning: data.totalEarning + amount,
      lastEarningDate: today,
      dailyTasks: currentTasks,
    };
    await persist(newData);
  };

  const isTaskDoneToday = (taskKey: TaskKey): boolean => {
    const today = getTodayString();
    if (data.dailyTasks.date !== today) return false;
    return data.dailyTasks[taskKey];
  };

  const withdraw = async (amount: number): Promise<boolean> => {
    if (amount > data.balance) return false;
    const newData: BalanceData = { ...data, balance: data.balance - amount };
    await persist(newData);
    return true;
  };

  return (
    <BalanceContext.Provider
      value={{
        ...data,
        isLoaded,
        addTaskEarning,
        addBonusEarning,
        isTaskDoneToday,
        withdraw,
      }}
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