/**
 * components/ui/games/VideoTask.tsx
 * আসল ভিডিও প্লেব্যাক — expo-av দিয়ে।
 *
 * ইনস্টল করতে হবে (যদি আগে থেকে না থাকে):
 *   npx expo install expo-av
 *
 * প্রতিদিন ৩টা ভিডিও (তারিখ অনুযায়ী বাছাই, তাই প্রতিদিন ভিন্ন),
 * প্রতিটা সম্পূর্ণ দেখলে (স্কিপ না করে) পরের ভিডিও আনলক হয়।
 * ৩টা শেষ করলে রিওয়ার্ড।
 *
 * নোট: এখানে Google-এর পাবলিক sample video (Creative Commons
 * লাইসেন্সের Big Buck Bunny, Elephants Dream ইত্যাদি — টেস্টিং-এর
 * জন্য industry-standard placeholder) ব্যবহার করা হয়েছে। পরে
 * আপনার নিজের হোস্ট করা/বিজ্ঞাপনদাতার ভিডিও URL দিয়ে VIDEO_POOL
 * অ্যারেটা বদলে দেবেন।
 */

import { Ionicons } from '@expo/vector-icons';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TOTAL_VIDEOS = 3;

const VIDEO_POOL = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
];

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getTodaysVideos(): string[] {
  const dayIndex = new Date().getDate();
  const rand = mulberry32(dayIndex + 2000);
  const shuffled = [...VIDEO_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, TOTAL_VIDEOS);
}

type VideoTaskProps = {
  onWin?: (reward: number) => void;
  rewardAmount?: number;
};

export default function VideoTask({
  onWin = () => {},
  rewardAmount = 9,
}: VideoTaskProps) {
  const [todaysVideos] = useState<string[]>(() => getTodaysVideos());
  const [watchedCount, setWatchedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFinishedCurrent, setHasFinishedCurrent] = useState(false);
  const videoRef = useRef<Video>(null);

  const currentVideoUri = todaysVideos[watchedCount];
  const allDone = watchedCount >= TOTAL_VIDEOS;

  const handleStart = async () => {
    setIsPlaying(true);
    setHasFinishedCurrent(false);
    await videoRef.current?.playAsync();
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      setHasFinishedCurrent(true);
      setIsPlaying(false);
    }
  };

  const handleClaimVideo = () => {
    const newCount = watchedCount + 1;
    setWatchedCount(newCount);
    setIsPlaying(false);
    setHasFinishedCurrent(false);

    if (newCount >= TOTAL_VIDEOS) {
      Alert.alert('অভিনন্দন! 🎉', `আপনি ${TOTAL_VIDEOS}টি ভিডিও দেখেছেন।`, [
        {
          text: 'ঠিক আছে',
          onPress: () => onWin(rewardAmount),
        },
      ]);
    }
  };

  if (allDone) {
    return (
      <View style={styles.container}>
        <Ionicons name="checkmark-circle" size={64} color="#00e676" />
        <Text style={styles.doneText}>আজকের ৩টি ভিডিওই দেখা শেষ!</Text>
        <Text style={styles.doneSubtext}>আগামীকাল আবার নতুন ভিডিও আসবে।</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ভিডিও দেখুন</Text>
      <Text style={styles.subtitle}>
        দেখা হয়েছে: {watchedCount} / {TOTAL_VIDEOS}
      </Text>

      <View style={styles.videoBox}>
        <Video
          ref={videoRef}
          source={{ uri: currentVideoUri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={isPlaying}
        />
        {!isPlaying && !hasFinishedCurrent && (
          <TouchableOpacity style={styles.playOverlay} onPress={handleStart}>
            <Ionicons name="play-circle" size={64} color="#ff4d8d" />
            <Text style={styles.playText}>ভিডিও শুরু করতে চাপুন</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.claimButton, !hasFinishedCurrent && styles.claimButtonDisabled]}
        onPress={handleClaimVideo}
        disabled={!hasFinishedCurrent}
      >
        <Text style={styles.claimButtonText}>
          {hasFinishedCurrent ? 'রিওয়ার্ড সংগ্রহ করুন' : 'ভিডিও সম্পূর্ণ দেখুন প্রথমে'}
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
    backgroundColor: '#000',
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  video: { width: '100%', height: '100%' },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playText: { color: '#fff', marginTop: 10, fontSize: 13 },
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
  doneText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  doneSubtext: { color: '#9aa0c7', fontSize: 13, marginTop: 6 },
});