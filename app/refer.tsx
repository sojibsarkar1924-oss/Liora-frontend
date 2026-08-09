/**
 * app/refer.tsx
 * এখনো আসল রেফার ফিচার বানানো হয়নি — এটা একটা placeholder পেজ,
 * যাতে অন্তত "Unmatched Route" এরর না দেখায় এবং ব্যাক বাটন কাজ করে।
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReferScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>বন্ধুদের রেফার করুন</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.centerContent}>
        <Ionicons name="construct-outline" size={48} color="#9c4dff" />
        <Text style={styles.comingSoonTitle}>শীঘ্রই আসছে</Text>
        <Text style={styles.comingSoonSubtitle}>
          রেফার ফিচারটি এখনো তৈরি হচ্ছে
        </Text>
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
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  comingSoonTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  comingSoonSubtitle: { color: '#9aa0c7', fontSize: 13 },
});