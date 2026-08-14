/**
 * app/refer.tsx
 * "বন্ধুদের রেফার করুন" — এখনো placeholder ছিল, এখন আসল কনটেন্ট।
 *
 * নোট: এখানে রেফার কোড ডিভাইসেই জেনারেট/সংরক্ষণ হচ্ছে (demo হিসেবে)।
 * বাস্তব অ্যাপে এটা ইউজার সাইনআপের সময় ব্যাকএন্ড থেকে আসা উচিত
 * (আপনার profile.tsx এ যেমন ID/Referral কোড দেখিয়েছেন, ঠিক সেখান
 * থেকেই এই পেজেও একই কোড আনতে পারবেন — পরে backend যুক্ত করলে বলবেন)।
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
  const [referralCount] = useState(0); // ব্যাকএন্ড যুক্ত হলে এখানে আসল সংখ্যা আসবে

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

  const shareCode = async () => {
    try {
      await Share.share({
        message: `আমার রেফার কোড দিয়ে "আমার আয়" অ্যাপে যোগ দিন এবং টাকা আয় করুন: ${referCode}`,
      });
    } catch {
      Alert.alert('শেয়ার করা যায়নি', 'আবার চেষ্টা করুন।');
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

        <TouchableOpacity style={styles.shareButton} onPress={shareCode}>
          <Ionicons name="share-social-outline" size={20} color="#0b0b18" />
          <Text style={styles.shareButtonText}>বন্ধুদের সাথে শেয়ার করুন</Text>
        </TouchableOpacity>

        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            নিজের রেফার কোড দিয়ে বন্ধু নতুন অ্যাকাউন্ট খুললে আপনার লেভেল বাড়বে
            এবং প্রতি লেভেলে ৳১০ বোনাস পাবেন!
          </Text>
        </View>
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
  content: { flex: 1, alignItems: 'center', paddingTop: 30, paddingHorizontal: 24 },
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
    marginTop: 30,
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffb300',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    marginTop: 24,
  },
  shareButtonText: { color: '#0b0b18', fontWeight: 'bold', fontSize: 15 },
  infoBanner: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#3d4a8f',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#12132a',
  },
  infoText: { color: '#9aa0c7', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});