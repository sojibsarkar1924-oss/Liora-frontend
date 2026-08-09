/**
 * components/ui/games/VideoTask.tsx
 * "ভিডিও দেখুন" ফিচারের আসল কোড।
 *
 * সততার সাথে একটা নোট: আসল ভিডিও (YouTube/আপনার নিজের হোস্ট করা
 * ভিডিও ফাইল) প্লে করানোর জন্য আপনাকে পরে expo-av বা
 * react-native-youtube-iframe বসাতে হবে এবং ভিডিও URL দিতে হবে।
 * আপাতত এখানে একটা কাউন্টডাউন-টাইমার ভিত্তিক "দেখা সম্পন্ন" ফ্লো
 * বানানো হয়েছে (নির্দিষ্ট সময় অপেক্ষা করলে "সংগ্রহ করুন" বাটন
 * সক্রিয় হয়) — যাতে ফিচারটা এখনই কাজ করে, পরে আসল ভিডিও যোগ
 * করলে শুধু মাঝের placeholder অংশটা বদলাতে হবে।
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TOTAL_VIDEOS = 3; // ৩টা ভিডিও দেখতে হবে
const WATCH_SECONDS = 15; // প্রতিটা ভিডিওর জন্য কাউন্টডাউন সময়

type VideoTaskProps = {
  onWin?: (reward: number) => void;
  rewardAmount?: number;
};

export default function VideoTask({
  onWin = () => {},
  rewardAmount = 9,
}: VideoTaskProps) {
  const [watchedCount, setWatchedCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS);
  const [isWatching, setIsWatching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startWatching = () => {
    setIsWatching(true);
    setSecondsLeft(WATCH_SECONDS);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const claimVideo = () => {
    const newWatchedCount = watchedCount + 1;
    setWatchedCount(newWatchedCount);
    setIsWatching(false);
    setSecondsLeft(WATCH_SECONDS);

    if (newWatchedCount >= TOTAL_VIDEOS) {
      Alert.alert(
        'অভিনন্দন! 🎉',
        `আপনি ${TOTAL_VIDEOS}টি ভিডিও দেখেছেন।`,
        [
          {
            text: 'ঠিক আছে',
            onPress: () => {
              onWin(rewardAmount);
              resetTask();
            },
          },
        ]
      );
    }
  };

  const resetTask = () => {
    setWatchedCount(0);
    setIsWatching(false);
    setSecondsLeft(WATCH_SECONDS);
  };

  const isDone = secondsLeft === 0 && isWatching;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ভিডিও দেখুন</Text>
      <Text style={styles.subtitle}>
        দেখা হয়েছে: {watchedCount} / {TOTAL_VIDEOS}
      </Text>

      {/* ভিডিও প্লেসহোল্ডার এরিয়া — পরে এখানে আসল Video কম্পোনেন্ট বসবে */}
      <View style={styles.videoBox}>
        {!isWatching ? (
          <TouchableOpacity onPress={startWatching} style={styles.playButton}>
            <Ionicons name="play-circle" size={64} color="#ff4d8d" />
            <Text style={styles.playText}>ভিডিও শুরু করতে চাপুন</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.watchingBox}>
            <Ionicons
              name={isDone ? 'checkmark-circle' : 'time-outline'}
              size={48}
              color={isDone ? '#00e676' : '#ff4d8d'}
            />
            <Text style={styles.countdownText}>
              {isDone ? 'সম্পন্ন!' : `${secondsLeft} সেকেন্ড বাকি`}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.claimButton, !isDone && styles.claimButtonDisabled]}
        onPress={claimVideo}
        disabled={!isDone}
      >
        <Text style={styles.claimButtonText}>
          {isDone ? 'রিওয়ার্ড সংগ্রহ করুন' : 'ভিডিও দেখুন প্রথমে'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 24,
    backgroundColor: '#0b0b18',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#9aa0c7', marginBottom: 24 },
  videoBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ff4d8d',
    backgroundColor: '#12132a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  playButton: { alignItems: 'center' },
  playText: { color: '#cfd3ff', marginTop: 10, fontSize: 13 },
  watchingBox: { alignItems: 'center' },
  countdownText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  claimButton: {
    backgroundColor: '#ff4d8d',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  claimButtonDisabled: { backgroundColor: '#3d2b3a' },
  claimButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});