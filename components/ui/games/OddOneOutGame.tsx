/**
 * components/ui/games/OddOneOutGame.tsx
 *
 * আপডেট:
 * 1) এখন ৩০ দিনের জন্য আলাদা আলাদা (কিন্তু প্রতিদিন নির্দিষ্ট/একই) ৫-রাউন্ডের
 *    সেট আছে — মাসের তারিখ (1-31) অনুযায়ী বাছাই হয়, তাই একই দিনে বারবার
 *    খেললে একই কন্টেন্ট আসবে, কিন্তু প্রতিদিন ভিন্ন।
 * 2) হেডারে এখন "বাকি রাউন্ড: ৫...৪...৩...২...১" এভাবে কমতে দেখাবে।
 * 3) গ্রিড ৩x৩ থেকে ৪x৪ (১৬ ঘর) করা হয়েছে, তাই খুঁজে বের করা আগের
 *    চেয়ে কঠিন।
 */

import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TOTAL_ROUNDS = 5;
const GRID_SIZE = 16; // ৪x৪ গ্রিড — আগের ৯ (৩x৩) থেকে কঠিন
const GRID_COLUMNS = 4;
const DAY_CYCLE = 30; // ৩০ দিনের আলাদা শিডিউল

const EMOJI_PAIRS: { common: string; odd: string }[] = [
  { common: '🍎', odd: '🍏' },
  { common: '🐶', odd: '🐱' },
  { common: '⚽', odd: '🏀' },
  { common: '🚗', odd: '🚕' },
  { common: '🌟', odd: '⭐' },
  { common: '❤️', odd: '💙' },
  { common: '🍩', odd: '🍪' },
  { common: '🌸', odd: '🌼' },
  { common: '🔴', odd: '🟠' },
  { common: '🔵', odd: '🟣' },
  { common: '⚪', odd: '⚫' },
  { common: '🟢', odd: '🟡' },
];

type Round = {
  commonEmoji: string;
  oddEmoji: string;
  oddIndex: number;
};

// ---------- seeded random (Mulberry32) — যাতে একই দিনে একই কন্টেন্ট আসে ----------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(array: T[], rand: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getDayIndex(): number {
  const now = new Date();
  return now.getDate() % DAY_CYCLE; // ১-৩১ কে ০-২৯ এর মধ্যে ম্যাপ করা
}

function generateSessionRounds(): Round[] {
  const dayIndex = getDayIndex();
  const rand = mulberry32(dayIndex + 1000); // দিনের ওপর ভিত্তি করে seed
  const roundsCount = Math.min(TOTAL_ROUNDS, EMOJI_PAIRS.length);
  const shuffledPairs = seededShuffle(EMOJI_PAIRS, rand).slice(0, roundsCount);
  return shuffledPairs.map((pair) => ({
    commonEmoji: pair.common,
    oddEmoji: pair.odd,
    oddIndex: Math.floor(rand() * GRID_SIZE),
  }));
}

type OddOneOutGameProps = {
  onWin?: (reward: number) => void;
  rewardAmount?: number;
};

export default function OddOneOutGame({
  onWin = () => {},
  rewardAmount = 5,
}: OddOneOutGameProps) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [sessionRounds] = useState<Round[]>(() => generateSessionRounds());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const currentRound = sessionRounds[round - 1];
  const roundsRemaining = sessionRounds.length - round + 1; // ৫, ৪, ৩, ২, ১ ...

  const handleCellPress = (index: number) => {
    if (isLocked) return;
    setSelectedIndex(index);
    setIsLocked(true);

    const isCorrect = index === currentRound.oddIndex;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (round >= sessionRounds.length) {
        finishGame(newScore);
      } else {
        setRound((r) => r + 1);
        setSelectedIndex(null);
        setIsLocked(false);
      }
    }, 600);
  };

  const finishGame = (finalScore: number) => {
    const passed = finalScore >= Math.ceil(sessionRounds.length * 0.6);
    Alert.alert(
      passed ? 'অভিনন্দন! 🎉' : 'আবার চেষ্টা করুন',
      `আপনি ${sessionRounds.length} টির মধ্যে ${finalScore} টি সঠিক দিয়েছেন।`,
      [
        {
          text: 'ঠিক আছে',
          onPress: () => {
            if (passed) onWin(rewardAmount);
          },
        },
      ]
    );
  };

  const getCellStyle = (index: number) => {
    if (!isLocked || selectedIndex !== index) return styles.cell;
    if (index === currentRound.oddIndex) return [styles.cell, styles.cellCorrect];
    return [styles.cell, styles.cellWrong];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>অড ওয়ান আউট</Text>
      <Text style={styles.subtitle}>বাকি রাউন্ড: {roundsRemaining}</Text>
      <Text style={styles.hint}>ভিন্ন আইকনটা খুঁজে বের করুন</Text>

      <View style={styles.grid}>
        {Array.from({ length: GRID_SIZE }).map((_, index) => {
          const isOdd = index === currentRound.oddIndex;
          const emoji = isOdd ? currentRound.oddEmoji : currentRound.commonEmoji;
          return (
            <TouchableOpacity
              key={index}
              style={getCellStyle(index)}
              onPress={() => handleCellPress(index)}
              activeOpacity={0.8}
            >
              <Text style={styles.cellText}>{emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.scoreText}>সঠিক: {score}</Text>
    </View>
  );
}

const CELL_SIZE = 60;
const CELL_MARGIN = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: '#0b0b18',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#00e5ff', fontWeight: 'bold', marginBottom: 2 },
  hint: {
    fontSize: 12,
    color: '#9aa0c7',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: (CELL_SIZE + CELL_MARGIN * 2) * GRID_COLUMNS,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: CELL_MARGIN,
    borderRadius: 10,
    backgroundColor: '#12132a',
    borderWidth: 1,
    borderColor: '#3d4a8f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCorrect: { borderColor: '#00e676', backgroundColor: '#0f2e1e' },
  cellWrong: { borderColor: '#ff5252', backgroundColor: '#2e0f0f' },
  cellText: { fontSize: 26 },
  scoreText: { marginTop: 20, color: '#00e5ff', fontSize: 16, fontWeight: 'bold' },
});