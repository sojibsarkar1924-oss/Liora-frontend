/**
 * app/games/index.tsx
 * এটাই "/games" রুটের প্রধান পেজ — ইউজার হোম থেকে "গেম খেলুন" চাপলে
 * প্রথমে এই পেজ খুলবে, এখান থেকে দুটো গেমের একটা বেছে নেবে।
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GamesHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>গেম খেলুন</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.gameCard}
          activeOpacity={0.85}
          onPress={() => router.push('/games/memory' as any)}
        >
          <Ionicons name="grid-outline" size={36} color="#00e5ff" />
          <View style={styles.gameCardTextWrap}>
            <Text style={styles.gameCardTitle}>মেমরি ম্যাচ</Text>
            <Text style={styles.gameCardSubtitle}>কার্ড মিলিয়ে খেলুন</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#9aa0c7" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gameCard}
          activeOpacity={0.85}
          onPress={() => router.push('/games/odd-one-out' as any)}
        >
          <Ionicons name="eye-outline" size={36} color="#c026d3" />
          <View style={styles.gameCardTextWrap}>
            <Text style={styles.gameCardTitle}>অড ওয়ান আউট</Text>
            <Text style={styles.gameCardSubtitle}>ভিন্ন আইকনটা খুঁজে বের করুন</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#9aa0c7" />
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
  content: { paddingHorizontal: 16, paddingTop: 10, gap: 14 },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3d4a8f',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#12132a',
    gap: 14,
  },
  gameCardTextWrap: { flex: 1 },
  gameCardTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 2 },
  gameCardSubtitle: { color: '#9aa0c7', fontSize: 12 },
});