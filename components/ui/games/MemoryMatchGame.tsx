/**
 * components/ui/games/MemoryMatchGame.tsx
 * ৫-রাউন্ড মেমরি ম্যাচ গেম — Expo/React Native
 *
 * নিয়ম:
 *  - মোট ৫টি রাউন্ড খেলতে হবে
 *  - প্রতি রাউন্ডে ৩ জোড়া (৬টি) কার্ড থাকে, সবগুলো মেলাতে হবে রাউন্ড শেষ করতে
 *  - উপরে "রাউন্ড ১/৫", "রাউন্ড ২/৫" ... দেখানো হয়
 *  - ৫টি রাউন্ড শেষ হলে তবেই onWin(rewardAmount) একবার কল হয় —
 *    তাই নির্ধারিত রিওয়ার্ডের (ডিফল্ট ৳৫) বেশি কখনোই দেওয়া হয় না
 *
 * ব্যবহার:
 *   import MemoryMatchGame from '../../components/ui/games/MemoryMatchGame';
 *   <MemoryMatchGame
 *     rewardAmount={5}
 *     totalRounds={5}
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

const COLUMNS = 3;              // প্রতি রাউন্ডে ৩ কলাম
const ROWS = 2;                 // ২ সারি → মোট ৬টি কার্ড (৩ জোড়া)
const CARDS_PER_ROUND = COLUMNS * ROWS;
const CARD_MARGIN = 8;
const CARD_SIZE = (width - 40 - CARD_MARGIN * COLUMNS * 2) / COLUMNS;

// ✅ পুরো ৫ রাউন্ডের জন্য যথেষ্ট ইমোজি পুল — প্রতি রাউন্ডে ভিন্ন ৩টি প্রতীক ব্যবহার হবে
const EMOJI_POOL: string[] = [
  '🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🥝',
  '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
];

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

// ✅ প্রতিটা রাউন্ডের জন্য আলাদা ডেক — round নাম্বার অনুযায়ী ভিন্ন ইমোজি সেট নেওয়া হয়
function buildRoundDeck(round: number): CardData[] {
  const pairsNeeded = CARDS_PER_ROUND / 2;
  const startIndex = ((round - 1) * pairsNeeded) % EMOJI_POOL.length;

  let symbols: string[] = [];
  for (let i = 0; i < pairsNeeded; i++) {
    symbols.push(EMOJI_POOL[(startIndex + i) % EMOJI_POOL.length]);
  }

  const doubled = symbols.concat(symbols);
  const deck: CardData[] = doubled.map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false,
  }));
  return shuffleArray(deck);
}

type MemoryMatchGameProps = {
  onWin?: (reward: number) => void;
  rewardAmount?: number;
  totalRounds?: number;
};

export default function MemoryMatchGame({
  onWin = () => {},
  rewardAmount = 5,
  totalRounds = 5,
}: MemoryMatchGameProps) {
  const [round, setRound] = useState(1);
  const [cards, setCards] = useState<CardData[]>(() => buildRoundDeck(1));
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const pairsPerRound = CARDS_PER_ROUND / 2;

  // ✅ একটা রাউন্ডের সব জোড়া মিলে গেলে এখানে ধরা হয়
  useEffect(() => {
    if (gameFinished) return;
    if (cards.length > 0 && matchedCount === pairsPerRound) {
      const timeoutId = setTimeout(() => {
        if (round < totalRounds) {
          // ✅ পরের রাউন্ডে যাওয়া — এখনো কোনো টাকা দেওয়া হচ্ছে না
          Alert.alert(
            `রাউন্ড ${round}/${totalRounds} সম্পন্ন! ✅`,
            'পরের রাউন্ড শুরু হচ্ছে...',
            [
              {
                text: 'ঠিক আছে',
                onPress: () => {
                  const nextRound = round + 1;
                  setRound(nextRound);
                  setCards(buildRoundDeck(nextRound));
                  setFlippedIndices([]);
                  setMatchedCount(0);
                  setIsLocked(false);
                },
              },
            ]
          );
        } else {
          // ✅ ৫টি রাউন্ডই শেষ — এখানে একবারই রিওয়ার্ড দেওয়া হচ্ছে,
          // এর বেশি কোনোভাবেই দেওয়া হবে না কারণ onWin শুধু এখানেই কল হয়
          setGameFinished(true);
          Alert.alert(
            'অভিনন্দন! 🎉',
            `আপনি সবগুলো (${totalRounds}) রাউন্ড সম্পন্ন করেছেন, মোট চাল: ${moves + 1}। আপনি ৳${rewardAmount} জিতেছেন।`,
            [
              {
                text: 'ঠিক আছে',
                onPress: () => onWin(rewardAmount),
              },
            ]
          );
        }
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
          setMatchedCount((c) => c + 1);
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
    setRound(1);
    setCards(buildRoundDeck(1));
    setFlippedIndices([]);
    setMoves(0);
    setMatchedCount(0);
    setIsLocked(false);
    setGameFinished(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>মেমরি ম্যাচ</Text>

      {/* ✅ রাউন্ড কাউন্টার — এখানেই "১/৫, ২/৫..." দেখানো হচ্ছে */}
      <Text style={styles.roundText}>রাউন্ড: {round}/{totalRounds}</Text>
      <Text style={styles.subtitle}>চাল সংখ্যা: {moves}</Text>

      {/* ✅ রাউন্ড প্রোগ্রেস ডট */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < round - 1 || (i === round - 1 && gameFinished)
                ? styles.dotDone
                : i === round - 1
                ? styles.dotActive
                : styles.dotPending,
            ]}
          />
        ))}
      </View>

      {gameFinished ? (
        <View style={styles.finishedBox}>
          <Text style={styles.finishedText}>🎉 সব রাউন্ড সম্পন্ন! ৳{rewardAmount} জেতা হয়েছে।</Text>
        </View>
      ) : (
        <View style={styles.board}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={`${round}-${card.id}`}
              style={[
                styles.card,
                card.isFlipped || card.isMatched
                  ? styles.cardFlipped
                  : styles.cardHidden,
              ]}
              onPress={() => handleCardPress(index)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardText}>
                {card.isFlipped || card.isMatched ? card.symbol : '?'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!gameFinished && (
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>প্রথম থেকে শুরু করুন</Text>
        </TouchableOpacity>
      )}
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
    fontSize: 16,
    fontWeight: '700',
    color: '#00e5ff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9aa0c7',
    marginBottom: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotDone: { backgroundColor: '#00e676' },
  dotActive: { backgroundColor: '#00e5ff' },
  dotPending: { backgroundColor: '#2a2c50' },
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
  finishedBox: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
  },
  finishedText: {
    color: '#00e676',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 26,
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