/**
 * app/captcha.tsx
 * "ক্যাপচা পূরণ করুন" রুট — এখন জিতলে আসল ব্যালেন্সে টাকা যোগ হয়।
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CaptchaTask from '../components/ui/games/CaptchaTask';
import { useBalance } from '../context/BalanceContext';

export default function CaptchaScreen() {
  const router = useRouter();
  const { addEarning } = useBalance();

  const handleWin = async (reward: number) => {
    await addEarning(reward);
    Alert.alert('অভিনন্দন!', `আপনি ৳${reward} জিতেছেন। ব্যালেন্সে যোগ হয়েছে।`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ক্যাপচা পূরণ করুন</Text>
        <View style={{ width: 40 }} />
      </View>

      <CaptchaTask rewardAmount={8} onWin={handleWin} />
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
});