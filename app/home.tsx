import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

// ✅ FIXED: আলাদা import নেই — সরাসরি fetch ব্যবহার
const API_URL = 'https://liora-backend-production-74f1.up.railway.app/api';

const { width } = Dimensions.get('window');

const Colors = {
  bgGradientStart: '#C8DFF7',
  bgGradientEnd:   '#EEF5FF',
  glassWhite:      'rgba(255, 255, 255, 0.50)',
  glassBorder:     'rgba(255, 255, 255, 0.75)',
  primaryText:     '#1A2533',
  secondaryText:   '#636E72',
  accentBlue:      '#0984E3',
  accentGreen:     '#00B894',
  accentOrange:    '#E17055',
};

const GlassView = ({ children, style }: any) => (
  <View style={[styles.glassContainer, style]}>{children}</View>
);

const ActionButton = ({ label, icon, isActive, onPress, delay }: any) => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5,   delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(pressScale, { toValue: 0.92, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], width: '22%' }}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1} style={styles.actionWrapper}>
        <Animated.View style={[styles.glassContainer, styles.actionTile, isActive && styles.activeTile, { transform: [{ scale: pressScale }] }]}>
          <Ionicons name={icon} size={26} color={isActive ? '#FFF' : Colors.accentBlue} />
        </Animated.View>
        <Text style={styles.actionLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TransactionItem = ({ label, date, amount, color, delay }: any) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.transRow, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={[styles.transIcon, { backgroundColor: color === 'green' ? '#E8FDF5' : '#FFF0EE' }]}>
        <Ionicons
          name={color === 'red' ? 'arrow-up' : 'arrow-down'}
          size={18}
          color={color === 'green' ? Colors.accentGreen : Colors.accentOrange}
        />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.transLabel}>{label}</Text>
        <Text style={styles.transDate}>{date}</Text>
      </View>
      <Text style={[styles.transAmount, { color: color === 'green' ? Colors.accentGreen : Colors.accentOrange }]}>
        {amount}
      </Text>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { userData, updateUserData } = useContext(AuthContext) as any;
  const [refreshing,   setRefreshing]   = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const headerFade   = useRef(new Animated.Value(0)).current;
  const balanceScale = useRef(new Animated.Value(0.8)).current;
  const balanceFade  = useRef(new Animated.Value(0)).current;
  const floatAnim    = useRef(new Animated.Value(0)).current;

  const balance = Math.max(Number(userData?.balance || 0), Number(userData?.wallet || 0));

  const today     = new Date().toISOString().split('T')[0];
  const taskDone  = userData?.lastTaskDate === today ? (userData?.todayTaskCount || 0) : 0;
  const taskLimit = userData?.taskLimit || 0;

  useFocusEffect(
    useCallback(() => {
      const id = userData?.id || userData?._id;
      if (id && updateUserData) {
        updateUserData(id).catch(() => {});
        fetchTransactions(id);
      }
    }, [userData?.id, userData?._id])
  );

  // ✅ FIXED: history API ব্যবহার করো (withdraw + task একসাথে)
  const fetchTransactions = async (userId: string) => {
    try {
      const res  = await fetch(`${API_URL}/history/${userId}`);
      const data = await res.json();
      if (data?.success && data?.data) {
        setTransactions(data.data.slice(0, 5));
      }
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade,   { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(balanceScale, { toValue: 1, friction: 5,   useNativeDriver: true }),
      Animated.timing(balanceFade,  { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const balancePulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(balancePulse, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
        Animated.timing(balancePulse, { toValue: 1,    duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const id = userData?.id || userData?._id;
    if (id && updateUserData) {
      updateUserData(id)
        .then(() => fetchTransactions(id))
        .catch(() => {})
        .finally(() => setRefreshing(false));
    } else {
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [userData]);

  const handleNav = (path: string) => router.push(path as any);

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // ✅ FIXED: NaN ও key prop দুটোই ঠিক করা
  const formatTransaction = (item: any, index: number) => {
    try {
      const type      = item?.type || 'withdraw';
      const numAmount = isNaN(Number(item?.amount)) ? 0 : Number(item?.amount);

      // ✅ income নাকি outcome
      const isIncome  = type === 'task' || type === 'referral' || type === 'team';
      const amountStr = (isIncome ? '+৳' : '-৳') + String(Math.floor(numAmount));

      // ✅ সব type এর label
      const label =
        type === 'task'     ? 'ডেইলি বোনাস'               :
        type === 'referral' ? (item?.label || 'রেফার বোনাস') :
        type === 'team'     ? 'টিম বোনাস'                  :
        item?.status === 'Pending'  ? 'উইথড্র রিকোয়েস্ট'  :
        item?.status === 'Approved' ? 'উইথড্র (সম্পন্ন)'   :
                                      'উইথড্র রিকোয়েস্ট';  // ✅ বাতিল দেখাবে না

      // ✅ তারিখ
      const date =
        item?.status === 'Pending' ? 'পেন্ডিং' :
        item?.date      ? new Date(item.date).toLocaleDateString()      :
        item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';

      const color = isIncome ? 'green' : 'red';

      return (
        <TransactionItem
          key={String(index)}
          label={label}
          date={date}
          amount={amountStr}
          color={color}
          delay={index * 100}
        />
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <LinearGradient colors={[Colors.bgGradientStart, Colors.bgGradientEnd]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bgGradientStart} />

        <View style={styles.body}>
          {/* হেডার */}
          <Animated.View style={[styles.header, { opacity: headerFade }]}>
            <TouchableOpacity style={styles.userInfo} onPress={() => handleNav('/profile')}>
              <View style={styles.avatarContainer}>
                <LinearGradient colors={[Colors.accentBlue, '#6C5CE7']} style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>{getInitials(userData?.name || '')}</Text>
                </LinearGradient>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.welcomeText}>স্বাগতম 👋</Text>
                <Text style={styles.userName}>{userData?.name || 'ব্যবহারকারী'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.primaryText} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </Animated.View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.accentBlue]} />}
          >
            {/* ব্যালেন্স কার্ড */}
            <Animated.View style={[styles.glassContainer, styles.balanceCard, { opacity: balanceFade, transform: [{ scale: balancePulse }] }]}>
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />
              <Text style={styles.balanceLabel}>একাউন্ট ব্যালেন্স</Text>
              <Animated.Text style={[styles.balanceAmount, { transform: [{ scale: balanceScale }] }]}>
                ৳{balance.toFixed(0)}
              </Animated.Text>
              <View style={styles.balanceStatsRow}>
                <View style={styles.balanceStat}>
                  <Ionicons name="people-outline" size={14} color={Colors.secondaryText} />
                  <Text style={styles.balanceStatText}>টিম: {userData?.teamCount ?? 0} জন</Text>
                </View>
                <View style={styles.balanceStatDivider} />
                <View style={styles.balanceStat}>
                  <Ionicons name="gift-outline" size={14} color={Colors.secondaryText} />
                  <Text style={styles.balanceStatText}>রেফার: {userData?.referralCount ?? 0} টি</Text>
                </View>
              </View>
            </Animated.View>

            {/* গিফট সেকশন */}
            <View style={styles.giftSection}>
              <GlassView style={styles.giftPanel}>
                <View style={styles.giftTextContainer}>
                  <Text style={styles.giftTitle}>🎁 ডেইলি বোনাস</Text>
                  <Text style={styles.giftSub}>আজকের কাজ শুরু করুন</Text>
                </View>
                <TouchableOpacity onPress={() => handleNav('/tasks')} activeOpacity={0.85}>
                  <LinearGradient colors={['#74B9FF', Colors.accentBlue]} style={styles.startButton}>
                    <Text style={styles.btnText}>
                      {taskLimit > 0 ? `${taskDone}/${taskLimit}` : 'শুরু করুন'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </GlassView>

              <Animated.Image
                source={{ uri: 'https://cdn3d.iconscout.com/3d/premium/thumb/gift-box-4431271-3671561.png' }}
                style={[styles.real3DImage, { transform: [{ translateY: floatAnim }] }]}
                resizeMode="contain"
              />
            </View>

            {/* অ্যাকশন বাটন */}
            <View style={styles.actionGrid}>
              <ActionButton label="উইথড্র"    icon="wallet-outline"            isActive={true}  onPress={() => handleNav('/withdraw')} delay={100} />
              <ActionButton label="ট্রান্সফার" icon="swap-horizontal-outline"   isActive={false} onPress={() => handleNav('/transfer')} delay={200} />
              <ActionButton label="ডিপোজিট"   icon="arrow-down-circle-outline" isActive={false} onPress={() => handleNav('/deposit')}  delay={300} />
              <ActionButton label="সেটিংস"    icon="settings-outline"          isActive={false} onPress={() => handleNav('/settings')} delay={400} />
            </View>

            {/* লেনদেনের ইতিহাস */}
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={styles.sectionHeader}>লেনদেনের ইতিহাস</Text>
                <TouchableOpacity onPress={() => handleNav('/history')}>
                  <Text style={styles.seeAll}>সব দেখুন</Text>
                </TouchableOpacity>
              </View>

              {transactions.length > 0 ? (
                transactions.map((item, index) => formatTransaction(item, index))
              ) : (
                <View style={styles.noTrans}>
                  <Ionicons name="receipt-outline" size={40} color="#cbd5e1" />
                  <Text style={styles.noTransText}>কোনো লেনদেন নেই</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* বটম নেভ */}
          <View style={styles.bottomNav}>
            <TouchableOpacity onPress={() => handleNav('/home')} style={styles.navItem}>
              <View style={styles.navActiveIndicator} />
              <Ionicons name="home" size={24} color={Colors.accentBlue} />
              <Text style={[styles.navLabel, { color: Colors.accentBlue }]}>হোম</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNav('/withdraw')} style={styles.navItem}>
              <Ionicons name="card-outline" size={24} color={Colors.secondaryText} />
              <Text style={styles.navLabel}>ওয়ালেট</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNav('/profile')} style={styles.navItem}>
              <Ionicons name="person-outline" size={24} color={Colors.secondaryText} />
              <Text style={styles.navLabel}>প্রোফাইল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea:  { flex: 1 },
  body:      { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  glassContainer: {
    backgroundColor: Colors.glassWhite, borderColor: Colors.glassBorder,
    borderWidth: 1.5, borderRadius: 20,
    shadowColor: '#8FB1D6', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 5,
  },

  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  userInfo:        { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  avatarGradient:  { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  avatarText:      { color: 'white', fontWeight: 'bold', fontSize: 16 },
  welcomeText:     { fontSize: 12, color: Colors.secondaryText },
  userName:        { fontSize: 18, fontWeight: 'bold', color: Colors.primaryText },
  notifBtn: {
    width: 45, height: 45, borderRadius: 22.5,
    backgroundColor: Colors.glassWhite, borderWidth: 1.5, borderColor: Colors.glassBorder,
    justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#E17055', borderWidth: 1.5, borderColor: 'white',
  },

  balanceCard:        { padding: 28, alignItems: 'center', marginBottom: 20, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.65)' },
  decorCircle1:       { position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(9,132,227,0.08)' },
  decorCircle2:       { position: 'absolute', bottom: -30, left: -30, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(0,184,148,0.08)' },
  balanceLabel:       { fontSize: 14, color: Colors.secondaryText, marginBottom: 8, fontWeight: '500' },
  balanceAmount:      { fontSize: 40, fontWeight: 'bold', color: Colors.primaryText, marginBottom: 16 },
  balanceStatsRow:    { flexDirection: 'row', alignItems: 'center', gap: 16 },
  balanceStat:        { flexDirection: 'row', alignItems: 'center', gap: 5 },
  balanceStatDivider: { width: 1, height: 16, backgroundColor: 'rgba(0,0,0,0.1)' },
  balanceStatText:    { fontSize: 12, color: Colors.secondaryText, fontWeight: '600' },

  giftSection:       { marginBottom: 28, height: 120, justifyContent: 'flex-end' },
  giftPanel:         { height: 90, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'rgba(230,242,255,0.65)' },
  giftTextContainer: { flex: 1 },
  giftTitle:         { fontSize: 15, fontWeight: 'bold', color: Colors.primaryText },
  giftSub:           { fontSize: 12, color: Colors.secondaryText, marginTop: 2 },
  startButton:       { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  btnText:           { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  real3DImage:       { position: 'absolute', width: 120, height: 120, top: -30, left: width / 2 - 60, zIndex: 99 },

  actionGrid:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  actionWrapper: { alignItems: 'center' },
  actionTile:    { width: 62, height: 62, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.65)' },
  activeTile:    { backgroundColor: Colors.accentBlue, borderColor: Colors.accentBlue },
  actionLabel:   { fontSize: 11, marginTop: 7, color: Colors.secondaryText, fontWeight: '600' },

  listSection:   { paddingBottom: 100 },
  listHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionHeader: { fontSize: 17, fontWeight: 'bold', color: Colors.primaryText },
  seeAll:        { fontSize: 12, color: Colors.accentBlue, fontWeight: '600' },
  transRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', elevation: 2 },
  transIcon:     { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transLabel:    { fontSize: 14, fontWeight: '700', color: Colors.primaryText },
  transDate:     { fontSize: 11, color: Colors.secondaryText, marginTop: 2 },
  transAmount:   { fontWeight: 'bold', fontSize: 15 },

  noTrans:     { alignItems: 'center', paddingVertical: 30 },
  noTransText: { color: '#94a3b8', marginTop: 8, fontSize: 14 },

  bottomNav: {
    position: 'absolute', bottom: 16, left: 30, right: 30, height: 65,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', elevation: 12,
    shadowColor: '#0984E3', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12,
  },
  navItem:            { alignItems: 'center', position: 'relative', paddingTop: 4 },
  navActiveIndicator: { position: 'absolute', top: -2, width: 20, height: 3, backgroundColor: Colors.accentBlue, borderRadius: 2 },
  navLabel:           { fontSize: 10, color: Colors.secondaryText, marginTop: 3, fontWeight: '600' },
});