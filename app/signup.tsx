import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
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
import { registerUser } from '../services/api';

const MEMBERSHIP_PRICE = 400;

const Colors = {
  bgStart: '#C8DFF7',
  bgEnd:   '#EEF5FF',
  blue:    '#0984E3',
  purple:  '#6C5CE7',
  green:   '#00B894',
  orange:  '#E17055',
  text:    '#1A2533',
  subText: '#636E72',
  glass:   'rgba(255,255,255,0.60)',
  border:  'rgba(255,255,255,0.80)',
};

const InputField = ({
  icon, placeholder, value, onChangeText,
  keyboardType = 'default' as any,
  autoCapitalize = 'none' as any,
  secure = false, showToggle = false, onToggle,
  hint,
}: any) => (
  <View style={{ marginBottom: 14 }}>
    <View style={styles.inputWrapper}>
      <View style={styles.inputIconBg}>
        <Ionicons name={icon} size={18} color={Colors.blue} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secure}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={{ padding: 4 }}>
          <Ionicons
            name={secure ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={Colors.subText}
          />
        </TouchableOpacity>
      )}
      {!showToggle && value.length > 0 && (
        <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
      )}
    </View>
    {hint && (
      <View style={styles.hintBox}>
        <Ionicons name="information-circle-outline" size={15} color={Colors.blue} />
        <Text style={styles.hintText}>{hint}</Text>
      </View>
    )}
  </View>
);

