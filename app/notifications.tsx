import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#D4E4F7', '#F3F8FF']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>নোটিফিকেশন</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <NotificationCard title="নতুন আপডেট" body="অ্যাপে এখন নতুন পেমেন্ট মেথড যোগ করা হয়েছে।" time="১০ মিনিট আগে" />
          <NotificationCard title="উইথড্র সফল" body="আপনার ৫০০ টাকা উইথড্র রিকোয়েস্ট সফল হয়েছে।" time="২ ঘণ্টা আগে" />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const NotificationCard = ({ title, body, time }) => (
  <View style={styles.card}>
    <Ionicons name="notifications" size={24} color="#0984E3" />
    <View style={{ marginLeft: 15, flex: 1 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{title}</Text>
      <Text style={{ color: '#636E72', fontSize: 13, marginTop: 3 }}>{body}</Text>
      <Text style={{ fontSize: 10, color: '#b2bec3', marginTop: 5 }}>{time}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 10 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center' }
});