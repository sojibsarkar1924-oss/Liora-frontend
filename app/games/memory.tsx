/**
 * app/games/memory.tsx
 * "মেমরি ম্যাচ" গেমের রুট — আসল গেমের কোড components/ui/games/MemoryMatchGame.tsx
 * এ আছে, এই ফাইল শুধু সেটাকে হেডার সহ দেখায়।
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MemoryMatchGame from '../../components/ui/games/MemoryMatchGame';

export default function MemoryGameScreen() {
  const router = useRouter();

  const handleWin = (reward: number) => {
    // এখানে আসল ব্যালেন্স-আপডেট লজিক বসাবেন (ব্যাকএন্ড/state/context)
    Alert.alert('অভিনন্দন!', `আপনি ৳${reward} জিতেছেন।`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>মেমরি ম্যাচ</Text>
        <View style={{ width: 40 }} />
      </View>

      <MemoryMatchGame rewardAmount={5} onWin={handleWin} />
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