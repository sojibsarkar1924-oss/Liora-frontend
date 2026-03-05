import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// আপনার api ফাইল ঠিক আছে কিনা চেক করবেন
import { sendWithdrawRequest } from '../services/api';

export default function WalletScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [number, setNumber] = useState('');
  const [method, setMethod] = useState('Bkash'); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userData");
        if (storedData) setUser(JSON.parse(storedData));
      } catch (e) {
        console.error("User load error", e);
      }
    };
    loadUser();
  }, []);

  const handleWithdraw = async () => {
    // ভ্যালিডেশন
    if (!amount || !number) return Alert.alert("ত্রুটি", "সব তথ্য পূরণ করুন");
    if (number.length < 11) return Alert.alert("ত্রুটি", "সঠিক ১১ ডিজিটের নম্বর দিন");
    
    // ব্যালেন্স চেক
    const requestAmount = Number(amount);
    const currentBalance = Number(user?.balance || 0);

    if (requestAmount < 100) return Alert.alert("ত্রুটি", "সর্বনিম্ন ১০০ টাকা তুলতে পারবেন");
    if (requestAmount > currentBalance) return Alert.alert("ত্রুটি", "আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই");

    setLoading(true);

    try {
      // API কল
      const response = await sendWithdrawRequest({
        userId: user._id,
        amount: requestAmount,
        method: method,
        number: number
      });

      if (response.success) {
        // ১. ব্যালেন্স আপডেট করা
        const newBalance = response.newBalance; 
        
        // ২. ইউজারের লোকাল স্টোরেজ আপডেট করা (খুবই গুরুত্বপূর্ণ)
        const updatedUser = { ...user, balance: newBalance };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
        
        // ৩. স্টেট আপডেট
        setUser(updatedUser);
        setAmount(''); // ইনপুট ক্লিয়ার
        
        Alert.alert("সফল!", "আপনার উইথড্র রিকোয়েস্ট গ্রহণ করা হয়েছে।", [
            { text: "ঠিক আছে", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("ব্যর্থ", response.msg || "রিকোয়েস্ট প্রসেস করা যায়নি");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("ব্যর্থ", error.msg || "সার্ভার বা নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>আমার ওয়ালেট</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>বর্তমান ব্যালেন্স</Text>
            <Text style={styles.balanceAmount}>৳ {user?.balance ? Number(user.balance).toFixed(2) : "0.00"}</Text>
          </View>

          <Text style={styles.sectionTitle}>উইথড্র মেথড সিলেক্ট করুন</Text>
          <View style={styles.methodContainer}>
            {['Bkash', 'Nagad'].map((m) => (
              <TouchableOpacity 
                key={m} 
                style={[styles.methodBtn, method === m && styles.activeMethod]}
                onPress={() => setMethod(m)}
              >
                {method === m && <Ionicons name="checkmark-circle" size={18} color="white" style={{marginRight: 5}} />}
                <Text style={[styles.methodText, method === m && styles.activeText]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>একাউন্ট নাম্বার</Text>
          <TextInput
            style={styles.input}
            placeholder="017xxxxxxxx"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={number}
            onChangeText={setNumber}
            maxLength={11}
          />

          <Text style={styles.label}>টাকার পরিমাণ</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 100"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <TouchableOpacity 
            style={[styles.withdrawBtn, loading && {opacity: 0.7}]} 
            onPress={handleWithdraw}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.withdrawText}>টাকা তুলুন</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  content: { padding: 20 },
  
  balanceCard: {
    backgroundColor: '#D97706', borderRadius: 20, padding: 30,
    alignItems: 'center', marginBottom: 30, elevation: 8, shadowColor: '#D97706', shadowOpacity: 0.4
  },
  balanceLabel: { color: '#fde68a', fontSize: 16, marginBottom: 8, fontWeight: '500' },
  balanceAmount: { color: 'white', fontSize: 40, fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginLeft: 5 },
  
  methodContainer: { flexDirection: 'row', marginBottom: 25 },
  methodBtn: {
    flex: 1, padding: 14, borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', 
    marginRight: 12, backgroundColor: '#fff', flexDirection: 'row'
  },
  activeMethod: { backgroundColor: '#D97706', borderColor: '#D97706' },
  methodText: { fontWeight: '700', color: '#64748b' },
  activeText: { color: 'white' },
  
  input: {
    backgroundColor: 'white', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 20, fontSize: 16, color: '#1e293b'
  },
  withdrawBtn: {
    backgroundColor: '#059669', padding: 18, borderRadius: 16,
    alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: '#059669', shadowOpacity: 0.3
  },
  withdrawText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});