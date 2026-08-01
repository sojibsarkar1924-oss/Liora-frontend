import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  bg:          '#0B0C10',
  cardDark:    '#14151A',
  primaryText: '#FFFFFF',
  secondaryText: '#8E909A',
  cyan:   '#00C9A7',
  purple: '#8358FF',
  red:    '#FF4D4D',
  green:  '#25A171',
  yellow: '#FFB800',
};

// ── Diagonal stripe banner background ───────────────────────────
const StripeBanner = () => {
  const stripes = [];
  for (let i = -4; i < 14; i++) {
    stripes.push(
      <View
        key={i}
        style={[
          styles.diagStripe,
          { left: i * 30 - 60 },
        ]}
      />
    );
  }
  return <View style={styles.stripeWrap} pointerEvents="none">{stripes}</View>;
};

// ── Custom Calendar Icon ─────────────────────────────────────────
const CustomCalendar = () => (
  <View style={styles.calWrapper}>
    <View style={styles.calTop}>
      <Text style={styles.calTopText}>JUL</Text>
    </View>
    <View style={styles.calBottom}>
      <Text style={styles.calBottomText}>17</Text>
    </View>
  </View>
);

// ── Stat Card ────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, valueColor, iconBg }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
    </View>
    <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Info Card (Flex Row Item) ───────────────────────────────────
