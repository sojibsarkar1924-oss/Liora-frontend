import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Clipboard,
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

const Colors = {
  bgGradientStart: '#C8DFF7',
  bgGradientEnd:   '#EEF5FF',
  glassWhite:      'rgba(255, 255, 255, 0.55)',
  glassBorder:     'rgba(255, 255, 255, 0.75)',
  primaryText:     '#1A2533',
  accentBlue:      '#0984E3',
  accentGreen:     '#00B894',
  accentOrange:    '#E17055',
  accentPurple:    '#6C5CE7',
  subText:         '#636E72',
};

const GlassCard = ({ children, style }: any) => (
  <View style={[styles.glass, style]}>{children}</View>
);

// ✅ Copy করার সুবিধা সহ InfoItem
const InfoItem = ({
  icon, label, value, color, delay, copyable = false,
}: {
  icon: any; label: string; value: string;
  color: string; delay: number; copyable?: boolean;
}) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleCopy = () => {
    Clipboard.setString(value);
    Alert.alert('Copied!', value + ' copied to clipboard.');
  };

  return (
    <Animated.View style={[styles.infoRow, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ marginLeft: 15, flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {copyable ? (
        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
          <Ionicons name="copy-outline" size={18} color={color} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#b2bec3" />
      )}
    </Animated.View>
  );
};

const StatCard = ({
  icon, label, value, color, delay,
}: {
  icon: any; label: string; value: string; color: string; delay: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5,   delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.statIconBg, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { userData, updateUserData } = useContext(AuthContext) as any;

  const [user,       setUser]       = useState<any>(userData || null);
  const [loading,    setLoading]    = useState(!userData);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');

  const headerFade  = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.5)).current;

  const loadProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const currentUser = userData || user;
      if (!currentUser) { setError('User data not found. Please login again.'); return; }

      const userId = currentUser._id || currentUser.id;
      if (!userId)      { setError('User ID not found.'); return; }

      const updatedUser = await updateUserData(userId);
      if (updatedUser) setUser(updatedUser);
      else             setUser(currentUser);

    } catch (err: any) {
      if (userData) setUser(userData);
      else          setError('Could not load profile.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userData) { setUser(userData); setLoading(false); loadProfile(true); }
    else            loadProfile();
  }, []);

  useEffect(() => { if (userData) setUser(userData); }, [userData]);

  useEffect(() => {
    if (!loading && user) {
      Animated.parallel([
        Animated.timing(headerFade,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(avatarScale, { toValue: 1, friction: 4,   useNativeDriver: true }),
      ]).start();
    }
  }, [loading, user]);

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <LinearGradient colors={[Colors.bgGradientStart, Colors.bgGradientEnd]} style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accentBlue} />
        <Text style={{ marginTop: 16, color: Colors.subText, fontSize: 15 }}>Loading profile...</Text>
      </LinearGradient>
    );
  }

  if (error && !user) {
    return (
      <LinearGradient colors={[Colors.bgGradientStart, Colors.bgGradientEnd]} style={styles.centered}>
        <Ionicons name="wifi-outline" size={60} color="#b2bec3" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadProfile()}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[Colors.bgGradientStart, Colors.bgGradientEnd]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgGradientStart} />
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.primaryText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => loadProfile(true)} style={styles.backBtn}>
            <Ionicons name="refresh-outline" size={22} color={Colors.accentBlue} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProfile(true)}
              colors={[Colors.accentBlue]}
              tintColor={Colors.accentBlue}
            />
          }
        >
          {/* Profile Card */}
          <Animated.View style={{ opacity: headerFade }}>
            <GlassCard style={styles.profileCard}>
              <Animated.View style={[styles.avatarLarge, { transform: [{ scale: avatarScale }] }]}>
                <LinearGradient
                  colors={[Colors.accentBlue, '#6C5CE7']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarInitials}>
                    {getInitials(user?.name || 'User')}
                  </Text>
                </LinearGradient>
              </Animated.View>

              <Text style={styles.userName}>{user?.name || 'Name not found'}</Text>

              {/* ✅ ID Code — badge হিসেবে দেখানো */}
              <View style={styles.idCodeBadge}>
                <Ionicons name="finger-print-outline" size={14} color={Colors.accentPurple} />
                <Text style={styles.idCodeText}>
                  ID: {user?.idCode || 'Loading...'}
                </Text>
              </View>

              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.accentGreen} />
                <Text style={styles.badgeText}>Active Member</Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              icon="wallet-outline"
              label="Total"
              value={'৳' + Number(user?.totalEarnings || user?.wallet || 0).toLocaleString()}
              color={Colors.accentGreen}
              delay={100}
            />
            <StatCard
              icon="people-outline"
              label="Team"
              value={(user?.teamCount || user?.referralCount || 0) + ' members'}
              color={Colors.accentPurple}
              delay={200}
            />
            <StatCard
              icon="trending-up-outline"
              label="Refer"
              value={(user?.referralCount || 0) + ' times'}
              color={Colors.accentOrange}
              delay={300}
            />
          </View>

          {/* ✅ ID & Code Section — নতুন */}
          <GlassCard>
            <Text style={styles.sectionTitle}>Identity & Codes</Text>

            {/* ✅ ID Code — copy করা যাবে */}
            <InfoItem
              icon="finger-print-outline"
              label="ID Code (Account Switch)"
              value={user?.idCode || 'Not assigned'}
              color={Colors.accentPurple}
              delay={50}
              copyable
            />
            <View style={styles.divider} />

            {/* ✅ Referral Code — copy করা যাবে */}
            <InfoItem
              icon="gift-outline"
              label="Referral Code (Login Code)"
              value={user?.referralCode || 'Not found'}
              color={Colors.accentOrange}
              delay={100}
              copyable
            />
          </GlassCard>

          {/* Personal Info */}
          <GlassCard>
            <Text style={styles.sectionTitle}>Personal Info</Text>

            <InfoItem
              icon="person-outline"
              label="Full Name"
              value={user?.name || 'Not set'}
              color={Colors.accentBlue}
              delay={100}
            />
            <View style={styles.divider} />

            <InfoItem
              icon="call-outline"
              label="Phone Number"
              value={user?.phone || 'Not added'}
              color={Colors.accentGreen}
              delay={200}
            />
            <View style={styles.divider} />

            {/* ✅ Package — Liora Premium দেখাবে */}
            <InfoItem
              icon="star-outline"
              label="Package"
              value={user?.packageName || 'Liora Premium'}
              color={Colors.accentPurple}
              delay={300}
            />
            <View style={styles.divider} />

            <InfoItem
              icon="calendar-outline"
              label="Joined"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-BD', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : 'Unknown'
              }
              color={Colors.accentGreen}
              delay={400}
            />
          </GlassCard>

          {/* Bonus Info */}
          <GlassCard>
            <Text style={styles.sectionTitle}>Bonus Details</Text>

            <InfoItem
              icon="person-add-outline"
              label="Referral Bonus"
              value={'৳' + Number(user?.referralBonus || 0).toFixed(2)}
              color={Colors.accentGreen}
              delay={100}
            />
            <View style={styles.divider} />
            <InfoItem
              icon="people-outline"
              label="Team Bonus"
              value={'৳' + Number(user?.teamBonus || 0).toFixed(2)}
              color={Colors.accentBlue}
              delay={200}
            />
          </GlassCard>

          {/* Wallet Card */}
          <GlassCard style={styles.walletCard}>
            <LinearGradient
              colors={['#0984E3', '#6C5CE7']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.walletGradient}
            >
              <View style={styles.walletRow}>
                <View>
                  <Text style={styles.walletLabel}>Current Balance</Text>
                  <Text style={styles.walletAmount}>
                    {'৳ ' + Number(user?.wallet || user?.balance || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.walletIconBg}>
                  <Ionicons name="wallet" size={30} color="white" />
                </View>
              </View>
            </LinearGradient>
          </GlassCard>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A2533' },
  backBtn: {
    padding: 10, backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5, borderRadius: 22,
    padding: 20, marginBottom: 18,
    shadowColor: '#0984E3', shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, elevation: 4,
  },
  profileCard:   { alignItems: 'center', paddingVertical: 28 },
  avatarLarge: {
    width: 100, height: 100, borderRadius: 50, marginBottom: 16,
    shadowColor: '#0984E3', shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 }, elevation: 10,
  },
  avatarGradient: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 36, fontWeight: 'bold', color: 'white' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1A2533', marginBottom: 10 },

  // ✅ ID Code badge
  idCodeBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(108,92,231,0.10)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, gap: 6, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(108,92,231,0.25)',
  },
  idCodeText: { color: '#6C5CE7', fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#00B89415', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 20, gap: 5,
    borderWidth: 1, borderColor: '#00B89440',
  },
  badgeText: { color: '#00B894', fontSize: 12, fontWeight: '600' },

  statsRow:  { flexDirection: 'row', gap: 12, marginBottom: 18 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 18, padding: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
    elevation: 3,
  },
  statIconBg:  { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue:   { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  statLabel:   { fontSize: 11, color: '#636E72', textAlign: 'center' },
  sectionTitle:{ fontSize: 15, fontWeight: '700', color: '#1A2533', marginBottom: 16 },
  infoRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  iconCircle:  { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  infoLabel:   { fontSize: 12, color: '#636E72', marginBottom: 2 },
  infoValue:   { fontSize: 15, fontWeight: '700', color: '#1A2533' },
  divider:     { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: 10 },

  // ✅ Copy button
  copyBtn: {
    padding: 8, backgroundColor: 'rgba(108,92,231,0.10)',
    borderRadius: 10,
  },

  walletCard:     { padding: 0, overflow: 'hidden' },
  walletGradient: { borderRadius: 20, padding: 24 },
  walletRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel:    { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  walletAmount:   { color: 'white', fontSize: 32, fontWeight: 'bold' },
  walletIconBg: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  errorText: { color: '#636E72', fontSize: 15, marginTop: 16, textAlign: 'center', paddingHorizontal: 30 },
  retryBtn:  { marginTop: 20, backgroundColor: '#0984E3', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  retryText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});