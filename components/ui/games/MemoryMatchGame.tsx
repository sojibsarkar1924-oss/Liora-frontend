/**
 * components/games/MemoryMatchGame.tsx
 * সহজ মেমরি ম্যাচ (কার্ড মেলানো) গেম — Expo/React Native
 *
 * ব্যবহার (game.tsx বা যেই স্ক্রিন থেকে গেম চালাবেন):
 *   import MemoryMatchGame from '../components/games/MemoryMatchGame';
 *   <MemoryMatchGame
 *     rewardAmount={5}
 *     onWin={(reward) => { /* এখানে ব্যালেন্স আপডেট করুন *\/ }}
 *   />
 *
 * প্রতিদিন আলাদা কার্ড সেট দেখাতে EMOJI_SETS থেকে তারিখ অনুযায়ী
 * ভিন্ন সেট স্বয়ংক্রিয়ভাবে বাছাই করা হয় (getTodaysEmojiSet ফাংশন)।
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
const BOARD_SIZE = 4; // 4x4 = 16 কার্ড (৮ জোড়া)
const CARD_MARGIN = 6;
const CARD_SIZE = (width - 40 - CARD_MARGIN * BOARD_SIZE * 2) / BOARD_SIZE;

// একাধিক ইমোজি সেট — প্রতিদিন ভিন্ন সেট দেখাতে ব্যবহার করা হয়
const EMOJI_SETS: string[][] = [
  ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🥝'],
  ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨'],
  ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱'],
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
  const emojis = getTodaysEmojiSet();
  const doubled = emojis.concat(emojis);
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
};

export default function MemoryMatchGame({
  onWin = () => {},
  rewardAmount = 5,
}: MemoryMatchGameProps) {
  const [cards, setCards] = useState<CardData[]>(buildDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    if (cards.length > 0 && matchedCount === cards.length / 2) {
      const timeoutId = setTimeout(() => {
        Alert.alert('অভিনন্দন! 🎉', `আপনি ${moves} চালে গেমটি জিতেছেন।`, [
          {
            text: 'ঠিক আছে',
            onPress: () => onWin(rewardAmount),
          },
        ]);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [matchedCount]);

  const handleCardPress = (index: number) => {
    if (isLocked) return;
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
    setCards(buildDeck());
    setFlippedIndices([]);
    setMoves(0);
    setMatchedCount(0);
    setIsLocked(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>মেমরি ম্যাচ</Text>
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