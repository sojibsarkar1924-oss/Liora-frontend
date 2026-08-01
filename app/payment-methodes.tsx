import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import {
    Alert,
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
  bg: '#0B0F19',
  card: '#131A2A',
  primaryText: '#FFFFFF',
  secondaryText: '#9AA5B8',
} as const;

interface Method {
  key: string;
  name: string;
  color: string;
  numberField: 'bkashNumber' ;
}

const METHODS: Method[] = [
  { key: 'bkash', name: 'bKash', color: '#E2136E', numberField: 'bkashNumber' },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext) as any;
  const userData = auth?.userData || {};

  const handleEdit = (method: Method) => {
    // এখানে একটি নাম্বার এডিট মডাল/পেইজ যুক্ত করতে পারেন
    Alert.alert(
      `${method.name} নাম্বার আপডেট`,
      'এই ফিচারটি আপনার ব্যাকএন্ড এন্ডপয়েন্ট প্রস্তুত হলে যুক্ত করে দেবেন — এখানে userData আপডেট API কল হবে।'
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {METHODS.map((method) => {
            const number: string | undefined = userData?.[method.numberField];
            return (
              <View key={method.key} style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: method.color }]}>
                  <Ionicons name="card" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodNumber}>
                    {number ? number : 'নাম্বার যোগ করা হয়নি'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleEdit(method)} style={styles.editBtn}>
                  <Text style={styles.editText}>{number ? 'পরিবর্তন' : 'যোগ করুন'}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B2233',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primaryText },
  body: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodName: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  methodNumber: { color: Colors.secondaryText, fontSize: 12.5 },
  editBtn: {
    borderWidth: 1,
    borderColor: '#2E5BE0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: { color: '#4F8CFF', fontSize: 12, fontWeight: '600' },
});