export default function SignupScreen() {
  const router = useRouter();

  const [name,         setName]         = useState('');
  const [password,     setPassword]     = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading,      setLoading]      = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5,   useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    if (!name.trim())          { Alert.alert('Warning', 'Your full name is required.');     return false; }
    if (password.length < 6)   { Alert.alert('Warning', 'Password must be 6+ characters.'); return false; }
    if (!referralCode.trim())  { Alert.alert('Warning', 'Referral code is required.');      return false; }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      // ✅ email নেই — শুধু name, password, referralCode
      const response = await registerUser({
  name:         name.trim(),
  password,
  referralCode: referralCode.toUpperCase().trim(),
}) as any;
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
      }
      if (response.user) {
        const balance = Math.max(response.user.balance ?? 0, response.user.wallet ?? 0);
        await AsyncStorage.setItem('userData', JSON.stringify({
          ...response.user,
          balance,
          wallet: balance,
        }));
      }

      // ✅ FIX: string concatenation — Bengali template literal encoding সমস্যা নেই
      const loginCode = response.user?.referralCode || '';
      const alertMsg =
        '\u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE ' + name + '!\n\n' +
        '\u0986\u09AA\u09A8\u09BE\u09B0 \u09B2\u0997\u0987\u09A8 \u0995\u09CB\u09A1:\n' +
        '\uD83D\uDCCC ' + loginCode + '\n\n' +
        '\u26A0\uFE0F \u098F\u0987 \u0995\u09CB\u09A1\u099F\u09BF \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u0995\u09B0\u09C1\u09A8 \u2014 login \u098F \u09B2\u09BE\u0997\u09AC\u09C7!\n\n' +
        '\u098F\u0996\u09A8 \u09F3' + MEMBERSHIP_PRICE + ' \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09C1\u09A8\u0964';

      Alert.alert(
        'Registration Successful!',
        alertMsg,
        [{
          text: 'Payment Now',
          onPress: () => router.replace({
            pathname: '/initial-payment',
            params:   { amount: MEMBERSHIP_PRICE },
          } as any),
        }]
      );

    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.msg || error?.message || 'Server error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[Colors.bgStart, Colors.bgEnd]} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgStart} />
      <SafeAreaView style={{ flex: 1 }}>

        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Account</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

              {/* Logo */}
              <View style={styles.logoCard}>
                <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                  <LinearGradient
                    colors={[Colors.blue, Colors.purple]}
                    style={styles.logoGradient}
                  >
                    <Ionicons name="person-add" size={36} color="white" />
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.logoTitle}>Join WinWay</Text>
                <Text style={styles.logoSub}>Start with a referral code</Text>
              </View>

              {/* Premium Package Info */}
              <View style={styles.premiumCard}>
                <View style={styles.premiumLeft}>
                  <Ionicons name="star" size={22} color="#F4C430" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.premiumName}>WinWay Premium</Text>
                    <Text style={styles.premiumDesc}>Single package • All benefits</Text>
                  </View>
                </View>
                <Text style={styles.premiumPrice}>{'৳' + MEMBERSHIP_PRICE}</Text>
              </View>

              {/* Bonus Info */}
              <View style={styles.bonusCard}>
                <Text style={styles.bonusTitle}>Bonus System</Text>
                <View style={styles.bonusRow}>
                  <Ionicons name="person" size={14} color={Colors.green} />
                  <Text style={styles.bonusText}>Direct referral bonus: 60 taka</Text>
                </View>
                <View style={styles.bonusRow}>
                  <Ionicons name="people" size={14} color={Colors.blue} />
                  <Text style={styles.bonusText}>Top 6 seniors get 10 taka each</Text>
                </View>
              </View>

              {/* Form */}
              <View style={styles.glassCard}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <Text style={styles.label}>Full Name</Text>
                <InputField
                  icon="person-outline"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Password</Text>
                <InputField
                  icon="lock-closed-outline"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secure={!showPass}
                  showToggle
                  onToggle={() => setShowPass(!showPass)}
                />

                <Text style={styles.label}>Referral Code (Required)</Text>
                <InputField
                  icon="gift-outline"
                  placeholder="Enter inviter's code"
                  value={referralCode}
                  onChangeText={setReferralCode}
                  autoCapitalize="characters"
                  hint="Enter the referral code of the person who invited you."
                />
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.85}
                style={[styles.mainBtn, loading && { opacity: 0.65 }]}
              >
                <LinearGradient
                  colors={[Colors.green, '#00CBA4']}
                  style={styles.mainBtnGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="rocket-outline" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.mainBtnText}>Create Account</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace('/login' as any)}
                style={styles.loginLink}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account?{' '}
                  <Text style={{ color: Colors.blue, fontWeight: 'bold' }}>Login</Text>
                </Text>
              </TouchableOpacity>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.glass, borderWidth: 1.5,
    borderColor: Colors.border, justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { padding: 20, paddingBottom: 60 },
  logoCard:     { alignItems: 'center', marginBottom: 20 },
  logoGradient: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, elevation: 8,
    shadowColor: Colors.blue, shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
  },
  logoTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  logoSub:   { fontSize: 13, color: Colors.subText, marginTop: 4 },
  premiumCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(108,92,231,0.10)',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: 'rgba(108,92,231,0.30)',
  },
  premiumLeft:  { flexDirection: 'row', alignItems: 'center' },
  premiumName:  { fontSize: 15, fontWeight: 'bold', color: Colors.purple },
  premiumDesc:  { fontSize: 11, color: Colors.subText, marginTop: 2 },
  premiumPrice: { fontSize: 22, fontWeight: 'bold', color: Colors.purple },
  bonusCard: {
    backgroundColor: 'rgba(0,184,148,0.10)',
    borderRadius: 16, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(0,184,148,0.25)',
  },
  bonusTitle: { fontSize: 13, fontWeight: '700', color: '#00B894', marginBottom: 8 },
  bonusRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  bonusText:  { fontSize: 12, color: Colors.subText },
  glassCard: {
    backgroundColor: Colors.glass,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 22, padding: 20, marginBottom: 20,
    elevation: 4, shadowColor: '#0984E3',
    shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  label:        { fontSize: 13, fontWeight: '600', color: Colors.subText, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 12, elevation: 2,
  },
  inputIconBg: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#EFF6FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 10,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.text },
  hintBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 10,
    padding: 10, gap: 6, marginTop: 6,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  hintText: { flex: 1, color: Colors.blue, fontSize: 12, lineHeight: 18 },
  mainBtn:         { borderRadius: 16, overflow: 'hidden', marginBottom: 16, elevation: 6 },
  mainBtnGradient: { padding: 17, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  mainBtnText:     { color: 'white', fontSize: 17, fontWeight: 'bold' },
  loginLink:     { alignItems: 'center', marginBottom: 20 },
  loginLinkText: { fontSize: 14, color: Colors.subText },
});