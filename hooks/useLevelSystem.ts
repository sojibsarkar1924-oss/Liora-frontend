/**
 * useLevelSystem.ts
 * লেভেল ও রেফার সিস্টেমের লজিক
 *
 * ফিক্স: আগে onBalanceBonus এর টাইপ স্পষ্ট করে বলা ছিল না, তাই
 * TypeScript inferred করেছিল এটা কোনো argument নেয় না (কারণ ডিফল্ট
 * ভ্যালু () => {} ছিল, যেটাতে parameter নেই)। এখন explicit
 * type annotation দেওয়া হয়েছে, তাই LEVEL_UP_BONUS পাস করলে
 * আর এরর দেবে না।
 */

import { useCallback, useState } from 'react';

export const MAX_LEVEL = 50;
export const LEVEL_UP_BONUS = 10; // প্রতি লেভেলে ১০ টাকা বোনাস

type UseLevelSystemOptions = {
  initialReferralCount?: number;
  onBalanceBonus?: (bonusAmount: number) => void; // ← এখন explicit type
};

export default function useLevelSystem({
  initialReferralCount = 0,
  onBalanceBonus = () => {},
}: UseLevelSystemOptions = {}) {
  const [referralCount, setReferralCount] = useState(initialReferralCount);

  const currentLevel = Math.min(referralCount, MAX_LEVEL);

  const registerNewReferral = useCallback(() => {
    setReferralCount((prevCount) => {
      const prevLevel = Math.min(prevCount, MAX_LEVEL);
      const newCount = prevCount + 1;
      const newLevel = Math.min(newCount, MAX_LEVEL);

      if (newLevel > prevLevel) {
        onBalanceBonus(LEVEL_UP_BONUS);
      }

      return newCount;
    });
  }, [onBalanceBonus]);

  return {
    referralCount,
    currentLevel,
    isMaxLevel: currentLevel >= MAX_LEVEL,
    registerNewReferral,
  };
}