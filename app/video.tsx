/**
 * app/video.tsx
 *
 * এটা Gemini-এর দেওয়া UI ডিজাইন (৩টা আলাদা এড কার্ড, ফুলস্ক্রিন
 * মোডাল প্লেয়ার) রেখে, কিন্তু আমাদের আসল BalanceContext-এর সাথে
 * সঠিকভাবে সংযুক্ত করে ঠিক করা হয়েছে।
 *
 * যা বদলানো হয়েছে:
 * 1) useBalance() থেকে এখন সঠিক ফাংশন ব্যবহার হচ্ছে
 *    (addTaskEarning, isTaskDoneToday) — আগের addEarnings/
 *    dailyVideoCount/setDailyVideoCount আমাদের context-এ নেই বলে
 *    কাজ করছিল না।
 * 2) দৈনিক সীমা এখন BalanceContext-এর মাধ্যমেই ট্র্যাক হয় (একই
 *    জায়গা থেকে মেমরি/ক্যাপচা/অড-ওয়ান-আউটও ট্র্যাক হয়) — আলাদা
 *    কোনো duplicate সিস্টেম নেই।
 * 3) ৩টা ভিডিও শেষ হওয়ার "অগ্রগতি" (progress) স্থানীয়ভাবে
 *    AsyncStorage-এ থাকে (শুধু UI-এর জন্য, টাকার হিসাব না),
 *    কিন্তু আসল ৳৯ টাকা শুধু ৩টা ভিডিও শেষ হলে *একবারে*
 *    addTaskEarning('video', 9) দিয়ে যোগ হয় — এতে দৈনিক ৳২৭
 *    সীমার হিসাব ঠিক থাকে (Gemini-এর ভার্সনে প্রতি ভিডিওতে ৳৩
 *    করে আলাদাভাবে যোগ হতো, যেটা আমাদের capping সিস্টেমের সাথে
 *    মেলে না)।
 * 4) selfAlign টাইপো ঠিক করে alignSelf করা হয়েছে।
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useBalance } from '../context/BalanceContext';

const { width } = Dimensions.get('window');

const AD_DATABASE = [
  { id: 1, title: 'স্পন্সরড এড ১: টেকনোলজি ও স্মার্ট ডিভাইস', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: 2, title: 'স্পন্সরড এড ২: ডিজিটাল গ্যাজেট অফার', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: 3, title: 'স্পন্সরড এড ৩: গেমিং এক্সপেরিয়েন্স অ্যাপ', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
  { id: 4, title: 'স্পন্সরড এড ৪: ট্রাভেল ও লাইফস্টাইল প্রমো', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { id: 5, title: 'স্পন্সরড এড ৫: প্রিমিয়াম সাউন্ড সিস্টেম', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
  { id: 6, title: 'স্পন্সরড এড ৬: অনলাইন শপিং স্পেশাল', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' },
];

const PROGRESS_KEY = '@video_watch_progress'; // শুধু "কতটা দেখা হয়েছে" — টাকার হিসাব না

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function getTodaysAds(): typeof AD_DATABASE {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const startIndex = (dayOfYear * 3) % AD_DATABASE.length;
  return [
    AD_DATABASE[startIndex % AD_DATABASE.length],
    AD_DATABASE[(startIndex + 1) % AD_DATABASE.length],
    AD_DATABASE[(startIndex + 2) % AD_DATABASE.length],
  ];
}

export default function VideoScreen() {
  const router = useRouter();
  const { addTaskEarning, isTaskDoneToday } = useBalance();

  const alreadyEarnedToday = isTaskDoneToday('video');

  const [dailyAds] = useState(() => getTodaysAds());
  const [watchedProgress, setWatchedProgress] = useState(0); // ০-৩, শুধু UI progress
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoFinished, setVideoFinished] = useState(false);
  const videoRef = useRef<Video>(null);

  // আজকের progress লোড করা (নতুন দিন হলে রিসেট)
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PROGRESS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.date === getTodayString()) {
            setWatchedProgress(parsed.count);
          }
        }
      } catch (e) {
        console.warn('progress লোড করতে সমস্যা', e);
      }
    })();
  }, []);

  const persistProgress = async (count: number) => {
    setWatchedProgress(count);
    await AsyncStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ date: getTodayString(), count })
    );
  };

  const startWatchingAd = (index: number) => {
    if (alreadyEarnedToday) {
      Alert.alert('আজকের জন্য শেষ', 'আজ ইতিমধ্যে ভিডিও থেকে আয় করেছেন। কাল আবার আসুন।');
      return;
    }
    if (index !== watchedProgress) return; // শুধু পরের ভিডিওই খোলা যাবে
    setCurrentAdIndex(index);
    setVideoFinished(false);
    setLoading(true);
    setModalVisible(true);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish && !videoFinished) {
      setVideoFinished(true);
      handleVideoCompleted();
    }
  };

  const handleVideoCompleted = async () => {
    const newProgress = watchedProgress + 1;
    await persistProgress(newProgress);

    if (newProgress >= 3) {
      // ৩টাই শেষ — এখন আসল ৳৯ টাকা একবারে যোগ হবে
      const success = await addTaskEarning('video', 9);
      if (success) {
        Alert.alert('🎉 অভিনন্দন!', 'আপনি ৩টি ভিডিও দেখে ৳৯ টাকা পেয়েছেন। ব্যালেন্সে যোগ হয়েছে।');
      } else {
        // এটা ঘটার কথা না (isTaskDoneToday আগেই চেক করা), তবু safety
        Alert.alert('দুঃখিত', 'আজকের জন্য এই আয় ইতিমধ্যে নেওয়া হয়ে গেছে।');
      }
      setModalVisible(false);
      router.back();
    } else {
      Alert.alert('চমৎকার!', `${newProgress}/৩ ভিডিও শেষ। বাকি ${3 - newProgress}টা দেখলে ৳৯ পাবেন।`);
    }
  };

  const closeModal = () => {
    if (!videoFinished) {
      Alert.alert(
        'সতর্কতা',
        'বিজ্ঞাপনটি পুরো না দেখলে অগ্রগতি গণনা হবে না। আপনি কি নিশ্চিত যে বের হতে চান?',
        [
          { text: 'থাকুন', style: 'cancel' },
          { text: 'বের হন', style: 'destructive', onPress: () => setModalVisible(false) },
        ]
      );
    } else {
      setModalVisible(false);
    }
  };

  if (alreadyEarnedToday) {
    return (
      <View style={[styles.container, styles.doneContainer]}>
        <Ionicons name="checkmark-circle" size={64} color="#00e676" />
        <Text style={styles.doneTitle}>আজকের জন্য সম্পন্ন!</Text>
        <Text style={styles.doneSubtitle}>
          আপনি আজ ইতিমধ্যে ৳৯ আয় করেছেন ভিডিও দেখে। কাল নতুন ৩টা ভিডিও আসবে।
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>📺 ভিডিও দেখে আয় করুন</Text>
      <Text style={styles.subtitle}>৩টি ভিডিও সম্পূর্ণ দেখলে পাবেন ৳৯ টাকা</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>আজকে সম্পন্ন: {watchedProgress} / ৩টি এড</Text>
        <Text style={styles.earnedText}>
          {watchedProgress >= 3 ? '৳৯ পাওয়া হয়েছে' : `আরও ${3 - watchedProgress}টি বাকি`}
        </Text>
      </View>

      {dailyAds.map((ad, index) => {
        const isCompleted = index < watchedProgress;
        const isCurrent = index === watchedProgress;

        return (
          <TouchableOpacity
            key={ad.id}
            style={[
              styles.adCard,
              isCompleted && styles.adCompleted,
              !isCurrent && !isCompleted && styles.adDisabled,
            ]}
            disabled={!isCurrent}
            onPress={() => startWatchingAd(index)}
          >
            <View style={styles.adInfo}>
              <View style={styles.adBadge}>
                <Text style={styles.adBadgeText}>Sponsored Ad #{index + 1}</Text>
              </View>
              <Text style={styles.adTitle}>{ad.title}</Text>
              <Text style={styles.rewardText}>🎁 অংশ: ৩ ভিডিওর মধ্যে ১টি</Text>
            </View>

            <View style={styles.buttonBadge}>
              <Text style={styles.buttonText}>
                {isCompleted ? '✓ সম্পন্ন' : isCurrent ? 'বিজ্ঞাপন দেখুন' : 'লক করা'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.adHeader}>
            <View style={styles.sponsoredTag}>
              <Text style={styles.sponsoredText}>📢 বিজ্ঞাপন (Sponsored)</Text>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕ বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#00E676" />
              <Text style={styles.loadingText}>বিজ্ঞাপন লোড হচ্ছে...</Text>
            </View>
          )}

          {dailyAds[currentAdIndex] && (
            <Video
              ref={videoRef}
              source={{ uri: dailyAds[currentAdIndex].url }}
              style={styles.videoPlayer}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              onLoad={() => setLoading(false)}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
          )}

          <View style={styles.adFooter}>
            <Text style={styles.adNotice}>
              {videoFinished
                ? '✅ বিজ্ঞাপন সম্পন্ন হয়েছে!'
                : '⚠️ পুরস্কার পেতে বিজ্ঞাপনটি শেষ হওয়া পর্যন্ত অপেক্ষা করুন।'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  doneContainer: { alignItems: 'center', justifyContent: 'center' },
  doneTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  doneSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 8, textAlign: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 20, marginTop: 4 },
  statusCard: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusText: { color: '#e2e8f0', fontWeight: '600' },
  earnedText: { color: '#00E676', fontWeight: 'bold' },
  adCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  adCompleted: { opacity: 0.6, borderLeftColor: '#10b981' },
  adDisabled: { opacity: 0.4, borderLeftColor: '#64748b' },
  adInfo: { flex: 1 },
  adBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start', // ফিক্স: আগে ভুল করে selfAlign লেখা ছিল
    marginBottom: 6,
  },
  adBadgeText: { color: '#60a5fa', fontSize: 11, fontWeight: 'bold' },
  adTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  rewardText: { color: '#00E676', fontSize: 13, fontWeight: 'bold' },
  buttonBadge: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between' },
  adHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sponsoredTag: { backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  sponsoredText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  closeBtn: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  closeBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  videoPlayer: { width: width, height: width * 0.75, alignSelf: 'center' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 10,
  },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 14 },
  adFooter: { padding: 25, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center' },
  adNotice: { color: '#fff', textAlign: 'center', fontSize: 14, fontWeight: '500' },
});