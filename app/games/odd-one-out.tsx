/**
 * app/games/odd-one-out.tsx
 * এখন দিনে একবারই খেলে ৳৫ পাওয়া যাবে।
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OddOneOutGame from '../../components/ui/games/OddOneOutGame';
import { useBalance } from '../../context/BalanceContext';

export default function OddOneOutScreen() {
  const router = useRouter();
  const { addTaskEarning, isTaskDoneToday } = useBalance();
  const alreadyDone = isTaskDoneToday('oddOneOut');

  const handleWin = async (reward: number) => {
    const success = await addTaskEarning('oddOneOut', reward);
    if (success) {
      Alert.alert('অভিনন্দন!', `আপনি ৳${reward} জিতেছেন। ব্যালেন্সে যোগ হয়েছে।`);
    } else {
      Alert.alert('আজকের জন্য শেষ', 'এই গেম থেকে আজ ইতিমধ্যে আয় করেছেন। কাল আবার আসুন।');
    }
    router.back();
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

      {alreadyDone ? (
        <View style={styles.doneBox}>
          <Ionicons name="checkmark-circle" size={64} color="#00e676" />
          <Text style={styles.doneTitle}>আজকের জন্য সম্পন্ন!</Text>
          <Text style={styles.doneSubtitle}>
            আপনি আজ ইতিমধ্যে ৳৫ আয় করেছেন এই গেম থেকে। কাল আবার খেলতে পারবেন।
          </Text>
        </View>
      ) : (
        <OddOneOutGame rewardAmount={5} onWin={handleWin} />
      )}
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
  doneBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  doneTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  doneSubtitle: { color: '#9aa0c7', fontSize: 13, marginTop: 8, textAlign: 'center' },
});