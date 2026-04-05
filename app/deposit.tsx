import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  View
} from 'react-native';

const Colors = {
  bgGradientStart: '#D4E4F7',
  bgGradientEnd: '#F3F8FF',
  glassWhite: 'rgba(255, 255, 255, 0.45)',
  glassBorder: 'rgba(255, 255, 255, 0.7)',
  primaryText: '#2D3436',
  secondaryText: '#636E72',
  accentBlue: '#0984E3',
  accentGradientStart: '#74B9FF',
  accentGradientEnd: '#0984E3',
};

export default function DepositScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bkash');
  const [trxId, setTrxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // অ্যাডমিন নাম্বার (যেখানে টাকা পাঠাবে)
  const [adminNumber, setAdminNumber] = useState('');

useEffect(() => {
  fetch('https://liora-backend-nmx8.onrender.com/api/config/active-number')
    .then(res => res.json())
    .then(data => setAdminNumber(data.number))
    .catch(() => setAdminNumber('01636257147'));
}, []);


  const handleDeposit = () => {
    if (!amount || !trxId) {
      Alert.alert("ত্রুটি", "সব তথ্য দিন");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("সফল", "ডিপোজিট রিকোয়েস্ট পাঠানো হয়েছে", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }, 1500);
  };

  return (
    <LinearGradient colors={[Colors.bgGradientStart, Colors.bgGradientEnd]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        {/* হেডার */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.primaryText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ডিপোজিট</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* নির্দেশাবলি কার্ড */}
          <GlassView style={styles.infoCard}>
            <Text style={styles.infoTitle}>কিভাবে ডিপোজিট করবেন?</Text>
            <Text style={styles.infoText}>
              ১. নিচের নাম্বারে টাকা সেন্ড মানি করুন।{'\n'}
              ২. ট্রানজেকশন ID কপি করুন।{'\n'}
              ৩. নিচের ফর্মে তথ্য দিয়ে সাবমিট করুন।
            </Text>
            <View style={styles.numberBox}>
               <Text style={styles.adminNum}>{adminNumber}</Text>
               <Ionicons name="copy-outline" size={20} color={Colors.accentBlue} />
            </View>
          </GlassView>

          {/* মেথড */}
          <Text style={styles.sectionTitle}>মেথড সিলেক্ট করুন</Text>
          <View style={styles.methodGrid}>
            {['bkash', 'nagad', 'rocket'].map((item) => (
              <TouchableOpacity key={item} onPress={() => setMethod(item)} style={{ width: '30%' }}>
                <GlassView style={[styles.methodCard, method === item && styles.activeMethod]}>
                  <Text style={[styles.methodText, method === item && { color: '#FFF' }]}>
                    {item.toUpperCase()}
                  </Text>
                </GlassView>
              </TouchableOpacity>
            ))}
          </View>

          {/* ফর্ম */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>টাকার পরিমাণ</Text>
            <GlassView style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>৳</Text>
              <TextInput 
                style={styles.input} 
                placeholder="500" 
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </GlassView>

            <Text style={styles.inputLabel}>TrxID (ট্রানজেকশন আইডি)</Text>
            <GlassView style={styles.inputWrapper}>
              <Ionicons name="receipt-outline" size={20} color={Colors.secondaryText} style={{marginRight:10}}/>
              <TextInput 
                style={styles.input} 
                placeholder="Eg. 8HJS72..." 
                value={trxId}
                onChangeText={setTrxId}
              />
            </GlassView>
          </View>

          <TouchableOpacity onPress={handleDeposit} disabled={isLoading}>
            <LinearGradient colors={[Colors.accentGradientStart, Colors.accentGradientEnd]} style={styles.submitBtn}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>ডিপোজিট করুন</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- গ্লাস কম্পোনেন্ট ---
const GlassView = ({ children, style }) => (
  <View style={[styles.glassContainer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  glassContainer: {
    backgroundColor: Colors.glassWhite,
    borderColor: Colors.glassBorder,
    borderWidth: 1.5,
    borderRadius: 20,
    elevation: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  backBtn: { padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.5)' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.primaryText },
  
  infoCard: { padding: 20, marginBottom: 25, backgroundColor: 'rgba(255,255,255,0.6)' },
  infoTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: Colors.accentBlue },
  infoText: { fontSize: 13, color: Colors.secondaryText, lineHeight: 20, marginBottom: 15 },
  numberBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 10, borderRadius: 10 },
  adminNum: { fontSize: 18, fontWeight: 'bold', color: Colors.primaryText },

  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: Colors.primaryText },
  methodGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  methodCard: { height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 15 },
  activeMethod: { backgroundColor: Colors.accentBlue, borderColor: Colors.accentBlue },
  methodText: { fontSize: 12, fontWeight: 'bold', color: Colors.secondaryText },
  formContainer: { marginBottom: 30 },
  inputLabel: { marginBottom: 8, color: Colors.primaryText },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 55, marginBottom: 15 },
  input: { flex: 1, fontSize: 16, height: '100%' },
  currencySymbol: { fontSize: 20, marginRight: 10, fontWeight: 'bold' },
  submitBtn: { height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});