const InfoCard = ({
  icon, customIcon, iconBg, label, value, bgTint,
  copyable, onCopy, showArrow,
}: any) => (
  <View style={[styles.infoCard, bgTint && { backgroundColor: bgTint }]}>
    <View style={styles.infoCardTop}>
      <View style={[styles.infoIconCircle, { backgroundColor: iconBg }]}>
        {customIcon ? (
          customIcon
        ) : typeof icon === 'string' ? (
          <Text style={{ fontSize: 15 }}>{icon}</Text>
        ) : (
          <Ionicons name={icon} size={16} color="#fff" />
        )}
      </View>
      {copyable ? (
        <TouchableOpacity onPress={onCopy} style={styles.copyBtn}>
          <Ionicons name="copy-outline" size={14} color={Colors.secondaryText} />
        </TouchableOpacity>
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={14} color="#555761" style={{ marginTop: 4 }} />
      ) : null}
    </View>
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════════
export default function ProfileScreen() {
  const router = useRouter();
  const { userData, updateUserData } = useContext(AuthContext) as any;

  const [user, setUser] = useState<any>(userData || null);
  const [loading, setLoading] = useState(!userData);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (userData) { setUser(userData); setLoading(false); }
    loadAvatar();
  }, [userData]);

  // ── ছবি local storage থেকে load ──────────────────────────────
  const loadAvatar = async () => {
    try {
      const uid = userData?._id || userData?.id;
      if (!uid) return;
      const saved = await AsyncStorage.getItem(`avatar_${uid}`);
      if (saved) setAvatarUri(saved);
    } catch {}
  };

  // ── প্রোফাইল ছবি পরিবর্তন ─────────────────────────────────────
  const handleChangeAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      try {
        const uid = userData?._id || userData?.id;
        if (uid) await AsyncStorage.setItem(`avatar_${uid}`, uri);
      } catch {}
    }
  };

  const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : '?');

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', `${label} copied to clipboard.`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.purple} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#d1d1d1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={18} color="#d1d1d1" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* ── Profile Banner ── */}
          <View style={styles.banner}>
            <StripeBanner />

            {/* Avatar — Half-Cut at the top */}
            <TouchableOpacity style={styles.avatarWrap} onPress={handleChangeAvatar} activeOpacity={0.85}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarGradientFallback}>
                  <Text style={styles.avatarInitial}>{getInitial(user?.name || '')}</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.profileName}>{user?.name || 'User'}</Text>

            <View style={styles.badgesWrap}>
              <View style={styles.badgeId}>
                <View style={styles.idIconTag}>
                  <Text style={styles.idIconTagText}>ID</Text>
                </View>
                <Text style={styles.badgeIdText}>ID: {user?.idCode || 'Loading...'}</Text>
              </View>
              <View style={styles.badgeActive}>
                <Ionicons name="checkmark" size={12} color={Colors.green} />
                <Text style={styles.badgeActiveText}>Active Member</Text>
              </View>
            </View>
          </View>

          {/* ── Stats ── */}
          <View style={styles.statsGrid}>
            <StatCard icon="💼" value={'৳' + Number(user?.totalEarnings || user?.wallet || 0)} label="Total"
              valueColor={Colors.cyan} iconBg="rgba(0,201,167,0.08)" />
            <StatCard icon="👥" value={(user?.teamCount || 0) + ' members'} label="Team"
              valueColor="#BFA6FF" iconBg="rgba(131,88,255,0.08)" />
            <StatCard icon="📈" value={(user?.referralCount || 0) + ' times'} label="Refer"
              valueColor={Colors.red} iconBg="rgba(255,77,77,0.08)" />
          </View>

          {/* ── Identity & Codes ── */}
          <Text style={styles.sectionTitle}>Identity & Codes</Text>
          <View style={styles.gridRow}>
            <InfoCard
              icon="ID" iconBg="#6A2CC9"
              label="ID Code (Account Switch)"
              value={user?.idCode || 'Not assigned'}
              bgTint="#1D1530"
              copyable
              onCopy={() => copyToClipboard(user?.idCode || '', 'ID Code')}
            />
            <InfoCard
              icon="🎁" iconBg="#B55D14"
              label="Referral Code (Login Code)"
              value={user?.referralCode || 'Not found'}
              bgTint="#2B1D15"
              copyable
              onCopy={() => copyToClipboard(user?.referralCode || '', 'Referral Code')}
            />
          </View>

          {/* ── Personal Info ── */}
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <View style={styles.gridRow}>
            <InfoCard icon="person" iconBg="#1C5BA6" label="Full Name" value={user?.name || 'Not set'} showArrow />
            <InfoCard icon="call" iconBg="#248175" label="Phone Number" value={user?.phone || 'Not added'} showArrow />
          </View>
          <View style={styles.gridRow}>
            <InfoCard icon="star" iconBg="#6136A8" label="Package" value={user?.packageName || 'WinWay Premium'} showArrow />
            <InfoCard
              customIcon={<CustomCalendar />} iconBg="#A82741" label="Joined"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '30 June 2026'
              }
              showArrow
            />
          </View>

          {/* ── Bonus Details Button ── */}
          <TouchableOpacity style={styles.bonusBtn} activeOpacity={0.85}>
            <Text style={{ fontSize: 18 }}>🎁</Text>
            <Text style={styles.bonusBtnText}>Bonus Details</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },

  // Banner
  banner: {
    marginHorizontal: 20, marginBottom: 20,
    borderRadius: 24, backgroundColor: '#1B162B',
    alignItems: 'center', paddingBottom: 25,
    overflow: 'hidden', // Required to clip the avatar
    position: 'relative',
  },
  stripeWrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  diagStripe: {
    position: 'absolute', top: -40, bottom: -40,
    width: 15, backgroundColor: '#151224',
    transform: [{ rotate: '-45deg' }],
  },

  // Avatar Clipping Fix
  avatarWrap: {
    width: 76, height: 76, borderRadius: 38,
    marginTop: -38, // Half-cut at the top border
    position: 'relative',
  },
  avatarImage: { width: 76, height: 76, borderRadius: 38 },
  avatarGradientFallback: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  avatarInitial: { 
    fontSize: 26, fontWeight: 'bold', color: '#fff', 
    marginTop: 40 // Centered in the lower visible half
  },
  avatarEditBadge: {
    position: 'absolute', bottom: 4, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.purple,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#1B162B',
  },

  profileName: { fontSize: 19, fontWeight: '600', color: '#fff', marginTop: 10, marginBottom: 12 },

  badgesWrap: { alignItems: 'center', gap: 8 },
  badgeId: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(131,88,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  idIconTag: { backgroundColor: Colors.purple, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  idIconTagText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  badgeIdText: { color: '#BFA6FF', fontSize: 12, fontWeight: '500' },
  badgeActive: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(37,161,113,0.15)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  badgeActiveText: { color: Colors.green, fontSize: 12, fontWeight: '600' },

  // Stats
  statsGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 25 },
  statCard: {
    flex: 1, backgroundColor: Colors.cardDark, borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center',
  },
  statIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  statLabel: { fontSize: 11, color: Colors.secondaryText },

  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#fff', paddingHorizontal: 20, marginBottom: 14, marginTop: 25 },

  // Grid Fix (flex: 1 instead of width: 47%)
  gridRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 12 },
  infoCard: {
    flex: 1, // Adjusted for perfect spacing
    backgroundColor: Colors.cardDark, borderRadius: 18,
    padding: 16, minHeight: 115, justifyContent: 'space-between',
  },
  infoCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  infoIconCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  copyBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6 },
  infoLabel: { fontSize: 11, color: Colors.secondaryText, marginBottom: 6, lineHeight: 15 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#fff' },

  // Custom Calendar Styles
  calWrapper: { width: 22, height: 24, backgroundColor: '#fff', borderRadius: 4, overflow: 'hidden' },
  calTop: { backgroundColor: '#FF3B3B', paddingVertical: 2, alignItems: 'center' },
  calTopText: { color: '#fff', fontSize: 6, fontWeight: '700' },
  calBottom: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  calBottomText: { color: '#000', fontSize: 11, fontWeight: '800' },

  bonusBtn: {
    marginHorizontal: 20, marginTop: 15,
    backgroundColor: '#17151A', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,184,0,0.08)',
  },
  bonusBtnText: { fontSize: 14, fontWeight: '600', color: '#FFD257' },
});