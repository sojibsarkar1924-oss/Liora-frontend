import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AVPlaybackStatus, Audio, ResizeMode, Video } from 'expo-av';
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

// বিশ্বস্ত ও দ্রুত স্ট্রিম হয় এমন টেস্ট ভিডিও ইউআরএলসমূহ
const SAMPLE_VIDEOS = [
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
];

// ৭৫টি ভিডিও বিজ্ঞাপন (২৫ দিনের চক্র)
const AD_DATABASE = [
  { id: 1, title: 'স্মার্টফোন বিশেষ ক্যাশব্যাক অফার', url: SAMPLE_VIDEOS[0] },
  { id: 2, title: 'অনলাইন শপিং স্পেশাল মেগা সেল', url: SAMPLE_VIDEOS[1] },
  { id: 3, title: 'নতুন গেমিং অ্যাপ ডাউনলোড ডিল', url: SAMPLE_VIDEOS[2] },
  { id: 4, title: 'বেস্ট ট্রাভেল ও হোটেল বুকিং ডিসকাউন্ট', url: SAMPLE_VIDEOS[3] },
  { id: 5, title: 'প্রিমিয়াম সাউন্ড বার ও হেডফোন প্রমো', url: SAMPLE_VIDEOS[0] },
  { id: 6, title: 'ডিজিটাল স্কিল ডেভেলপমেন্ট কোর্স', url: SAMPLE_VIDEOS[1] },
  { id: 7, title: 'স্মার্টওয়াচ ও ফিটনেস ট্র্যাকার অফার', url: SAMPLE_VIDEOS[2] },
  { id: 8, title: 'অনলাইন ফুড ডেলিভারি ফ্রি ভাউচার', url: SAMPLE_VIDEOS[3] },
  { id: 9, title: 'ফ্যাশন ও ক্লোথিং ব্র্যান্ড ক্লিয়ারেন্স সেল', url: SAMPLE_VIDEOS[0] },
  { id: 10, title: 'হোম অ্যাপ্লায়েন্স ডিসকাউন্ট সপ্তাহ', url: SAMPLE_VIDEOS[1] },
  { id: 11, title: 'অনলাইন গ্রোসারি শপিং ক্যাশব্যাক', url: SAMPLE_VIDEOS[2] },
  { id: 12, title: 'বেস্ট মোবাইল রিচার্জ বোনাস অফার', url: SAMPLE_VIDEOS[3] },
  { id: 13, title: 'নতুন ল্যাপটপ ও কম্পিউটার এক্সেসরিজ', url: SAMPLE_VIDEOS[0] },
  { id: 14, title: 'বিউটি ও স্কিনকেয়ার স্পেশাল কম্বো', url: SAMPLE_VIDEOS[1] },
  { id: 15, title: 'ইংরেজি শেখার অনলাইন কোর্স প্রমো', url: SAMPLE_VIDEOS[2] },
  { id: 16, title: 'কার ও বাইক এক্সেসরিজ ডিল', url: SAMPLE_VIDEOS[3] },
  { id: 17, title: 'স্মার্ট টিভি ও হোম থিয়েটার সেল', url: SAMPLE_VIDEOS[0] },
  { id: 18, title: 'অনলাইন টিকিটিং ও বাস বুকিং অফার', url: SAMPLE_VIDEOS[1] },
  { id: 19, title: 'প্রিমিয়াম অনলাইন স্ট্রিমিং অ্যাপ', url: SAMPLE_VIDEOS[2] },
  { id: 20, title: 'স্পোর্টস শু ও এথলেটিক ওয়্যার সেল', url: SAMPLE_VIDEOS[3] },
  { id: 21, title: 'ডিজিটাল ওয়ালেট ক্যাশব্যাক ফেস্ট', url: SAMPLE_VIDEOS[0] },
  { id: 22, title: 'কিডস লার্নিং ও গেমস অ্যাপ প্রমো', url: SAMPLE_VIDEOS[1] },
  { id: 23, title: 'ফার্নিচার ও হোম ডেকোর ডিসকাউন্ট', url: SAMPLE_VIDEOS[2] },
  { id: 24, title: 'হেলথ ও ওয়েলনেস ইনস্যুরেন্স প্ল্যান', url: SAMPLE_VIDEOS[3] },
  { id: 25, title: 'অনলাইন ফ্রিল্যান্সিং গাইডলাইন', url: SAMPLE_VIDEOS[0] },
  { id: 26, title: 'ইন্টারনেট প্যাকেজ স্পেশাল অফার', url: SAMPLE_VIDEOS[1] },
  { id: 27, title: 'গেমিং ল্যাপটপ বিশেষ ছাড়', url: SAMPLE_VIDEOS[2] },
  { id: 28, title: 'বেস্ট রেস্তোরাঁ বুফে ডিল', url: SAMPLE_VIDEOS[3] },
  { id: 29, title: 'উইন্টার কালেকশন সুপার সেল', url: SAMPLE_VIDEOS[0] },
  { id: 30, title: 'এয়ার কন্ডিশনার ও কুলার অফার', url: SAMPLE_VIDEOS[1] },
  { id: 31, title: 'অনলাইন বুকস্টোর ডিসকাউন্ট', url: SAMPLE_VIDEOS[2] },
  { id: 32, title: 'স্মার্ট কিচেন অ্যাপ্লায়েন্স কম্বো', url: SAMPLE_VIDEOS[3] },
  { id: 33, title: 'পার্সোনাল কেয়ার প্রডাক্ট ডিল', url: SAMPLE_VIDEOS[0] },
  { id: 34, title: 'অনলাইন ডাক্তার কনসাল্টেশন অ্যাপ', url: SAMPLE_VIDEOS[1] },
  { id: 35, title: 'ক্যামেরা ও ফটোগ্রাফি গিয়ার', url: SAMPLE_VIDEOS[2] },
  { id: 36, title: 'রিয়েল এস্টেট অ্যাপার্টমেন্ট প্রমো', url: SAMPLE_VIDEOS[3] },
  { id: 37, title: 'স্মার্ট হোম সিকিউরিটি ক্যামেরা', url: SAMPLE_VIDEOS[0] },
  { id: 38, title: 'বেবি কেয়ার প্রোডাক্ট ডিসকাউন্ট', url: SAMPLE_VIDEOS[1] },
  { id: 39, title: 'অনলাইন প্রোগ্রামিং বুটক্যাম্প', url: SAMPLE_VIDEOS[2] },
  { id: 40, title: 'লাক্সারি ওয়াচ কালেকশন ডিল', url: SAMPLE_VIDEOS[3] },
  { id: 41, title: 'স্মার্ট ব্যান্ড ও ট্র্যাকার অফার', url: SAMPLE_VIDEOS[0] },
  { id: 42, title: 'জিম ও ফিটনেস মেম্বারশিপ স্পেশাল', url: SAMPLE_VIDEOS[1] },
  { id: 43, title: 'অনলাইন গ্রাফিক ডিজাইন কোর্স', url: SAMPLE_VIDEOS[2] },
  { id: 44, title: 'সানগ্লাস ও আইওয়্যার অফার', url: SAMPLE_VIDEOS[3] },
  { id: 45, title: 'পাওয়ার ব্যাংক ও চার্জার সেল', url: SAMPLE_VIDEOS[0] },
  { id: 46, title: 'অনলাইন মিউজিক অ্যাপ সাবস্ক্রিপশন', url: SAMPLE_VIDEOS[1] },
  { id: 47, title: 'জুয়েলারি কালেকশন ডিসকাউন্ট', url: SAMPLE_VIDEOS[2] },
  { id: 48, title: 'স্মার্ট স্পিকার সার্ভিস প্রমো', url: SAMPLE_VIDEOS[3] },
  { id: 49, title: 'ই-বুক রিডার ও ডিলস', url: SAMPLE_VIDEOS[0] },
  { id: 50, title: 'অনলাইন পেপাল ও কার্ড অফার', url: SAMPLE_VIDEOS[1] },
  { id: 51, title: 'বাইক রাইড শেয়ারিং ডিসকাউন্ট', url: SAMPLE_VIDEOS[2] },
  { id: 52, title: 'ওয়েব হোস্ট ও ডোমেইন অফার', url: SAMPLE_VIDEOS[3] },
  { id: 53, title: 'ক্লাউড স্টোরেজ মেম্বারশিপ', url: SAMPLE_VIDEOS[0] },
  { id: 54, title: 'ডিজিটাল মার্কেটিং সলিউশন', url: SAMPLE_VIDEOS[1] },
  { id: 55, title: 'ইন্টারন্যাশনাল ট্যুর প্যাকেজ', url: SAMPLE_VIDEOS[2] },
  { id: 56, title: 'অনলাইন আইইএলটিএস প্রিপারেশন', url: SAMPLE_VIDEOS[3] },
  { id: 57, title: 'স্মার্ট ওয়াটার পিউরিফায়ার', url: SAMPLE_VIDEOS[0] },
  { id: 58, title: 'লেদার গুডস ও ওয়ালেট ডিল', url: SAMPLE_VIDEOS[1] },
  { id: 59, title: 'গেমিং চেয়ার ও ডেস্ক সেল', url: SAMPLE_VIDEOS[2] },
  { id: 60, title: 'অডিওবুক সাবস্ক্রিপশন অফার', url: SAMPLE_VIDEOS[3] },
  { id: 61, title: 'ড্রোন ও অ্যাকশন ক্যামেরা', url: SAMPLE_VIDEOS[0] },
  { id: 62, title: 'অনলাইন এসইও ও কন্টেন্ট কোর্স', url: SAMPLE_VIDEOS[1] },
  { id: 63, title: 'অর্গানিক ফুড প্রোডাক্টস সেল', url: SAMPLE_VIDEOS[2] },
  { id: 64, title: 'সোফা ও লবি ফার্নিচার', url: SAMPLE_VIDEOS[3] },
  { id: 65, title: 'অনলাইন টেক্সটবুক পারচেজ', url: SAMPLE_VIDEOS[0] },
  { id: 66, title: 'স্মার্ট লাইটিং সিষ্টেম অফার', url: SAMPLE_VIDEOS[1] },
  { id: 67, title: 'পেট ফুড ও এক্সেসরিজ ডিল', url: SAMPLE_VIDEOS[2] },
  { id: 68, title: 'ভিপিএন সার্ভিস সাবস্ক্রিপশন', url: SAMPLE_VIDEOS[3] },
  { id: 69, title: 'অনলাইন ম্যাথ ও সাইন্স টিউটরিয়াল', url: SAMPLE_VIDEOS[0] },
  { id: 70, title: 'সাইকেল ও রাইডিং গিয়ার অফার', url: SAMPLE_VIDEOS[1] },
  { id: 71, title: 'স্মার্ট ডোর লক সিষ্টেম প্রমো', url: SAMPLE_VIDEOS[2] },
  { id: 72, title: 'বিউটি পার্লার ই-ভাউচার', url: SAMPLE_VIDEOS[3] },
  { id: 73, title: 'ফটোগ্রাফি ওয়ার্কশপ রেজিস্টার', url: SAMPLE_VIDEOS[0] },
  { id: 74, title: 'কার ওয়াশ ও সার্ভিসিং ডিল', url: SAMPLE_VIDEOS[1] },
  { id: 75, title: 'প্রিমিয়াম অ্যাপ মেম্বারশিপ অফার', url: SAMPLE_VIDEOS[2] },
];

