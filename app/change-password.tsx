import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'https://liora-backend-nmx8.onrender.com/api';

const Colors = {
  bg: '#0B0F19',
  card: '#131A2A',
  primaryText: '#FFFFFF',
  secondaryText: '#9AA5B8',
  accent: '#B389FF',
  danger: '#FF6B5B',
} as const;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext) as any;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('তথ্য অসম্পূর্ণ', 'সবগুলো ফিল্ড পূরণ করুন।');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('দুর্বল পাসওয়ার্ড', 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('মিলছে না', 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড এক নয়।');
      return;
    }

    const userId = auth?.userData?.id || auth?.userData?._id;
    if (!userId) {
      Alert.alert('সমস্যা হয়েছে', 'ইউজার সনাক্ত করা যায়নি, আবার লগইন করুন।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/${userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Alert.alert('ব্যর্থ হয়েছে', data?.message || 'বর্তমান পাসওয়ার্ড সঠিক নয়।');
        return;
      }

      Alert.alert('সফল হয়েছে', 'আপনার পাসওয়ার্ড পরিবর্তন হয়েছে।', [
        { text: 'ঠিক আছে', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('নেটওয়ার্ক সমস্যা', 'ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.backBtn} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.body}
        >
          <Text style={styles.label}>বর্তমান পাসওয়ার্ড</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="বর্তমান পাসওয়ার্ড লিখুন"
              placeholderTextColor="#5A6478"
              secureTextEntry={!showCurrent}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity onPress={() => setShowCurrent((s) => !s)}>
              <Ionicons
                name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.secondaryText}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>নতুন পাসওয়ার্ড</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="নতুন পাসওয়ার্ড লিখুন"
              placeholderTextColor="#5A6478"
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNew((s) => !s)}>
              <Ionicons
                name={showNew ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.secondaryText}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>কনফার্ম নতুন পাসওয়ার্ড</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="আবার নতুন পাসওয়ার্ড লিখুন"
              placeholderTextColor="#5A6478"
              secureTextEntry={!showNew}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>পাসওয়ার্ড পরিবর্তন করুন</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
  body: { paddingHorizontal: 20, paddingTop: 12 },
  label: { fontSize: 13, color: Colors.secondaryText, marginBottom: 8, marginTop: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  input: { flex: 1, color: '#FFF', fontSize: 15 },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  submitText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 15 },
});