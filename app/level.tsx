/**
 * app/level.tsx
 * আপডেট: রেফার বোনাস (৳৫০) ও লেভেল বোনাস (৳১০) এখন স্পষ্টভাবে
 * হাইলাইট করা — বড় করে, আলাদা রঙিন কার্ডে দেখানো হচ্ছে।
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
const LEVEL_UP_BONUS = 10; // প্রতি লেভেলে ৳১০
const REFERRAL_BONUS = 50; // প্রতি সফল রেফারে ৳৫০

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

  const currentLevel = 1;
  const referralCount = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
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

        {/* ---------- বোনাস হাইলাইট — নতুন, বড় করে দেখানো ---------- */}
        <Text style={styles.bonusSectionTitle}>💰 বোনাস অফার</Text>
        <View style={styles.bonusRow}>
          <View style={[styles.bonusCard, styles.bonusCardReferral]}>
            <Ionicons name="people" size={28} color="#00e676" />
            <Text style={styles.bonusAmount}>৳{REFERRAL_BONUS}</Text>
            <Text style={styles.bonusLabel}>রেফার বোনাস</Text>
            <Text style={styles.bonusSubLabel}>প্রতি বন্ধুতে</Text>
          </View>

          <View style={[styles.bonusCard, styles.bonusCardLevel]}>
            <Ionicons name="trending-up" size={28} color="#ffd54f" />
            <Text style={styles.bonusAmount}>৳{LEVEL_UP_BONUS}</Text>
            <Text style={styles.bonusLabel}>লেভেল বোনাস</Text>
            <Text style={styles.bonusSubLabel}>প্রতি লেভেলে</Text>
          </View>
        </View>

        {/* তথ্য ব্যানার */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={22} color="#00e5ff" />
          <View style={styles.infoBannerTextWrap}>
            <Text style={styles.infoBannerTitle}>কীভাবে কাজ করে?</Text>
            <Text style={styles.infoBannerSubtitle}>
              নিজের রেফার কোড দিয়ে বন্ধু নতুন অ্যাকাউন্ট খুললে আপনি সাথে সাথে{' '}
              <Text style={styles.bonusHighlightInline}>৳{REFERRAL_BONUS}</Text> পাবেন,
              আর আপনার লেভেলও ১ বাড়বে — লেভেল বাড়লে আরও{' '}
              <Text style={styles.bonusHighlightInline}>৳{LEVEL_UP_BONUS}</Text> বোনাস
              পাবেন। এই দুইটা বোনাসের কোনো দৈনিক সীমা নেই!
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
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 16 },

  statusCard: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#a855f7',
    borderRadius: 16,
    paddingVertical: 20,
    backgroundColor: '#12132a',
    marginBottom: 20,
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

  bonusSectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bonusRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  bonusCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 2,
  },
  bonusCardReferral: {
    backgroundColor: '#0f2e1e',
    borderColor: '#00e676',
  },
  bonusCardLevel: {
    backgroundColor: '#2a2408',
    borderColor: '#ffd54f',
  },
  bonusAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bonusLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  bonusSubLabel: {
    color: '#9aa0c7',
    fontSize: 11,
    marginTop: 2,
  },

  infoBanner: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#00e5ff',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#0a1f24',
    marginBottom: 20,
  },
  infoBannerTextWrap: { flex: 1, marginLeft: 10 },
  infoBannerTitle: {
    color: '#00e5ff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  infoBannerSubtitle: { color: '#cfd3ff', fontSize: 12, lineHeight: 18 },
  bonusHighlightInline: { color: '#00e676', fontWeight: 'bold', fontSize: 13 },

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