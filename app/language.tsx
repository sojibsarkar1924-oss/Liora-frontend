import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Colors = {
  bg: '#0B0F19',
  card: '#131A2A',
  primaryText: '#FFFFFF',
  secondaryText: '#9AA5B8',
  accent: '#E6C34A',
} as const;

type Lang = 'bn' | 'en';

const OPTIONS: { code: Lang; label: string; native: string }[] = [
  { code: 'bn', label: 'Bangla', native: 'বাংলা' },
  { code: 'en', label: 'English', native: 'English' },
];

export default function LanguageScreen() {
  const router = useRouter();
  // ⚠️ এখানে সিলেক্ট করা ভাষাটি আপনার i18n সিস্টেম (যেমন i18next বা AsyncStorage)-এ
  // সেভ করতে হবে যাতে পুরো অ্যাপে প্রয়োগ হয়
  const [selected, setSelected] = useState<Lang>('bn');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Language</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.body}>
          {OPTIONS.map((opt) => {
            const active = selected === opt.code;
            return (
              <TouchableOpacity
                key={opt.code}
                style={[styles.row, active && styles.rowActive]}
                onPress={() => setSelected(opt.code)}
              >
                <View>
                  <Text style={styles.rowTitle}>{opt.native}</Text>
                  <Text style={styles.rowSub}>{opt.label}</Text>
                </View>
                <Ionicons
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={active ? Colors.accent : Colors.secondaryText}
                />
              </TouchableOpacity>
            );
          })}
        </View>
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
  body: { paddingHorizontal: 16, paddingTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowActive: { borderColor: Colors.accent },
  rowTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  rowSub: { color: Colors.secondaryText, fontSize: 12.5 },
});