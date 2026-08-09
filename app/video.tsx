/**
 * app/video.tsx
 * "ভিডিও দেখুন" রুট — আসল কোড এখন components/ui/games/VideoTask.tsx
 * এ আছে, এই ফাইল শুধু হেডার সহ সেটাকে দেখায়।
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import VideoTask from '../components/ui/games/VideoTask';

export default function VideoScreen() {
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
        <Text style={styles.headerTitle}>ভিডিও দেখুন</Text>
        <View style={{ width: 40 }} />
      </View>

      <VideoTask rewardAmount={9} onWin={handleWin} />
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