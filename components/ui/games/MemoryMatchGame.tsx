/**
 * components/ui/games/MemoryMatchGame.tsx
 * ৪×৪ মেমরি ম্যাচ গেম — Expo/React Native
 *
 * নিয়ম:
 *  - বোর্ড ৪×৪ (১৬টি কার্ড, ৮ জোড়া) — পুরো গেম জুড়ে এই একটাই বোর্ড
 *  - প্রতি জোড়া মেলানো = ১ রাউন্ড সম্পন্ন
 *  - উপরে "রাউন্ড ১/৫", "রাউন্ড ২/৫" ... "রাউন্ড ৫/৫" দেখানো হয়
 *  - ৫টি জোড়া (৫ রাউন্ড) মিললেই গেম শেষ, ৳৫ রিওয়ার্ড একবারই দেওয়া হয়
 *    (বাকি ৩ জোড়া অপ্রয়োজনীয়, বোর্ড লক হয়ে যায়)
 *
 * ব্যবহার:
 *   import MemoryMatchGame from '../../components/ui/games/MemoryMatchGame';
 *   <MemoryMatchGame
 *     rewardAmount={5}
 *     roundsToWin={5}
 *     onWin={(reward) => { /* ব্যালেন্স আপডেট করুন *\/ }}
 *   />
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const BOARD_SIZE = 4; // ৪x৪ = ১৬ কার্ড (৮ জোড়া)
const CARD_MARGIN = 6;
const CARD_SIZE = (width - 40 - CARD_MARGIN * BOARD_SIZE * 2) / BOARD_SIZE;

// একাধিক ইমোজি সেট — প্রতিদিন ভিন্ন সেট দেখাতে ব্যবহার করা হয়, প্রতিটাতে ৮টি প্রতীক (৪x৪ বোর্ডের জন্য)
const EMOJI_SETS: string[][] = [
  ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🥝'],
  ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨'],
  ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱'],
  ['🚗', '🚕', '🚙', '🚌', '🚓', '🚑', '🚒', '🚲'],
];

function getTodaysEmojiSet(): string[] {
  const dayIndex = new Date().getDate() % EMOJI_SETS.length;
  return EMOJI_SETS[dayIndex];
}

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

type CardData = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

function buildDeck(): CardData[] {
  const emojis = getTodaysEmojiSet(); // ৮টি প্রতীক
  const doubled = emojis.concat(emojis); // ১৬টি কার্ড (৮ জোড়া)
  const pairs: CardData[] = doubled.map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false,
  }));
  return shuffleArray(pairs);
}

type MemoryMatchGameProps = {
  onWin?: (reward: number) => void;
  rewardAmount?: number;
  roundsToWin?: number; // কতগুলো জোড়া মেলালে গেম জেতা হবে
};

export default function MemoryMatchGame({
  onWin = () => {},
  rewardAmount = 5,
  roundsToWin = 5,
}: MemoryMatchGameProps) {
  const [cards, setCards] = useState<CardData[]>(buildDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0); // এখন পর্যন্ত মেলানো জোড়া সংখ্যা
  const [gameFinished, setGameFinished] = useState(false);

  // ✅ রাউন্ড কাউন্টার — matchedCount অনুযায়ী "১/৫ ... ৫/৫"
  const currentRound = Math.min(matchedCount + 1, roundsToWin);

  useEffect(() => {
    if (gameFinished) return;
    if (matchedCount >= roundsToWin) {
      // ✅✅✅ ৫টি জোড়া (৫ রাউন্ড) সম্পন্ন — এখানেই একবারই রিওয়ার্ড দেওয়া হয় ✅✅✅
      const timeoutId = setTimeout(() => {
        setGameFinished(true);
        setIsLocked(true);
        Alert.alert(
          'অভিনন্দন! 🎉',
          `আপনি ৫ রাউন্ডই সম্পন্ন করেছেন (${moves} চালে)। আপনি ৳${rewardAmount} জিতেছেন।`,
          [
            {
              text: 'ঠিক আছে',
              onPress: () => onWin(rewardAmount),
            },
          ]
        );
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [matchedCount]);

  const handleCardPress = (index: number) => {
    if (isLocked || gameFinished) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length === 2) return;

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], isFlipped: true };
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (newCards[firstIdx].symbol === newCards[secondIdx].symbol) {
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx] = { ...updated[firstIdx], isMatched: true };
            updated[secondIdx] = { ...updated[secondIdx], isMatched: true };
            return updated;
          });
          setFlippedIndices([]);
          setIsLocked(false);
          setMatchedCount((c) => c + 1); // ✅ এক জোড়া মিললেই পরের রাউন্ডে যাওয়া
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx] = { ...updated[firstIdx], isFlipped: false };
            updated[secondIdx] = { ...updated[secondIdx], isFlipped: false };
            return updated;
          });
          setFlippedIndices([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  const resetGame = () => {
    setCards(buildDeck());
    setFlippedIndices([]);
    setMoves(0);
    setMatchedCount(0);
    setIsLocked(false);
    setGameFinished(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>মেমরি ম্যাচ</Text>

      {/* ✅ রাউন্ড কাউন্টার */}
      <Text style={styles.roundText}>
        রাউন্ড: {gameFinished ? roundsToWin : currentRound}/{roundsToWin}
      </Text>
      <Text style={styles.subtitle}>চাল সংখ্যা: {moves}</Text>

      <View style={styles.board}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.isFlipped || card.isMatched
                ? styles.cardFlipped
                : styles.cardHidden,
            ]}
            onPress={() => handleCardPress(index)}
            activeOpacity={0.8}
            disabled={gameFinished}
          >
            <Text style={styles.cardText}>
              {card.isFlipped || card.isMatched ? card.symbol : '?'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>নতুন করে খেলুন</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  roundText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00e5ff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9aa0c7',
    marginBottom: 16,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: width - 40,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: CARD_MARGIN,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHidden: {
    backgroundColor: '#12132a',
    borderWidth: 1,
    borderColor: '#3d4a8f',
  },
  cardFlipped: {
    backgroundColor: '#1e2140',
    borderWidth: 1,
    borderColor: '#00e5ff',
  },
  cardText: {
    fontSize: CARD_SIZE * 0.45,
  },
  resetButton: {
    marginTop: 24,
    backgroundColor: '#00b894',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});