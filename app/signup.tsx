import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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
import { PACKAGES } from '../constants/packages';
import { registerUser } from '../services/api';

const { width } = Dimensions.get('window');

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

const BONUS_PER_MEMBER = 10;

// ✅ InputField কে component এর বাইরে নেওয়া হয়েছে — এটাই মূল সমাধান
const InputField = ({
  icon, placeholder, value, onChangeText,
  keyboardType = 'default' as any,
  autoCapitalize = 'none' as any,
  secure = false, showToggle = false, onToggle,
  hint,
}: any) => (
  <View>
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

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [referralCode,    setReferralCode]    = useState('');
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [loading,         setLoading]         = useState(false);
  const [step,            setStep]            = useState(1);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const stepAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5,   useNativeDriver: true }),
    ]).start();
  }, []);

  const goToStep = (s: number) => {
    Animated.sequence([
      Animated.timing(stepAnim, { toValue: 40, duration: 150, useNativeDriver: true }),
      Animated.timing(stepAnim, { toValue: 0,  duration: 300, useNativeDriver: true }),
    ]).start();
    setStep(s);
  };

  const handleNextStep = () => {
    if (!name.trim())                         return Alert.alert('⚠️', 'আপনার নাম দিন।');
    if (!email.trim() || !email.includes('@')) return Alert.alert('⚠️', 'সঠিক ইমেইল দিন।');
    if (password.length < 6)                  return Alert.alert('⚠️', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর।');
    if (!referralCode.trim())                 return Alert.alert('⚠️', 'রেফার কোড দিন।');
    goToStep(2);
  };

  const handleSignup = async () => {
    if (!selectedPackage) {
      return Alert.alert('⚠️', 'একটি প্যাকেজ বেছে নিন।');
    }
    setLoading(true);
    try {
      const response = await registerUser({
        name:           name.trim(),
        email:          email.trim(),
        password,
        referralCode:   referralCode.toUpperCase().trim(),
        packageDetails: selectedPackage,
      });

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

      Alert.alert(
        '🎉 রেজিস্ট্রেশন সফল!',
        `স্বাগতম ${name}!\n\nএকাউন্ট সক্রিয় করতে প্যাকেজ পেমেন্ট করুন।`,
        [{
          text: 'পেমেন্ট করুন →',
          onPress: () => router.replace({
            pathname: '/initial-payment',
            params: {
              amount:    selectedPackage.price,
              packageId: selectedPackage.id,
            },
          } as any),
        }]
      );
    } catch (error: any) {
      Alert.alert(
        '❌ রেজিস্ট্রেশন ব্যর্থ',
        error?.msg || error?.message || 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[Colors.bgStart, Colors.bgEnd]} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgStart} />
      <SafeAreaView style={{ flex: 1 }}>

        {/* হেডার */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={() => step === 2 ? goToStep(1) : router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 1 ? '✨ নতুন একাউন্ট' : '📦 প্যাকেজ বেছে নিন'}
          </Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* স্টেপ ইন্ডিকেটর */}
        <Animated.View style={[styles.stepRow, { opacity: fadeAnim }]}>
          {[
            { num: '১', label: 'তথ্য',    active: true },
            { num: '২', label: 'প্যাকেজ', active: step === 2 },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <View style={[styles.stepLine, { backgroundColor: s.active ? Colors.blue : '#CBD5E1' }]} />
              )}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: s.active ? Colors.blue : '#CBD5E1' }]}>
                  <Text style={styles.stepNum}>{s.num}</Text>
                </View>
                <Text style={[styles.stepLabel, { color: s.active ? Colors.blue : '#CBD5E1' }]}>
                  {s.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </Animated.View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: stepAnim }] }}>

              {/* ============ স্টেপ ১: তথ্য ============ */}
              {step === 1 && (
                <View>
                  {/* লোগো */}
                  <View style={styles.logoCard}>
                    <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                      <LinearGradient
                        colors={[Colors.blue, Colors.purple]}
                        style={styles.logoGradient}
                      >
                        <Ionicons name="person-add" size={36} color="white" />
                      </LinearGradient>
                    </Animated.View>
                    <Text style={styles.logoTitle}>যোগ দিন</Text>
                    <Text style={styles.logoSub}>রেফার কোড দিয়ে শুরু</Text>
                  </View>

                  {/* টিম বোনাস ইনফো */}
                  <View style={styles.bonusInfoCard}>
                    <Text style={styles.bonusInfoTitle}>🎁 টিম বোনাস সিস্টেম</Text>
                    <Text style={styles.bonusInfoText}>
                      প্রতিটি নতুন সদস্যের জন্য ৳{BONUS_PER_MEMBER} বোনাস পাবেন{'\n'}
                      ১ জন = ৳১০ • ১০ জন = ৳১০০ • ১০০ জন = ৳১০০০
                    </Text>
                  </View>

                  {/* ফর্ম */}
                  <View style={styles.glassCard}>
                    <Text style={styles.sectionTitle}>📋 ব্যক্তিগত তথ্য</Text>

                    <Text style={styles.label}>আপনার নাম</Text>
                    <InputField
                      icon="person-outline"
                      placeholder="পুরো নাম লিখুন"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />

                    <Text style={styles.label}>ইমেইল</Text>
                    <InputField
                      icon="mail-outline"
                      placeholder="example@gmail.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                    />

                    <Text style={styles.label}>পাসওয়ার্ড</Text>
                    <InputField
                      icon="lock-closed-outline"
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      value={password}
                      onChangeText={setPassword}
                      secure={!showPass}
                      showToggle
                      onToggle={() => setShowPass(!showPass)}
                    />

                    <Text style={styles.label}>রেফার কোড (বাধ্যতামূলক)</Text>
                    <InputField
                      icon="gift-outline"
                      placeholder="রেফার কারির কোড দিন"
                      value={referralCode}
                      onChangeText={setReferralCode}
                      autoCapitalize="characters"
                      hint="যিনি আপনাকে invite করেছেন তার রেফার কোড দিন।"
                    />
                  </View>

                  {/* পরের ধাপ বাটন */}
                  <TouchableOpacity
                    onPress={handleNextStep}
                    activeOpacity={0.85}
                    style={styles.mainBtn}
                  >
                    <LinearGradient
                      colors={[Colors.blue, Colors.purple]}
                      style={styles.mainBtnGradient}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.mainBtnText}>পরের ধাপ</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.replace('/login' as any)}
                    style={styles.loginLink}
                  >
                    <Text style={styles.loginLinkText}>
                      আগে থেকে একাউন্ট আছে?{' '}
                      <Text style={{ color: Colors.blue, fontWeight: 'bold' }}>লগইন করুন</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ============ স্টেপ ২: প্যাকেজ ============ */}
              {step === 2 && (
                <View>
                  <Text style={styles.packageHeading}>মেম্বারশিপ প্যাকেজ</Text>
                  <Text style={styles.packageSubHeading}>
                    প্যাকেজ কিনলে দৈনিক কাজ করে আয় করতে পারবেন
                  </Text>

                  <View style={styles.packageGrid}>
                    {PACKAGES.map((pkg: any) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      return (
                        <TouchableOpacity
                          key={pkg.id}
                          style={[
                            styles.packageCard,
                            { borderColor: isSelected ? pkg.color : 'rgba(255,255,255,0.7)' },
                            isSelected && { backgroundColor: pkg.color + '18' },
                          ]}
                          onPress={() => setSelectedPackage(pkg)}
                          activeOpacity={0.85}
                        >
                          {isSelected && (
                            <View style={[styles.pkgBadge, { backgroundColor: pkg.color }]}>
                              <Ionicons name="checkmark" size={12} color="white" />
                            </View>
                          )}
                          <Text style={[styles.pkgName, { color: pkg.color }]}>{pkg.name}</Text>
                          <Text style={styles.pkgPrice}>৳{pkg.price}</Text>
                          <View style={styles.pkgDivider} />
                          <View style={styles.pkgRow}>
                            <Ionicons name="trending-up-outline" size={13} color={Colors.green} />
                            <Text style={styles.pkgRowText}>দৈনিক ৳{pkg.dailyIncome}</Text>
                          </View>
                          <View style={styles.pkgRow}>
                            <Ionicons name="checkmark-circle-outline" size={13} color={Colors.blue} />
                            <Text style={styles.pkgRowText}>{pkg.taskCount} কাজ/দিন</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    onPress={handleSignup}
                    disabled={loading || !selectedPackage}
                    activeOpacity={0.85}
                    style={[styles.mainBtn, (!selectedPackage || loading) && { opacity: 0.65 }]}
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
                          <Text style={styles.mainBtnText}>একাউন্ট তৈরি করুন</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

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
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16, gap: 8,
  },
  stepItem:   { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  stepNum:   { color: 'white', fontWeight: 'bold', fontSize: 14 },
  stepLabel: { fontSize: 11, fontWeight: '600' },
  stepLine:  { width: 60, height: 2, borderRadius: 1, marginBottom: 16 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  logoCard:    { alignItems: 'center', marginBottom: 20 },
  logoGradient: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, elevation: 8,
    shadowColor: Colors.blue, shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
  },
  logoTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  logoSub:   { fontSize: 13, color: Colors.subText, marginTop: 4 },
  bonusInfoCard: {
    backgroundColor: 'rgba(0,184,148,0.12)',
    borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(0,184,148,0.3)',
  },
  bonusInfoTitle: { fontSize: 14, fontWeight: '700', color: '#00B894', marginBottom: 6 },
  bonusInfoText:  { fontSize: 12, color: Colors.subText, lineHeight: 20 },
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
    marginBottom: 6, paddingHorizontal: 12,
    elevation: 2,
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
    padding: 10, gap: 6, marginBottom: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  hintText: { flex: 1, color: Colors.blue, fontSize: 12, lineHeight: 18 },
  mainBtn:         { borderRadius: 16, overflow: 'hidden', marginBottom: 16, elevation: 6 },
  mainBtnGradient: { padding: 17, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  mainBtnText:     { color: 'white', fontSize: 17, fontWeight: 'bold' },
  loginLink:     { alignItems: 'center', marginBottom: 20 },
  loginLinkText: { fontSize: 14, color: Colors.subText },
  packageHeading:    { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 6 },
  packageSubHeading: { fontSize: 13, color: Colors.subText, marginBottom: 20, lineHeight: 20 },
  packageGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 12, marginBottom: 24,
  },
  packageCard: {
    width: (width - 56) / 2,
    backgroundColor: Colors.glass,
    borderWidth: 2, borderRadius: 18,
    padding: 16, alignItems: 'center',
    elevation: 3, position: 'relative',
  },
  pkgBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  pkgName:    { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  pkgPrice:   { fontSize: 26, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  pkgDivider: { width: '100%', height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginBottom: 10 },
  pkgRow:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  pkgRowText: { fontSize: 12, color: Colors.subText, fontWeight: '600' },
});