const PROGRESS_KEY = '@video_watch_progress';

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function getTodaysAds() {
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
  const [watchedProgress, setWatchedProgress] = useState(0);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    }).catch(() => {});

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
        console.warn('Progress load error', e);
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
      Alert.alert('আজকের জন্য শেষ', 'আজ ইতিমধ্যে ভিডিও থেকে আয় করেছেন। কাল নতুন ভিডিও আসবে।');
      return;
    }
    if (index !== watchedProgress) return;

    setCurrentAdIndex(index);
    setVideoFinished(false);
    setLoading(true);
    setModalVisible(true);

    // ৪ সেকেন্ডের মধ্যে ভিডিও রেসপন্স না করলে লোডার সরানোর ফলব্যাক
    setTimeout(() => {
      setLoading(false);
    }, 4000);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setLoading(false);
      }
      return;
    }

    if (status.isLoaded && loading) {
      setLoading(false);
    }

    if (status.didJustFinish && !videoFinished) {
      setVideoFinished(true);
      handleVideoCompleted();
    }
  };

  const handleVideoCompleted = async () => {
    const newProgress = watchedProgress + 1;
    await persistProgress(newProgress);

    if (newProgress >= 3) {
      const success = await addTaskEarning('video', 9);
      if (success) {
        Alert.alert('🎉 অভিনন্দন!', 'আপনি আজকের ৩টি ভিডিও দেখে ৳৯ টাকা পেয়েছেন।');
      } else {
        Alert.alert('দুঃখিত', 'আজকের আয় ইতিমধ্যে নেওয়া হয়ে গেছে।');
      }
      setModalVisible(false);
      router.back();
    } else {
      Alert.alert('চমৎকার!', `${newProgress}/৩টি এড দেখা শেষ। পরবর্তী এডটি দেখুন।`);
      setModalVisible(false);
    }
  };

  const closeModal = () => {
    if (!videoFinished) {
      Alert.alert(
        'সতর্কতা',
        'বিজ্ঞাপনটি পুরো না দেখলে আয় যোগ হবে না। বের হতে চান?',
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
        <Text style={styles.doneTitle}>আজকের ৩টি এড দেখা সম্পন্ন!</Text>
        <Text style={styles.doneSubtitle}>
          আপনি আজ ৳৯ পেয়েছেন। আগামীকাল নতুন ৩টি বিজ্ঞাপন আসবে।
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>📺 আজকের বিজ্ঞাপনসমূহ</Text>
      <Text style={styles.subtitle}>আজকের ৩টি আলাদা ভিডিও দেখলে পাবেন ৳৯ টাকা</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>আজকের অগ্রগতি: {watchedProgress} / ৩টি এড</Text>
        <Text style={styles.earnedText}>
          {watchedProgress >= 3 ? '৳৯ অর্জিত' : `বাকি ${3 - watchedProgress}টি`}
        </Text>
      </View>

      {dailyAds.map((ad, index) => {
        const isCompleted = index < watchedProgress;
        const isCurrent = index === watchedProgress;

        return (
          <TouchableOpacity
            key={`${ad.id}-${index}`}
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
                <Text style={styles.adBadgeText}>আজকের এড #{index + 1}</Text>
              </View>
              <Text style={styles.adTitle}>{ad.title}</Text>
              <Text style={styles.rewardText}>🎁 পুরস্কার: ৩ টাকা</Text>
            </View>

            <View style={styles.buttonBadge}>
              <Text style={styles.buttonText}>
                {isCompleted ? '✓ সম্পন্ন' : isCurrent ? 'প্লে করুন' : 'লক করা'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.adHeader}>
            <View style={styles.sponsoredTag}>
              <Text style={styles.sponsoredText}>📢 Sponsored Ad #{currentAdIndex + 1}</Text>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕ বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.videoWrapper}>
            {dailyAds[currentAdIndex] && (
              <Video
                ref={videoRef}
                source={{ uri: dailyAds[currentAdIndex].url }}
                style={styles.videoPlayer}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={true}
                useNativeControls={true}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              />
            )}
            {loading && (
              <View style={styles.loadingBox} pointerEvents="none">
                <ActivityIndicator size="large" color="#00E676" />
                <Text style={styles.loadingText}>বিজ্ঞাপন লোড হচ্ছে...</Text>
              </View>
            )}
          </View>

          <View style={styles.adFooter}>
            <Text style={styles.adNotice}>
              {videoFinished
                ? '✅ বিজ্ঞাপন সম্পন্ন হয়েছে!'
                : '⚠️ পুরস্কার পেতে সম্পূর্ণ ভিডিওটি দেখুন।'}
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
    alignSelf: 'flex-start',
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
  videoWrapper: { width: width, height: width * 0.75, justifyContent: 'center', alignSelf: 'center' },
  videoPlayer: { width: '100%', height: '100%' },
  loadingBox: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', zIndex: 10 },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 13 },
  adFooter: { padding: 25, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center' },
  adNotice: { color: '#fff', textAlign: 'center', fontSize: 14, fontWeight: '500' },
});