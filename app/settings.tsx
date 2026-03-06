import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Colors = {
  bgStart: '#C8DFF7',
  bgEnd: '#EEF5FF',
  glass: 'rgba(255,255,255,0.58)',
  glassBorder: 'rgba(255,255,255,0.8)',
  primary: '#1A2533',
  blue: '#0984E3',
  green: '#00B894',
  orange: '#E17055',
  red: '#D63031',
  purple: '#6C5CE7',
  subText: '#636E72',
};

// ✅ অ্যানিমেটেড প্রতিটি সেটিং আইটেম
const SettingItem = ({
  icon,
  label,
  sublabel,
  onPress,
  color = Colors.primary,
  iconBg = '#F1F5F9',
  delay = 0,
  rightElement,
}: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        marginBottom: 12,
      }}
    >
      <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.itemTextWrap}>
          <Text style={[styles.itemLabel, { color }]}>{label}</Text>
          {sublabel ? <Text style={styles.itemSublabel}>{sublabel}</Text> : null}
        </View>
        {rightElement || (
          <Ionicons name="chevron-forward" size={18} color="#b2bec3" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ✅ পাসওয়ার্ড পরিবর্তন মোডাল
const ChangePasswordModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      return Alert.alert('⚠️ ত্রুটি', 'সব ঘর পূরণ করুন।');
    }
    if (newPass.length < 6) {
      return Alert.alert('⚠️ ত্রুটি', 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    }
    if (newPass !== confirmPass) {
      return Alert.alert('⚠️ ত্রুটি', 'নতুন পাসওয়ার্ড দুটো মিলছে না।');
    }

    setLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('userData');
      const userData = storedData ? JSON.parse(storedData) : null;
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch('http://192.168.0.193:5000/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userData?._id,
          oldPassword: oldPass,
          newPassword: newPass,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('✅ সফল', 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।');
        setOldPass(''); setNewPass(''); setConfirmPass('');
        onClose();
      } else {
        Alert.alert('❌ ব্যর্থ', data.msg || 'পুরনো পাসওয়ার্ড ভুল হয়েছে।');
      }
    } catch {
      Alert.alert('❌ সমস্যা', 'সার্ভার বা নেটওয়ার্ক সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const PassInput = ({
    placeholder,
    value,
    onChangeText,
    show,
    onToggle,
  }: any) => (
    <View style={styles.passInputWrap}>
      <Ionicons name="lock-closed-outline" size={18} color={Colors.subText} style={{ marginRight: 10 }} />
      <TextInput
        style={styles.passInput}
        placeholder={placeholder}
        placeholderTextColor="#b2bec3"
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={onToggle}>
        <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.subText} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔐 পাসওয়ার্ড পরিবর্তন</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={Colors.subText} />
            </TouchableOpacity>
          </View>

          <PassInput
            placeholder="পুরনো পাসওয়ার্ড"
            value={oldPass}
            onChangeText={setOldPass}
            show={showOld}
            onToggle={() => setShowOld(!showOld)}
          />
          <PassInput
            placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
            value={newPass}
            onChangeText={setNewPass}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
          />
          <PassInput
            placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
            value={confirmPass}
            onChangeText={setConfirmPass}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
          />

          <TouchableOpacity
            style={[styles.modalBtn, loading && { opacity: 0.7 }]}
            onPress={handleChange}
            disabled={loading}
          >
            <LinearGradient colors={[Colors.blue, Colors.purple]} style={styles.modalBtnGradient}>
              <Text style={styles.modalBtnText}>
                {loading ? 'অপেক্ষা করুন...' : 'পরিবর্তন করুন'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ✅ প্রাইভেসি পলিসি মোডাল
const PrivacyModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={[styles.modalCard, { maxHeight: '80%' }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>🛡️ প্রাইভেসি পলিসি</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-circle" size={28} color={Colors.subText} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.privacyText}>
            আমরা আপনার ব্যক্তিগত তথ্যকে সম্মান করি এবং তা সুরক্ষিত রাখি।{'\n\n'}
            📌 *তথ্য সংগ্রহ:* আমরা শুধুমাত্র প্রয়োজনীয় তথ্য (নাম, ইমেইল, ফোন) সংগ্রহ করি।{'\n\n'}
            📌 *তথ্য ব্যবহার:* সংগৃহীত তথ্য শুধুমাত্র অ্যাপের সেবা উন্নত করতে ব্যবহার করা হয়।{'\n\n'}
            📌 *তৃতীয় পক্ষ:* আমরা কখনো আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।{'\n\n'}
            📌 *নিরাপত্তা:* আপনার ডাটা এনক্রিপ্টেড সার্ভারে সংরক্ষণ করা হয়।{'\n\n'}
            📌 *যোগাযোগ:* যেকোনো প্রশ্নে support@app.com এ যোগাযোগ করুন।
          </Text>
        </ScrollView>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>বুঝেছি</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ✅ হেল্প সাপোর্ট মোডাল
const HelpModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>🎧 হেল্প সাপোর্ট</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-circle" size={28} color={Colors.subText} />
          </TouchableOpacity>
        </View>

        {[
          { icon: 'logo-whatsapp', label: 'WhatsApp সাপোর্ট', sub: '+880 1700-000000', color: '#25D366', action: () => Linking.openURL('https://wa.me/8801812323466') },
          { icon: 'mail-outline', label: 'ইমেইল সাপোর্ট', sub: 'support@app.com', color: Colors.blue, action: () => Linking.openURL('mailto:support@app.com') },
          { icon: 'logo-facebook', label: 'Facebook পেজ', sub: 'facebook.com/app', color: '#1877F2', action: () => Linking.openURL('https://facebook.com') },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.helpItem} onPress={item.action}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.helpLabel}>{item.label}</Text>
              <Text style={styles.helpSub}>{item.sub}</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#b2bec3" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </Modal>
);

// ==========================================
// ✅ মূল Settings স্ক্রিন
// ==========================================
export default function SettingsScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Header অ্যানিমেশন
  const headerAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      '🚪 লগ আউট',
      'আপনি কি সত্যিই লগ আউট করতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'লগ আউট',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={[Colors.bgStart, Colors.bgEnd]} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgStart} />
      <SafeAreaView style={{ flex: 1 }}>

        {/* ✅ Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚙️ সেটিংস</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ অ্যাকাউন্ট সেকশন */}
          <Text style={styles.sectionLabel}>অ্যাকাউন্ট</Text>

          <SettingItem
            icon="lock-closed-outline"
            label="পাসওয়ার্ড পরিবর্তন"
            sublabel="আপনার পাসওয়ার্ড আপডেট করুন"
            iconBg="#EFF6FF"
            color={Colors.blue}
            delay={100}
            onPress={() => setShowPassword(true)}
          />

          <SettingItem
            icon="shield-checkmark-outline"
            label="প্রাইভেসি পলিসি"
            sublabel="আমাদের ডাটা নীতি জানুন"
            iconBg="#F0FDF4"
            color={Colors.green}
            delay={200}
            onPress={() => setShowPrivacy(true)}
          />

          {/* ✅ সাপোর্ট সেকশন */}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>সাপোর্ট</Text>

          <SettingItem
            icon="help-circle-outline"
            label="হেল্প সাপোর্ট"
            sublabel="আমাদের সাথে যোগাযোগ করুন"
            iconBg="#FFF7ED"
            color={Colors.orange}
            delay={300}
            onPress={() => setShowHelp(true)}
          />

          <SettingItem
            icon="star-outline"
            label="অ্যাপ রেটিং দিন"
            sublabel="আমাদের রিভিউ করুন"
            iconBg="#FFFBEB"
            color="#F59E0B"
            delay={400}
            onPress={() => Alert.alert('⭐ রেটিং', 'ধন্যবাদ! Play Store খুলছে...')}
          />

          {/* ✅ অ্যাপ তথ্য সেকশন */}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>অ্যাপ তথ্য</Text>

          <SettingItem
            icon="information-circle-outline"
            label="অ্যাপ ভার্সন"
            sublabel="v1.0.0"
            iconBg="#F5F3FF"
            color={Colors.purple}
            delay={500}
            onPress={() => {}}
            rightElement={
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>v1.0.0</Text>
              </View>
            }
          />

          {/* ✅ লগআউট বাটন */}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>একাউন্ট</Text>

          <SettingItem
            icon="log-out-outline"
            label="লগ আউট"
            sublabel="আপনার একাউন্ট থেকে বের হন"
            iconBg="#FFF1F0"
            color={Colors.red}
            delay={600}
            onPress={handleLogout}
          />

          {/* ✅ Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with ❤️ in Bangladesh</Text>
            <Text style={styles.footerSub}>© 2025 আপনার অ্যাপ। সর্বস্বত্ব সংরক্ষিত।</Text>
          </View>
        </ScrollView>

        {/* ✅ মোডালগুলো */}
        <ChangePasswordModal visible={showPassword} onClose={() => setShowPassword(false)} />
        <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
        <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  backBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  body: { paddingHorizontal: 20, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.subText,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: '#0984E3',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextWrap: { flex: 1, marginLeft: 14 },
  itemLabel: { fontSize: 15, fontWeight: '700' },
  itemSublabel: { fontSize: 12, color: Colors.subText, marginTop: 2 },

  versionBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  versionText: { color: Colors.purple, fontWeight: '700', fontSize: 12 },

  // Footer
  footer: { alignItems: 'center', marginTop: 30 },
  footerText: { color: Colors.subText, fontSize: 13, fontWeight: '600' },
  footerSub: { color: '#b2bec3', fontSize: 11, marginTop: 4 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 36,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },

  // Password Input
  passInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  passInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.primary },

  modalBtn: { marginTop: 6, borderRadius: 16, overflow: 'hidden' },
  modalBtnGradient: { padding: 17, alignItems: 'center' },
  modalBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Privacy
  privacyText: { color: Colors.subText, fontSize: 14, lineHeight: 24 },
  closeBtn: {
    marginTop: 20,
    backgroundColor: Colors.blue,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
  },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },

  // Help
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpLabel: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  helpSub: { fontSize: 12, color: Colors.subText, marginTop: 2 },
});