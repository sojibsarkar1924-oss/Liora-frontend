/**
 * app/level.tsx
 * হোম পেজের লেভেল ব্যাজে ট্যাপ করলে এই স্ক্রিন খুলবে।
 * Lv.1 থেকে Lv.50 পর্যন্ত সব ব্যাজ দেখাবে, বর্তমান লেভেল হাইলাইট থাকবে,
 * এবং রেফার সংখ্যা + "লেভেল বাড়লে আয় বাড়বে" ব্যানার দেখাবে।
 *
 * ব্যবহারের আগে করণীয়:
 * - নিশ্চিত করুন constants/badgeAssets.ts ফাইলে ৫০টা ব্যাজের require() ঠিকমতো আছে
 * - নিশ্চিত করুন assets/images/badges/ ফোল্ডারে badge_1.png থেকে badge_50.png আছে
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import badgeAssets from '../constants/badgeAssets';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 4;
const ITEM_MARGIN = 8;
const ITEM_SIZE = (width - 32 - ITEM_MARGIN * 2 * GRID_COLUMNS) / GRID_COLUMNS;

const MAX_LEVEL = 50;
const LEVEL_UP_BONUS = 10;

const ALL_LEVELS: number[] = [];
for (let i = 1; i <= MAX_LEVEL; i++) {
  ALL_LEVELS.push(i);
}

function getSafeBadge(level: number) {
  const clamped = Math.min(Math.max(Math.round(level), 1), MAX_LEVEL);
  return badgeAssets[clamped];
}

export default function LevelScreen() {
  const router = useRouter();

  // ডেমো ডেটা — আসল ডেটা আপনার ব্যাকএন্ড/স্টেট থেকে আসবে
  const currentLevel = 25;
  const referralCount = 25;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* হেডার */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>লেভেল ও ব্যাজ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* বর্তমান স্ট্যাটাস কার্ড */}
        <View style={styles.statusCard}>
          <Image
            source={getSafeBadge(currentLevel)}
            style={styles.currentBadgeImage}
            resizeMode="contain"
          />
          <Text style={styles.currentLevelText}>Lv. {currentLevel}</Text>
          <Text style={styles.referralText}>
            মোট রেফার করেছেন:{' '}
            <Text style={styles.referralCount}>{referralCount}</Text> জন
          </Text>
        </View>

        {/* তথ্য ব্যানার */}
        <View style={styles.infoBanner}>
          <Ionicons name="trending-up" size={24} color="#ffd54f" />
          <View style={styles.infoBannerTextWrap}>
            <Text style={styles.infoBannerTitle}>
              আপনার লেভেল যত বাড়বে, আয় তত বাড়বে!
            </Text>
            <Text style={styles.infoBannerSubtitle}>
              নিজের রেফার কোড দিয়ে যত বেশি বন্ধু নতুন অ্যাকাউন্ট খুলবে, আপনার
              লেভেল তত দ্রুত বাড়বে এবং প্রতি লেভেলে{' '}
              <Text style={styles.bonusHighlight}>৳{LEVEL_UP_BONUS}</Text>{' '}
              বোনাস পাবেন!
            </Text>
          </View>
        </View>

        {/* সব লেভেলের ব্যাজ গ্রিড */}
        <Text style={styles.sectionTitle}>
          সব লেভেল (Lv. 1 – Lv. {MAX_LEVEL})
        </Text>
        <View style={styles.badgeGrid}>
          {ALL_LEVELS.map((level) => {
            const isUnlocked = level <= currentLevel;
            const isCurrent = level === currentLevel;
            return (
              <View
                key={level}
                style={[
                  styles.badgeItem,
                  isCurrent && styles.badgeItemCurrent,
                  !isUnlocked && styles.badgeItemLocked,
                ]}
              >
                <Image
                  source={getSafeBadge(level)}
                  style={styles.badgeImage}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.badgeLevelText,
                    isCurrent && styles.badgeLevelTextCurrent,
                  ]}
                >
                  Lv. {level}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  scrollContent: { paddingHorizontal: 16 },

  statusCard: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#a855f7',
    borderRadius: 16,
    paddingVertical: 20,
    backgroundColor: '#12132a',
    marginBottom: 16,
  },
  currentBadgeImage: { width: 100, height: 100 },
  currentLevelText: {
    color: '#ffd54f',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 6,
  },
  referralText: { color: '#9aa0c7', fontSize: 13, marginTop: 6 },
  referralCount: { color: '#00e5ff', fontWeight: 'bold' },

  infoBanner: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#ffb300',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#1a1608',
    marginBottom: 20,
  },
  infoBannerTextWrap: { flex: 1, marginLeft: 10 },
  infoBannerTitle: {
    color: '#ffd54f',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  infoBannerSubtitle: { color: '#cfd3ff', fontSize: 12, lineHeight: 18 },
  bonusHighlight: { color: '#00e676', fontWeight: 'bold' },

  sectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  badgeItem: {
    width: ITEM_SIZE,
    alignItems: 'center',
    marginHorizontal: ITEM_MARGIN,
    marginBottom: 18,
  },
  badgeItemCurrent: {
    backgroundColor: '#1e2140',
    borderRadius: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#00e5ff',
  },
  badgeItemLocked: { opacity: 0.35 },
  badgeImage: { width: ITEM_SIZE * 0.8, height: ITEM_SIZE * 0.8 },
  badgeLevelText: { color: '#9aa0c7', fontSize: 11, marginTop: 2 },
  badgeLevelTextCurrent: { color: '#00e5ff', fontWeight: 'bold' },
});