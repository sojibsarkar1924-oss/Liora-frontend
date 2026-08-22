import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // যোগ করা হয়েছে
import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useBalance } from '../context/BalanceContext';

import badgeAssets from '../constants/badgeAssets';

const logoArrow = require('../assets/images/icons/logo-arrow.png');
const iconMoneybag = require('../assets/images/icons/icon-moneybag.png');
const iconWalletSmall = require('../assets/images/icons/icon-wallet-small.png');
const iconGG = require('../assets/images/icons/icon-gg.png');
const iconGame = require('../assets/images/icons/icon-game.png');
const iconCaptcha = require('../assets/images/icons/icon-captcha.png');
const iconVideo = require('../assets/images/icons/icon-video.png');
const iconRefer = require('../assets/images/icons/icon-refer.png');

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliDigits(input: string) {
  return input.replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);
}

function formatMoney(amount: number) {
  const fixed = Number(amount).toFixed(2);
  const [intPart, decimalPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const englishFormatted = `${withCommas}.${decimalPart}`;
  const taka = '\u09F3';
  return taka + ' ' + toBengaliDigits(englishFormatted);
}

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
  userProfileImageUri?: string | null;
};

export default function HomeScreen({ userProfileImageUri = null }: HomeScreenProps) {
  const router = useRouter();

  // ✅ ফিক্স: হার্ডকোড করা userLevel = 1 এর বদলে এখন AuthContext-এর
  // userData.level থেকে আসল লেভেল নেওয়া হচ্ছে (backend থেকে আসা মান)।
  // userData না থাকলে বা level ফিল্ড না থাকলে ডিফল্ট হিসেবে ১ থাকবে।
  const { userData } = useContext(AuthContext) as any;
  const userLevel = userData?.level || 1;

  // ✅✅✅ ফিক্স: দুই সোর্সের ব্যালেন্স একসাথে দেখানো ✅✅✅
  // BalanceContext (local, AsyncStorage) শুধু গেম/ক্যাপচা/ভিডিও থেকে আয় রাখে।
  // userData (AuthContext, backend থেকে আসা) রেফার বোনাস, লেভেল বোনাস,
  // টিম বোনাস রাখে — Profile পেইজ এটাই দেখায়। এই দুইটা backend-এ সংযুক্ত
  // না থাকায় আলাদা আলাদা জায়গায় জমা হচ্ছিল। এখন Home পেইজে দুটো যোগ করে
  // দেখানো হচ্ছে, যাতে গেমের আয়ও দেখা যায়, রেফার বোনাসও দেখা যায় —
  // কোনোটাই হারিয়ে না যায়।
  const { balance: localBalance, todaysEarning, totalEarning: localTotalEarning } = useBalance();
  const backendBalance       = Number(userData?.balance || 0);
  const backendTotalEarnings = Number(userData?.totalEarnings || 0);
  const currentBalance = backendBalance + localBalance;
  const totalEarning   = backendTotalEarnings + localTotalEarning;

  // ✅ নতুন ফিক্স: লগআউট কনফার্মেশন
  const handleLogoutAndSignup = async () => {
    Alert.alert(
      "নতুন অ্যাকাউন্ট",
      "নতুন অ্যাকাউন্ট তৈরি করার জন্য আপনাকে বর্তমান অ্যাকাউন্ট থেকে লগআউট করতে হবে। আপনি কি রাজি?",
      [
        { text: "না", style: "cancel" },
        { 
          text: "হ্যাঁ, লগআউট করুন", 
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/signup');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={[styles.balanceCard, glowStyle('#00d2ff')]}>
          <Text style={styles.balanceAmount}>{formatMoney(currentBalance)}</Text>
          <Text style={styles.balanceLabel}>বর্তমান ব্যালেন্স</Text>
          <Image source={iconMoneybag} style={styles.balanceBagImage} resizeMode="contain" />
        </View>

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

        <Text style={styles.sectionTitle}>টাকা আয় করার উপায়</Text>

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

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={24} color="#00d2ff" />
          <Text style={[styles.bottomNavLabel, { color: '#00d2ff' }]}>হোম</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push('/wallet')}>
          <Ionicons name="wallet" size={24} color="#64748b" />
          <Text style={styles.bottomNavLabel}>ওয়ালেট</Text>
        </TouchableOpacity>

        {/* ✅ এখানে ফিক্স করা ফাংশনটি বসানো হয়েছে */}
        <TouchableOpacity style={styles.bottomNavItem} onPress={handleLogoutAndSignup}>
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