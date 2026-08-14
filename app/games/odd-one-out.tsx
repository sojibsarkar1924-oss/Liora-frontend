/**
 * app/games/odd-one-out.tsx
 * "অড ওয়ান আউট" গেমের রুট — এখন জিতলে আসল ব্যালেন্সে টাকা যোগ হয়।
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OddOneOutGame from '../../components/ui/games/OddOneOutGame';
import { useBalance } from '../../context/BalanceContext';

export default function OddOneOutScreen() {
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
        <Text style={styles.headerTitle}>অড ওয়ান আউট</Text>
        <View style={{ width: 40 }} />
      </View>

      <OddOneOutGame rewardAmount={5} onWin={handleWin} />
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