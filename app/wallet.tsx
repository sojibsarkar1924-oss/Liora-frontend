/**
 * app/wallet.tsx
 * বটম ন্যাভিগেশনের "ওয়ালেট" — এখানেই উইথড্র করার সিস্টেম।
 * আগে এই রুটে কোনো ফাইল ছিল না, তাই কালো/খালি স্ক্রিন দেখাচ্ছিল।
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useBalance } from '../context/BalanceContext';

const MIN_WITHDRAW = 1290; // ন্যূনতম উইথড্র পরিমাণ (ইউজারের অনুরোধে ১২৯০ করা হয়েছে)

const METHODS = [
  { key: 'bkash', label: 'bKash' },
];

function formatMoney(amount: number) {
  const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const fixed = Number(amount).toFixed(2);
  const [intPart, decimalPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const english = `${withCommas}.${decimalPart}`;
  const bengali = english.replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);
  return `৳ ${bengali}`;
}

export default function WalletScreen() {
  const router = useRouter();
  const { balance, withdraw } = useBalance();

  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bkash');
  const [number, setNumber] = useState('');
  const [history, setHistory] = useState<
    { id: string; amount: number; method: string; number: string; date: string }[]
  >([]);

  const handleWithdrawRequest = async () => {
    const amountNum = Number(amount);

    if (!amountNum || amountNum <= 0) {
      Alert.alert('ভুল পরিমাণ', 'সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }
    if (amountNum < MIN_WITHDRAW) {
      Alert.alert('সর্বনিম্ন সীমা', `সর্বনিম্ন ৳${MIN_WITHDRAW} উইথড্র করা যাবে।`);
      return;
    }
    if (!number.trim()) {
      Alert.alert('নম্বর দিন', 'আপনার মোবাইল নম্বর লিখুন।');
      return;
    }
    if (amountNum > balance) {
      Alert.alert('অপর্যাপ্ত ব্যালেন্স', 'আপনার ব্যালেন্সে যথেষ্ট টাকা নেই।');
      return;
    }

    const success = await withdraw(amountNum);
    if (!success) {
      Alert.alert('ব্যর্থ', 'উইথড্র করা যায়নি, আবার চেষ্টা করুন।');
      return;
    }

    setHistory((prev) => [
      {
        id: String(Date.now()),
        amount: amountNum,
        method: selectedMethod,
        number: number.trim(),
        date: new Date().toLocaleDateString('en-GB'),
      },
      ...prev,
    ]);

    Alert.alert(
      'রিকোয়েস্ট পাঠানো হয়েছে ✅',
      `৳${amountNum} উইথড্র রিকোয়েস্ট জমা হয়েছে। এডমিন যাচাই করে টাকা পাঠাবে।`
    );

    setAmount('');
    setNumber('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ওয়ালেট / উইথড্র</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ব্যালেন্স কার্ড */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>বর্তমান ব্যালেন্স</Text>
          <Text style={styles.balanceAmount}>{formatMoney(balance)}</Text>
        </View>

        {/* পরিমাণ ইনপুট */}
        <Text style={styles.fieldLabel}>উইথড্র পরিমাণ (৳)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder={`সর্বনিম্ন ৳${MIN_WITHDRAW}`}
          placeholderTextColor="#5a5f8a"
          keyboardType="numeric"
        />

        {/* মেথড বাছাই */}
        <Text style={styles.fieldLabel}>মেথড বাছাই করুন</Text>
        <View style={styles.methodRow}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.methodButton,
                selectedMethod === m.key && styles.methodButtonActive,
              ]}
              onPress={() => setSelectedMethod(m.key)}
            >
              <Text
                style={[
                  styles.methodText,
                  selectedMethod === m.key && styles.methodTextActive,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* নম্বর ইনপুট */}
        <Text style={styles.fieldLabel}>মোবাইল নম্বর</Text>
        <TextInput
          style={styles.input}
          value={number}
          onChangeText={setNumber}
          placeholder="01XXXXXXXXX"
          placeholderTextColor="#5a5f8a"
          keyboardType="phone-pad"
          maxLength={11}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleWithdrawRequest}>
          <Text style={styles.submitButtonText}>উইথড্র রিকোয়েস্ট পাঠান</Text>
        </TouchableOpacity>

        {/* হিস্ট্রি */}
        {history.length > 0 && (
          <>
            <Text style={styles.historyTitle}>সাম্প্রতিক রিকোয়েস্ট</Text>
            {history.map((h) => (
              <View key={h.id} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyAmount}>{formatMoney(h.amount)}</Text>
                  <Text style={styles.historySub}>
                    {h.method} • {h.number} • {h.date}
                  </Text>
                </View>
                <Text style={styles.historyStatus}>পেন্ডিং</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b0b18' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  balanceCard: {
    borderWidth: 1.5,
    borderColor: '#00d2ff',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    marginBottom: 20,
  },
  balanceLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  balanceAmount: { color: '#fff', fontSize: 30, fontWeight: 'bold' },

  fieldLabel: { color: '#cfd3ff', fontSize: 13, marginBottom: 8, marginTop: 14 },
  input: {
    borderWidth: 1.5,
    borderColor: '#3d4a8f',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#12132a',
  },

  methodRow: { flexDirection: 'row', gap: 10 },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#12132a',
    borderWidth: 1.5,
    borderColor: '#3d4a8f',
  },
  methodButtonActive: { borderColor: '#00d2ff', backgroundColor: '#0f2a35' },
  methodText: { color: '#9aa0c7', fontWeight: 'bold' },
  methodTextActive: { color: '#00d2ff' },

  submitButton: {
    backgroundColor: '#00d2ff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: { color: '#0b0b18', fontWeight: 'bold', fontSize: 16 },

  historyTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginTop: 30, marginBottom: 12 },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#12132a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2f5c',
  },
  historyAmount: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  historySub: { color: '#9aa0c7', fontSize: 12, marginTop: 2 },
  historyStatus: { color: '#ffb300', fontWeight: 'bold', fontSize: 12 },
});