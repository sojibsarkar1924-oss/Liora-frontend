/**
 * components/ui/games/OddOneOutGame.tsx
 * "অড ওয়ান আউট" পাজল — সম্পূর্ণ আসল কোড (placeholder না)।
 * একগুচ্ছ একই রকম আইকনের মধ্যে যেটা আলাদা, সেটা খুঁজে বের করতে হবে।
 * একই সেশনের ৫ রাউন্ডে কোনো ইমোজি-জোড়া দুইবার আসে না।
 */

import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TOTAL_ROUNDS = 5;
const GRID_SIZE = 9; // ৩x৩ গ্রিড

const EMOJI_PAIRS: { common: string; odd: string }[] = [
  { common: '🍎', odd: '🍏' },
  { common: '🐶', odd: '🐱' },
  { common: '⚽', odd: '🏀' },
  { common: '🚗', odd: '🚕' },
  { common: '🌟', odd: '⭐' },
  { common: '❤️', odd: '💙' },
  { common: '🍩', odd: '🍪' },
  { common: '🌸', odd: '🌼' },
];

type Round = {
  commonEmoji: string;
  oddEmoji: string;
  oddIndex: number;
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function generateSessionRounds(): Round[] {
  const roundsCount = Math.min(TOTAL_ROUNDS, EMOJI_PAIRS.length);
  const shuffledPairs = shuffleArray(EMOJI_PAIRS).slice(0, roundsCount);
  return shuffledPairs.map((pair) => ({
    commonEmoji: pair.common,
    oddEmoji: pair.odd,
    oddIndex: Math.floor(Math.random() * GRID_SIZE),
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
  const [sessionRounds, setSessionRounds] = useState<Round[]>(
    generateSessionRounds()
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const currentRound = sessionRounds[round - 1];

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
    }, 700);
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
            resetGame();
          },
        },
      ]
    );
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setSessionRounds(generateSessionRounds());
    setSelectedIndex(null);
    setIsLocked(false);
  };

  const getCellStyle = (index: number) => {
    if (!isLocked || selectedIndex !== index) return styles.cell;
    if (index === currentRound.oddIndex) return [styles.cell, styles.cellCorrect];
    return [styles.cell, styles.cellWrong];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>অড ওয়ান আউট</Text>
      <Text style={styles.subtitle}>
        রাউন্ড {round} / {sessionRounds.length} — ভিন্ন আইকনটা খুঁজে বের করুন
      </Text>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: '#0b0b18',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: {
    fontSize: 13,
    color: '#9aa0c7',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 270,
  },
  cell: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 12,
    backgroundColor: '#12132a',
    borderWidth: 1,
    borderColor: '#3d4a8f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCorrect: { borderColor: '#00e676', backgroundColor: '#0f2e1e' },
  cellWrong: { borderColor: '#ff5252', backgroundColor: '#2e0f0f' },
  cellText: { fontSize: 34 },
  scoreText: { marginTop: 20, color: '#00e5ff', fontSize: 16, fontWeight: 'bold' },
});