import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext, AuthProvider } from '../context/AuthContext';

const API_URL = 'https://liora-backend-production-74f1.up.railway.app/api';

function MaintenanceScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const spinAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 1000, useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1, duration: 3000, useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.maintContainer}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>

        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>L</Text>
        </View>

        <Text style={styles.appName}>Liora</Text>

        {/* Spinning icon */}
        <Animated.Text style={[styles.gearIcon, { transform: [{ rotate: spin }] }]}>
          ⚙️
        </Animated.Text>

        <Text style={styles.maintTitle}>সিস্টেম আপডেট চলছে</Text>

        <View style={styles.divider} />

        <Text style={styles.maintMsg}>
          আপনাকে আরও দ্রুত এবং উন্নত অভিজ্ঞতা দিতে আমাদের আপডেট চলছে। আমাদের সাথেই থাকুন, আমরা দ্রুতই ফিরে আসছি।
        </Text>

        <TouchableOpacity
          style={styles.telegramBtn}
          onPress={() => Linking.openURL('https://t.me/+EMlRsLJX1I42YTk1')}
        >
          <Text style={styles.telegramBtnText}>📢 Telegram এ আপডেট পান</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

function RouteGuard() {
  const { userToken, userData, isLoading } = useContext(AuthContext) as any;
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const currentPath = '/' + segments.join('/');
    const isLoggedIn = !!userToken && !!userData;

    if (!isLoggedIn) {
      if (currentPath === '/' || currentPath === '/index' || currentPath.startsWith('/signup')) return;
      router.replace('/');
      return;
    }

    const role   = userData?.role   || 'user';
    const status = userData?.status || 'pending';

    if (role === 'admin') {
      if (currentPath === '/' || currentPath === '/index' || currentPath.startsWith('/signup')) {
        router.replace('/admin/dashboard');
      }
      return;
    }

    if (status === 'pending') {
      if (currentPath !== '/initial-payment') router.replace('/initial-payment');
      return;
    }

    if (status === 'active') {
      if (currentPath === '/' || currentPath === '/index' || currentPath.startsWith('/signup') || currentPath === '/initial-payment') {
        router.replace('/home');
      }
      return;
    }

    router.replace('/');
  }, [userToken, userData, isLoading]);

  return null;
}

function AppContent() {
  const { isLoading } = useContext(AuthContext) as any;
  const [maintenance, setMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(API_URL + '/maintenance')
      .then(res => res.json())
      .then(data => {
        setMaintenance(data.maintenance);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  if (checking || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0984E3" />
      </View>
    );
  }

  if (maintenance) {
    return <MaintenanceScreen />;
  }

  return (
    <>
      <RouteGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="initial-payment" />
        <Stack.Screen name="home" />
        <Stack.Screen name="deposit" />
        <Stack.Screen name="withdraw" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="history" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="transfer" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="admin/withdraw-requests" />
        <Stack.Screen name="admin/payments" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  maintContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1120', padding: 30 },
  logoBox: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#0984E3', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { fontSize: 40, fontWeight: 'bold', color: 'white' },
  appName: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  gearIcon: { fontSize: 50, marginBottom: 16 },
  maintTitle: { fontSize: 22, fontWeight: 'bold', color: '#F59E0B', marginBottom: 16 },
  divider: { width: 60, height: 3, backgroundColor: '#0984E3', borderRadius: 2, marginBottom: 20 },
  maintMsg: { fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 26, marginBottom: 40 },
  telegramBtn: { backgroundColor: '#0984E3', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  telegramBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});