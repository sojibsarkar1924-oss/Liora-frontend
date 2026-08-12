/**
 * app/home.tsx
 *
 * নতুন ফিক্স (এই ভার্সনে):
 * 3) প্রোফাইল অ্যাভাটার এখন ডাইনামিক — ইউজার নিজের ছবি আপলোড করলে
 *    সেটা দেখাবে, না করলে Ionicons "person" আইকন fallback দেখাবে
 *    (কোনো আলাদা PNG লাগে না এই অংশের জন্য)।
 *
 * আগের ফিক্সগুলো:
 * 1) formatMoney — locale-নির্ভর নয় এমন ম্যানুয়াল বাংলা সংখ্যা কনভার্টার
 * 2) getSafeBadge — userLevel ১-৫০ রেঞ্জে ক্ল্যাম্প করা
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// আপনার ডাইনামিক ব্যাজ এসেটস
import badgeAssets from '../constants/badgeAssets';

// প্রোফাইল অ্যাভাটারের জন্য আর কোনো PNG লাগবে না — ইউজার ছবি না দিলে
// নিচে সরাসরি Ionicons "person" আইকন fallback হিসেবে দেখানো হয় (দেখুন render অংশে)।

// বাকি আইকনগুলো — এগুলো অ্যাপের নিজস্ব ব্র্যান্ডিং, সব ইউজারের জন্য একই
// (নিশ্চিত করুন এই ৮টা PNG assets/images/icons/ ফোল্ডারে আছে)
const logoArrow = require('../assets/images/icons/logo-arrow.png');
const iconMoneybag = require('../assets/images/icons/icon_moneybag.png');
const iconWalletSmall = require('../assets/images/icons/icon_wallet_small.png');
const iconGG = require('../assets/images/icons/icon_gg.png');
const iconGame = require('../assets/images/icons/icon_game.png');
const iconCaptcha = require('../assets/images/icons/icon_captcha.png');
const iconVideo = require('../assets/images/icons/icon_video.png');
const iconRefer = require('../assets/images/icons/icon_refer.png');
// ---------- locale-নির্ভর নয় এমন বাংলা সংখ্যা কনভার্টার ----------
const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliDigits(input: string) {
  return input.replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);
}

function formatMoney(amount: number) {
  const fixed = Number(amount).toFixed(2); // যেমন "1500.00"
  const [intPart, decimalPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // "1,500"
  const englishFormatted = `${withCommas}.${decimalPart}`; // "1,500.00"
  const taka = '\u09F3'; // ৳ চিহ্ন
  return taka + ' ' + toBengaliDigits(englishFormatted);
}

// ---------- ব্যাজ ইনডেক্স নিরাপদ রেঞ্জে ক্ল্যাম্প করা ----------
function getSafeBadge(level: number) {
  const clamped = Math.min(Math.max(Math.round(level), 1), 50);
  return badgeAssets[clamped];
}

type EarnCard = {
  key: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  route: string;
};

const earnCards: EarnCard[] = [
  {
    key: 'game',
    title: 'গেম খেলুন',
    subtitle: 'গেমস ও আর্কেড গেম খেলুন',
    icon: iconGame,
    color: '#00d2ff',
    route: '/games',
  },
  {
    key: 'captcha',
    title: 'ক্যাপচা পূরণ করুন',
    subtitle: 'সহজ ক্যাপচা সমাধান করে আয় করুন',
    icon: iconCaptcha,
    color: '#c026d3',
    route: '/captcha',
  },
  {
    key: 'video',
    title: 'ভিডিও দেখুন',
    subtitle: 'ভিডিও দেখে আয় করুন',
    icon: iconVideo,
    color: '#e11d48',
    route: '/video',
  },
  {
    key: 'refer',
    title: 'বন্ধুদের রেফার করুন',
    subtitle: 'বন্ধুদের রেফার করে আয় করুন',
    icon: iconRefer,
    color: '#ea580c',
    route: '/refer',
  },
];

function glowStyle(color: string) {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
    },
    android: {
      elevation: 8,
      shadowColor: color,
    },
  });
}

type HomeScreenProps = {
  // ইউজারের আসল প্রোফাইল ছবির URL/URI — আপনার auth/user state থেকে আসবে।
  // null/undefined হলে ডিফল্ট placeholder দেখাবে।
  userProfileImageUri?: string | null;
};

export default function HomeScreen({ userProfileImageUri = null }: HomeScreenProps) {
  const router = useRouter();

  // এখানে userLevel = 1 রাখা হয়েছে (নতুন ইউজারের বাস্তবসম্মত ডিফল্ট)।
  // পরে যখন ব্যাকএন্ড/ডাটাবেস থেকে আসল রেফার-সংখ্যা আনার সিস্টেম বসাবেন,
  // userLevel = আপনার state/API থেকে আসা আসল মান দিয়ে replace করবেন।
  const userLevel = 1;
  const currentBalance = 1500;
  const todaysEarning = 500;
  const totalEarning = 9000;

  // ইউজার নিজের ছবি দিয়ে থাকলে Image দেখাবে, নাহলে নিচে person আইকন fallback (JSX অংশে)

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- হেডার ---------- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.headerItem} onPress={() => router.push('/profile')}>
              <View style={[styles.avatarCircle, glowStyle('#00d2ff')]}>
                {userProfileImageUri ? (
                  <Image source={{ uri: userProfileImageUri }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={22} color="#00d2ff" />
                )}
              </View>
              <Text style={styles.headerLabel}>প্রোফাইল</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.headerItem, { marginLeft: 10 }]} onPress={() => router.push('/level' as any)}>
              <Image source={getSafeBadge(userLevel)} style={styles.badgeImage} resizeMode="contain" />
              <Text style={styles.levelLabel}>Lv. {userLevel}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.centerTitleWrap}>
            <Image source={logoArrow} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.titleText}>আমার আয়</Text>
          </View>

          <TouchableOpacity style={styles.headerItem} onPress={() => router.push('/settings')}>
            <View style={[styles.settingsCircle, glowStyle('#00d2ff')]}>
              <Ionicons name="settings-outline" size={24} color="#00d2ff" />
            </View>
            <Text style={styles.headerLabel}>সেটিংস</Text>
          </TouchableOpacity>
        </View>

        {/* ---------- ব্যালেন্স কার্ড ---------- */}
        <View style={[styles.balanceCard, glowStyle('#00d2ff')]}>
          <Text style={styles.balanceAmount}>{formatMoney(currentBalance)}</Text>
          <Text style={styles.balanceLabel}>বর্তমান ব্যালেন্স</Text>
          <Image source={iconMoneybag} style={styles.balanceBagImage} resizeMode="contain" />
        </View>

        {/* ---------- আজকের ও মোট উপার্জন ---------- */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderColor: '#00d2ff' }, glowStyle('#00d2ff')]}>
            <Image source={iconWalletSmall} style={styles.statIcon} resizeMode="contain" />
            <View style={styles.statTextWrap}>
              <Text style={styles.statLabel}>আজকের উপার্জন</Text>
              <Text style={styles.statAmount}>{formatMoney(todaysEarning)}</Text>
            </View>
            <Image source={iconMoneybag} style={styles.statCornerIcon} resizeMode="contain" />
          </View>

          <View style={[styles.statBox, { borderColor: '#ea580c' }, glowStyle('#ea580c')]}>
            <Image source={iconGG} style={styles.statIcon} resizeMode="contain" />
            <View style={styles.statTextWrap}>
              <Text style={styles.statLabel}>মোট উপার্জন</Text>
              <Text style={styles.statAmount}>{formatMoney(totalEarning)}</Text>
            </View>
            <Image source={iconMoneybag} style={styles.statCornerIcon} resizeMode="contain" />
          </View>
        </View>

        {/* ---------- সেকশন টাইটেল ---------- */}
        <Text style={styles.sectionTitle}>টাকা আয় করার উপায়</Text>

        {/* ---------- আয়ের অপশন লিস্ট ---------- */}
        {earnCards.map((card) => (
          <TouchableOpacity
            key={card.key}
            activeOpacity={0.8}
            onPress={() => router.push(card.route as any)}
          >
            <View style={[styles.optionCard, { borderColor: card.color }, glowStyle(card.color)]}>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>{card.title}</Text>
                <Text style={styles.optionSubtitle}>{card.subtitle}</Text>
              </View>
              <Image source={card.icon} style={styles.optionIconImage} resizeMode="contain" />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ---------- বটম ন্যাভিগেশন ---------- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={24} color="#00d2ff" />
          <Text style={[styles.bottomNavLabel, { color: '#00d2ff' }]}>হোম</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push('/wallet')}>
          <Ionicons name="wallet" size={24} color="#64748b" />
          <Text style={styles.bottomNavLabel}>ওয়ালেট</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push('/signup')}>
          <Ionicons name="person-add" size={24} color="#64748b" />
          <Text style={styles.bottomNavLabel}>নতুন অ্যাকাউন্ট</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090a10' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerItem: { alignItems: 'center' },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#00d2ff',
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },

  badgeImage: { width: 50, height: 50 },

  settingsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#00d2ff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },

  headerLabel: { color: '#94a3b8', fontSize: 12, marginTop: 6 },
  levelLabel: { color: '#d946ef', fontSize: 12, fontWeight: 'bold', marginTop: 2 },

  centerTitleWrap: { flexDirection: 'row', alignItems: 'center', marginTop: -15 },
  logoImage: { width: 30, height: 30, marginRight: 8 },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  balanceCard: {
    borderWidth: 1.5,
    borderColor: '#00d2ff',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    marginBottom: 16,
    position: 'relative',
  },
  balanceAmount: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' },
  balanceLabel: { fontSize: 14, color: '#94a3b8', marginTop: 8 },
  balanceBagImage: {
    position: 'absolute',
    right: 16,
    bottom: -10,
    width: 80,
    height: 80,
  },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#0f172a',
    position: 'relative',
    overflow: 'hidden',
  },
  statIcon: { width: 32, height: 32, marginRight: 8 },
  statTextWrap: { flex: 1 },
  statLabel: { fontSize: 12, color: '#94a3b8' },
  statAmount: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginTop: 4 },
  statCornerIcon: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 35,
    height: 35,
    opacity: 0.9,
  },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: '#0f172a',
    marginBottom: 12,
  },
  optionTextWrap: { flex: 1, paddingRight: 10 },
  optionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  optionSubtitle: { fontSize: 13, color: '#94a3b8' },
  optionIconImage: { width: 80, height: 80 },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 12,
    backgroundColor: '#090a10',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavItem: { alignItems: 'center' },
  bottomNavLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: '500' },
});