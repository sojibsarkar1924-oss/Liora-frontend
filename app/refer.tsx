/**
 * app/refer.tsx
 * আপডেট:
 * 1) "আমার আয়" বদলে "WinWay" করা হয়েছে।
 * 2) অকার্যকর ডোমেইনের জায়গায় আসল APK ডাউনলোড লিংক বসানো হয়েছে।
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const REFER_CODE_KEY = 'liora_refer_code_v1';
const REFERRAL_BONUS = 50;
const LEVEL_UP_BONUS = 10;

// ✅ আপনার কাজ করা আসল APK ডাউনলোড লিংক (ভবিষ্যতে Bitly বা Play Store লিংক হলে এখানে বসাবেন)
const APP_DOWNLOAD_LINK = '';

function generateReferCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function ReferScreen() {
  const router = useRouter();
  const [referCode, setReferCode] = useState('');
  const [referralCount] = useState(0);

  useEffect(() => {
    (async () => {
      let code = await AsyncStorage.getItem(REFER_CODE_KEY);
      if (!code) {
        code = generateReferCode();
        await AsyncStorage.setItem(REFER_CODE_KEY, code);
      }
      setReferCode(code);
    })();
  }, []);

  const copyCode = async () => {
    await Clipboard.setStringAsync(referCode);
    Alert.alert('কপি হয়েছে! ✅', referCode);
  };

  // ---------- চিঠির মতো আমন্ত্রণ বার্তা ----------
  const sendInvitationLetter = async () => {
    const letter =
      `প্রিয় বন্ধু,\n\n` +
      `আমি "WinWay" অ্যাপে আছি — এখানে গেম খেলে, ক্যাপচা পূরণ করে ` +
      `আর ভিডিও দেখে সহজেই টাকা আয় করা যায়। তুমিও চাইলে আমার সাথে ` +
      `যোগ দিতে পারো!\n\n` +
      `👉 আমার রেফার কোড: ${referCode}\n\n` +
      `অ্যাপ ইনস্টল করার পর সাইনআপের সময় এই কোডটা বসিয়ে দিও — ` +
      `তাহলে আমরা দুজনেই বোনাস পাব।\n\n` +
      `আশা করি তুমিও উপভোগ করবে!\n— তোমার বন্ধু`;

    try {
      await Share.share({ message: letter });
    } catch {
      Alert.alert('পাঠানো যায়নি', 'আবার চেষ্টা করুন।');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>বন্ধুদের রেফার করুন</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Ionicons name="gift" size={56} color="#ffb300" style={{ marginBottom: 16 }} />

        {/* ---------- বোনাস হাইলাইট ---------- */}
        <View style={styles.bonusHighlightBox}>
          <Text style={styles.bonusHighlightAmount}>৳{REFERRAL_BONUS}</Text>
          <Text style={styles.bonusHighlightLabel}>প্রতি বন্ধু জয়েন করলেই বোনাস!</Text>
          <Text style={styles.bonusHighlightSub}>
            + লেভেল বাড়বে + প্রতি লেভেলে আরও ৳{LEVEL_UP_BONUS}
          </Text>
        </View>

        <Text style={styles.title}>আপনার রেফার কোড</Text>
        <TouchableOpacity style={styles.codeBox} onPress={copyCode} activeOpacity={0.7}>
          <Text style={styles.codeText}>{referCode || '...'}</Text>
          <Ionicons name="copy-outline" size={20} color="#00e5ff" />
        </TouchableOpacity>
        <Text style={styles.hint}>কোডে চাপ দিলে কপি হয়ে যাবে</Text>

        <View style={styles.statBox}>
          <Ionicons name="people-outline" size={22} color="#c026d3" />
          <Text style={styles.statText}>
            মোট রেফার করেছেন: <Text style={styles.statNumber}>{referralCount}</Text> জন
          </Text>
        </View>

        {/* ---------- চিঠির মতো আমন্ত্রণ পাঠানোর বাটন ---------- */}
        <TouchableOpacity style={styles.letterButton} onPress={sendInvitationLetter}>
          <Ionicons name="mail-outline" size={22} color="#0b0b18" />
          <Text style={styles.letterButtonText}>বন্ধুকে আমন্ত্রণ জানান 💌</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={sendInvitationLetter}>
          <Ionicons name="share-social-outline" size={18} color="#cfd3ff" />
          <Text style={styles.shareButtonText}>অথবা যেকোনো অ্যাপে শেয়ার করুন</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b0b18' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, alignItems: 'center', paddingTop: 20, paddingHorizontal: 24 },

  bonusHighlightBox: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00e676',
    backgroundColor: '#0f2e1e',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 30,
    marginBottom: 24,
    width: '100%',
  },
  bonusHighlightAmount: { color: '#00e676', fontSize: 34, fontWeight: 'bold' },
  bonusHighlightLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  bonusHighlightSub: { color: '#9aa0c7', fontSize: 11, marginTop: 4, textAlign: 'center' },

  title: { color: '#fff', fontSize: 16, marginBottom: 12 },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#00e5ff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 30,
    backgroundColor: '#12132a',
  },
  codeText: { color: '#00e5ff', fontSize: 26, fontWeight: 'bold', letterSpacing: 4 },
  hint: { color: '#5a5f8a', fontSize: 12, marginTop: 8 },

  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    backgroundColor: '#12132a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2a2f5c',
    width: '100%',
  },
  statText: { color: '#cfd3ff', fontSize: 14 },
  statNumber: { color: '#c026d3', fontWeight: 'bold' },

  letterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffb300',
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    marginTop: 24,
  },
  letterButtonText: { color: '#0b0b18', fontWeight: 'bold', fontSize: 15 },

  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
  },
  shareButtonText: { color: '#cfd3ff', fontSize: 12 },
});