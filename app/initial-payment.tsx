import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { submitDeposit } from '../services/api';

// ✅ Single fixed package — কোনো selection নেই
const PREMIUM = { id: 'Premium', name: 'WinWay Premium', price: 400, daily: 27, tasks: 9, perTask: 3 };

const BKASH_MERCHANT = '01636257147';

export default function InitialPaymentScreen() {
  const router = useRouter();
  const { userData } = useContext(AuthContext) as any;

  const [user,         setUser]         = useState<any>(null);
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId,        setTrxId]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (userData) { setUser(userData); return; }
        const stored = await AsyncStorage.getItem('userData');
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        console.error('loadUser error', e);
      }
    };
    loadUser();
  }, [userData]);

  const copyNumber = async () => {
    try {
      await Clipboard.setStringAsync(BKASH_MERCHANT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Error', 'Copy failed.');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }
    if (!senderNumber.trim()) {
      Alert.alert('Error', 'Enter your bKash number.');
      return;
    }
    if (senderNumber.trim().length < 11) {
      Alert.alert('Error', 'Enter a valid 11-digit number.');
      return;
    }
    if (!trxId.trim()) {
      Alert.alert('Error', 'Enter Transaction ID.');
      return;
    }

    setLoading(true);
    try {
      await submitDeposit({
        userId:       user._id || user.id,
        amount:       PREMIUM.price,
        method:       'Bkash',
        senderNumber: senderNumber.trim(),
        trxId:        trxId.trim(),
        packageId:    PREMIUM.id,
        packageName:  PREMIUM.name,
        packagePrice: PREMIUM.price,
        packageTasks: PREMIUM.tasks,
      });
      setSubmitted(true);
    } catch (error: any) {
      Alert.alert('Failed', error?.msg || error?.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submitted — Pending screen
  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
          <View style={styles.lockIcon}>
            <Ionicons name="time-outline" size={32} color="#F59E0B" />
          </View>
          <Text style={styles.headerTitle}>Request Submitted!</Text>
          <Text style={styles.headerSub}>
            Your account will be activated after admin verification
          </Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.pendingCard}>
            <View style={styles.pendingIconCircle}>
              <Ionicons name="hourglass-outline" size={52} color="#F59E0B" />
            </View>
            <Text style={styles.pendingTitle}>Waiting for Approval</Text>
            <Text style={styles.pendingSubtitle}>
              Your payment request has been submitted successfully.
            </Text>

            <View style={styles.pendingInfoBox}>
              <View style={styles.pendingRow}>
                <Ionicons name="star-outline" size={18} color="#6C5CE7" />
                <Text style={styles.pendingLabel}>Package</Text>
                <Text style={styles.pendingValue}>{PREMIUM.name}</Text>
              </View>
              <View style={styles.pendingRow}>
                <Ionicons name="cash-outline" size={18} color="#6C5CE7" />
                <Text style={styles.pendingLabel}>Amount</Text>
                <Text style={styles.pendingValue}>{'৳' + PREMIUM.price}</Text>
              </View>
              <View style={styles.pendingRow}>
                <Ionicons name="phone-portrait-outline" size={18} color="#6C5CE7" />
                <Text style={styles.pendingLabel}>bKash Number</Text>
                <Text style={styles.pendingValue}>{senderNumber}</Text>
              </View>
              <View style={styles.pendingRow}>
                <Ionicons name="receipt-outline" size={18} color="#6C5CE7" />
                <Text style={styles.pendingLabel}>TrxID</Text>
                <Text style={styles.pendingValue}>{trxId}</Text>
              </View>
            </View>

            <View style={styles.stepsList}>
              <View style={styles.stepsItem}>
                <View style={[styles.stepsDot, { backgroundColor: '#00B894' }]} />
                <Text style={styles.stepsItemText}>Request submitted ✅</Text>
              </View>
              <View style={styles.stepsItem}>
                <View style={[styles.stepsDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.stepsItemText}>Admin verifying ⏳</Text>
              </View>
              <View style={styles.stepsItem}>
                <View style={[styles.stepsDot, { backgroundColor: '#94a3b8' }]} />
                <Text style={styles.stepsItemText}>Account will be activated</Text>
              </View>
            </View>

            <Text style={styles.pendingNote}>
              Approved within 24 hours. Refresh the app to check.
            </Text>

            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => router.replace('/')}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh-outline" size={20} color="white" />
              <Text style={styles.refreshBtnText}>Go Home / Refresh</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      {/* Header */}
      <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={32} color="#F59E0B" />
        </View>
        <Text style={styles.headerTitle}>Account Activation</Text>
        <Text style={styles.headerSub}>
          {'Welcome ' + (user?.name ?? 'User') + '!\nActivate your account with a payment.'}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Steps Guide */}
        <View style={styles.stepsBox}>
          <Text style={styles.stepsTitle}>Payment Instructions</Text>
          <Text style={styles.stepText}>1. Send payment to the bKash merchant number below</Text>
          <Text style={styles.stepText}>2. Enter your bKash number and TrxID</Text>
          <Text style={styles.stepText}>3. Submit — admin will verify within 24 hours</Text>
        </View>

        {/* bKash Merchant */}
        <View style={styles.bkashCard}>
          <View style={styles.bkashHeader}>
            <View style={styles.bkashLogo}>
              <Text style={styles.bkashLogoText}>bKash</Text>
            </View>
            <View style={styles.merchantBadge}>
              <Text style={styles.merchantBadgeText}>Merchant</Text>
            </View>
          </View>

          <Text style={styles.bkashLabel}>Send payment to:</Text>
          <TouchableOpacity style={styles.bkashNumberRow} onPress={copyNumber} activeOpacity={0.8}>
            <Text style={styles.bkashNumber}>{BKASH_MERCHANT}</Text>
            <View style={[styles.copyBtn, copied && styles.copyBtnDone]}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="white" />
              <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bkashNote}>
            <Ionicons name="information-circle-outline" size={16} color="#E2136E" />
            <Text style={styles.bkashNoteText}>
              bKash App → Pay → Merchant → Enter number → Enter amount
            </Text>
          </View>
        </View>

        {/* ✅ Fixed Premium Package Info — কোনো selection নেই */}
        <View style={styles.premiumBox}>
          <View style={styles.premiumHeader}>
            <Ionicons name="star" size={20} color="#F4C430" />
            <Text style={styles.premiumTitle}>{PREMIUM.name}</Text>
          </View>
          <View style={styles.premiumGrid}>
            <View style={styles.premiumItem}>
              <Text style={styles.premiumItemLabel}>Price</Text>
              <Text style={[styles.premiumItemValue, { color: '#E2136E' }]}>{'৳' + PREMIUM.price}</Text>
            </View>
            <View style={styles.premiumItem}>
              <Text style={styles.premiumItemLabel}>Daily Income</Text>
              <Text style={[styles.premiumItemValue, { color: '#059669' }]}>{'৳' + PREMIUM.daily}</Text>
            </View>
            <View style={styles.premiumItem}>
              <Text style={styles.premiumItemLabel}>Tasks/Day</Text>
              <Text style={[styles.premiumItemValue, { color: '#0984E3' }]}>{PREMIUM.tasks}</Text>
            </View>
            <View style={styles.premiumItem}>
              <Text style={styles.premiumItemLabel}>Per Task</Text>
              <Text style={[styles.premiumItemValue, { color: '#6C5CE7' }]}>{'৳' + PREMIUM.perTask}</Text>
            </View>
          </View>
        </View>

        {/* Payment Form */}
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Your bKash Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="phone-portrait-outline" size={20} color="#E2136E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="01812323466"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={senderNumber}
              onChangeText={setSenderNumber}
              maxLength={11}
            />
          </View>

          <Text style={styles.inputLabel}>Transaction ID (TrxID)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="receipt-outline" size={20} color="#E2136E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter TrxID"
              placeholderTextColor="#94a3b8"
              value={trxId}
              onChangeText={setTrxId}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#E2136E', '#C2185B']}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="white" />
                <Text style={styles.submitText}>Submit Payment</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.noteBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#0984E3" />
          <Text style={styles.noteText}>
            Your information is safe. Account will be activated within 24 hours after admin verification.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    alignItems: 'center', paddingTop: 30,
    paddingBottom: 30, paddingHorizontal: 20,
  },
  lockIcon: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  headerSub:   { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
  content:     { padding: 20, paddingBottom: 40 },

  stepsBox: {
    backgroundColor: '#EFF6FF', borderRadius: 14,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  stepsTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e40af', marginBottom: 10 },
  stepText:   { fontSize: 13, color: '#3730a3', marginBottom: 5, lineHeight: 20 },

  bkashCard: {
    backgroundColor: 'white', borderRadius: 16,
    padding: 18, marginBottom: 20, elevation: 4,
    shadowColor: '#E2136E', shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
    borderWidth: 1, borderColor: '#FCE7F3',
  },
  bkashHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  bkashLogo:       { backgroundColor: '#E2136E', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  bkashLogoText:   { color: 'white', fontWeight: 'bold', fontSize: 16 },
  merchantBadge:   { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  merchantBadgeText: { fontSize: 12, color: '#92400E', fontWeight: '600' },
  bkashLabel:      { fontSize: 13, color: '#64748b', marginBottom: 8 },
  bkashNumberRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF1F8', padding: 14, borderRadius: 12, marginBottom: 12,
  },
  bkashNumber:   { fontSize: 22, fontWeight: 'bold', color: '#E2136E', letterSpacing: 1 },
  copyBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2136E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 5 },
  copyBtnDone:   { backgroundColor: '#059669' },
  copyBtnText:   { color: 'white', fontSize: 12, fontWeight: '600' },
  bkashNote:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 4 },
  bkashNoteText: { flex: 1, fontSize: 12, color: '#9f1239', lineHeight: 18 },

  // ✅ Premium fixed package box
  premiumBox: {
    backgroundColor: 'rgba(108,92,231,0.08)',
    borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1.5, borderColor: 'rgba(108,92,231,0.25)',
  },
  premiumHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 14,
  },
  premiumTitle: { fontSize: 16, fontWeight: 'bold', color: '#6C5CE7' },
  premiumGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  premiumItem:  {
    width: '47%', backgroundColor: 'white',
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  premiumItemLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  premiumItemValue: { fontSize: 18, fontWeight: 'bold' },

  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },

  formCard: {
    backgroundColor: 'white', borderRadius: 16,
    padding: 16, marginBottom: 20, elevation: 2,
  },
  inputLabel:   { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 12, marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1e293b' },

  submitBtn: {
    borderRadius: 16, overflow: 'hidden',
    marginBottom: 16, elevation: 5,
    shadowColor: '#E2136E', shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
  },
  submitGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 18, gap: 10,
  },
  submitText: { color: 'white', fontSize: 17, fontWeight: 'bold' },

  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 12,
    padding: 14, gap: 10, borderWidth: 1, borderColor: '#BFDBFE',
  },
  noteText: { flex: 1, fontSize: 12, color: '#3b82f6', lineHeight: 18 },

  // Pending Screen
  pendingCard: {
    backgroundColor: 'white', borderRadius: 20,
    padding: 24, alignItems: 'center', elevation: 4, marginTop: 10,
  },
  pendingIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FEF3C7', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  pendingTitle:    { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 8, textAlign: 'center' },
  pendingSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  pendingInfoBox: {
    width: '100%', backgroundColor: '#f8fafc',
    borderRadius: 14, padding: 16, gap: 12, marginBottom: 20,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  pendingRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pendingLabel:  { flex: 1, fontSize: 13, color: '#64748b' },
  pendingValue:  { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  stepsList:     { width: '100%', gap: 10, marginBottom: 20 },
  stepsItem:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepsDot:      { width: 12, height: 12, borderRadius: 6 },
  stepsItemText: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
  pendingNote: {
    fontSize: 13, color: '#92400E', textAlign: 'center',
    backgroundColor: '#FEF3C7', padding: 12,
    borderRadius: 10, marginBottom: 20, lineHeight: 20,
  },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0984E3', borderRadius: 14,
    padding: 16, gap: 10, width: '100%',
  },
  refreshBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});