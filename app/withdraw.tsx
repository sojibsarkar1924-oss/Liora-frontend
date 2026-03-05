// WalletScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { requestWithdraw } from '../services/api';

const MIN_WITHDRAW = 400;

const METHODS = [
  { name: 'Bkash',  color: '#E2136E', icon: '📱' },
  { name: 'Nagad',  color: '#F7941D', icon: '💛' },
  { name: 'Rocket', color: '#8B008B', icon: '🚀' },
];

function parseErrorMessage(error: any): string {
  try {
    if (typeof error === 'string') {
      try { const p = JSON.parse(error); return p?.msg || p?.message || p?.error || error; }
      catch { return error; }
    }
    if (typeof error === 'object' && error !== null) {
      if (error.msg)     return error.msg;
      if (error.message) return error.message;
      if (error.error)   return error.error;
      const data = error?.response?.data;
      if (data) {
        if (typeof data === 'string') {
          try { const p = JSON.parse(data); return p?.msg || p?.message || data; } catch { return data; }
        }
        return data?.msg || data?.message || data?.error || 'সমস্যা হয়েছে।';
      }
    }
  } catch (_) {}
  return 'সার্ভার বা নেটওয়ার্ক সমস্যা। পরে চেষ্টা করুন।';
}

export default function WalletScreen() {
  const router = useRouter();

  const { userData, userToken, updateUserData } = useContext(AuthContext) as any;

  const [amount, setAmount] = useState('');
  const [number, setNumber] = useState('');
  const [method, setMethod] = useState('Bkash');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // to show submitted amount & method in modal (preserve even after clearing inputs)
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);
  const [submittedMethod, setSubmittedMethod] = useState<string | null>(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5,   useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const balance = Number(
    Math.max(
      Number(userData?.balance || 0),
      Number(userData?.wallet  || 0),
    ),
  );

  const handleWithdraw = async () => {
    if (!number.trim()) {
      return Alert.alert('⚠️ ত্রুটি', 'একাউন্ট নাম্বার দিন।');
    }
    if (number.trim().length < 11) {
      return Alert.alert('⚠️ ত্রুটি', 'সঠিক ১১ ডিজিটের নম্বর দিন।');
    }
    if (!amount.trim()) {
      return Alert.alert('⚠️ ত্রুটি', 'টাকার পরিমাণ দিন।');
    }

    const requestAmount = Number(amount);

    if (isNaN(requestAmount) || requestAmount <= 0) {
      return Alert.alert('⚠️ ত্রুটি', 'সঠিক পরিমাণ দিন।');
    }

    if (requestAmount < MIN_WITHDRAW) {
      return Alert.alert('⚠️ ত্রুটি', `সর্বনিম্ন ${MIN_WITHDRAW} টাকা তুলতে পারবেন।`);
    }

    if (requestAmount > balance) {
      return Alert.alert('⚠️ ত্রুটি', `পর্যাপ্ত ব্যালেন্স নেই। বর্তমান ব্যালেন্স: ৳${balance.toFixed(2)}`);
    }

    const userId = userData?._id || userData?.id;
    if (!userId) {
      return Alert.alert('⚠️ ত্রুটি', 'ইউজার তথ্য পাওয়া যায়নি। আবার লগইন করুন।');
    }

    setLoading(true);
    try {
      const response = await requestWithdraw(
        { userId, amount: requestAmount, method, number: number.trim() },
        userToken,
      );

      setLoading(false);

      if (response?.success === true) {
        // preserve data for modal
        setSubmittedAmount(requestAmount);
        setSubmittedMethod(method);

        // clear inputs
        setAmount('');
        setNumber('');
        setShowSuccess(true);

        // refresh user data
        if (updateUserData && userId) {
          updateUserData(userId).catch(() => {});
        }

        // auto close modal and navigate back after short delay
        setTimeout(() => {
          setShowSuccess(false);
          router.back();
        }, 2800);

      } else {
        Alert.alert('❌ ব্যর্থ', response?.msg || 'রিকোয়েস্ট প্রসেস করা যায়নি।');
      }

    } catch (error: any) {
      setLoading(false);
      Alert.alert('❌ সমস্যা হয়েছে', parseErrorMessage(error));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 আমার ওয়ালেট</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], marginBottom: 28 }}>
            <LinearGradient
              colors={['#D97706', '#F59E0B']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.balanceCard}
            >
              <Text style={styles.balanceLabel}>বর্তমান ব্যালেন্স</Text>
              <Text style={styles.balanceAmount}>৳ {balance.toFixed(2)}</Text>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceInfoRow}>
                <View style={styles.balanceInfoItem}>
                  <Ionicons name="arrow-down-circle-outline" size={15} color="#fef3c7" />
                  <Text style={styles.balanceInfoText}>সর্বনিম্ন: ৳{MIN_WITHDRAW}</Text>
                </View>
                <View style={styles.balanceInfoItem}>
                  <Ionicons name="time-outline" size={15} color="#fef3c7" />
                  <Text style={styles.balanceInfoText}>২৪-৪৮ ঘণ্টায় প্রসেস</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.sectionTitle}>উইথড্র মেথড সিলেক্ট করুন</Text>
            <View style={styles.methodContainer}>
              {METHODS.map((m) => {
                const isActive = method === m.name;
                return (
                  <TouchableOpacity
                    key={m.name}
                    style={[styles.methodBtn, isActive && { backgroundColor: m.color, borderColor: m.color }]}
                    onPress={() => setMethod(m.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.methodIcon}>{m.icon}</Text>
                    {isActive && <Ionicons name="checkmark-circle" size={13} color="white" style={{ marginRight: 3 }} />}
                    <Text style={[styles.methodText, isActive && { color: 'white' }]}>{m.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>একাউন্ট নাম্বার</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBg}>
                <Ionicons name="call-outline" size={18} color="#0984E3" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="017xxxxxxxx"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={number}
                onChangeText={setNumber}
                maxLength={11}
              />
              {number.length === 11 && <Ionicons name="checkmark-circle" size={22} color="#00B894" />}
            </View>

            <Text style={styles.label}>টাকার পরিমাণ</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBg}>
                <Text style={styles.takaIconText}>৳</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={`সর্বনিম্ন ${MIN_WITHDRAW} টাকা`}
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              {Number(amount) >= MIN_WITHDRAW && <Ionicons name="checkmark-circle" size={22} color="#00B894" />}
            </View>

            <Text style={styles.label}>দ্রুত সিলেক্ট</Text>
            <View style={styles.quickAmountRow}>
              {[400, 500, 1000, 2000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.quickBtn, amount === String(val) && styles.quickBtnActive]}
                  onPress={() => setAmount(String(val))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickBtnText, amount === String(val) && { color: 'white' }]}>
                    ৳{val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={['#059669', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.withdrawGradient}>
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="arrow-up-circle-outline" size={22} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.withdrawText}>টাকা তুলুন</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#3b82f6" />
              <Text style={styles.infoText}>
                রিকোয়েস্ট পেন্ডিং থাকলে ২৪-৪৮ ঘণ্টার মধ্যে প্রসেস হবে। সমস্যায় সাপোর্টে যোগাযোগ করুন।
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.lottieBackground}>
          <View style={styles.lottieCard}>
            <LottieView
              source={{ uri: 'https://lottie.host/93297ee4-469b-4396-8576-928d54630e62/p73s9Xw3f2.json' }}
              autoPlay
              loop={false}
              style={{ width: 160, height: 160 }}
            />
            <Text style={styles.successTitle}>✅ সফল হয়েছে!</Text>
            <Text style={styles.successSub}>আপনার উইথড্র রিকোয়েস্ট{'\n'}পেন্ডিং-এ রয়েছে।</Text>
            <View style={styles.successAmountBox}>
              <Text style={styles.successAmountText}>
                ৳{submittedAmount !== null ? submittedAmount : '0'} → {submittedMethod || method}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    elevation: 3,
  },
  backButton:    { padding: 10, borderRadius: 12, backgroundColor: '#f1f5f9' },
  headerTitle:   { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  content:       { padding: 20, paddingBottom: 50 },
  balanceCard:   { borderRadius: 24, padding: 28, elevation: 10 },
  balanceLabel:  { color: '#fde68a', fontSize: 15, fontWeight: '500', textAlign: 'center' },
  balanceAmount: { color: 'white', fontSize: 46, fontWeight: 'bold', textAlign: 'center', marginVertical: 8 },
  balanceDivider:{ height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 12 },
  balanceInfoRow:{ flexDirection: 'row', justifyContent: 'space-around' },
  balanceInfoItem:{ flexDirection: 'row', alignItems: 'center', marginRight: 5 },
  balanceInfoText:{ color: '#fef3c7', fontSize: 12 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#1e293b' },

  methodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },

  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },

  methodIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  methodText: { fontSize: 13, fontWeight: '600', color: '#334155' },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
    color: '#1e293b',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },

  input: { flex: 1, height: 46, fontSize: 15, color: '#0f172a' },

  inputIconBg: { marginRight: 8 },

  takaIconText: { fontSize: 16, fontWeight: 'bold', color: '#059669' },

  quickAmountRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },

  quickBtn: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  quickBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },

  quickBtnText: { fontWeight: '600', color: '#1e293b' },

  withdrawBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden' },

  withdrawGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  withdrawText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  infoBox: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },

  infoText: { flex: 1, fontSize: 12, color: '#64748b' },

  lottieBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  lottieCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: 260,
  },

  successTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 6 },

  successSub: { fontSize: 13, textAlign: 'center', color: '#64748b', marginTop: 4 },

  successAmountBox: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },

  successAmountText: { fontWeight: 'bold' },
});