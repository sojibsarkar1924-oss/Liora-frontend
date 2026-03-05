import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthContext, AuthProvider } from '../context/AuthContext';

function RouteGuard() {
  const { userToken, userData, isLoading } = useContext(AuthContext) as any;
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const currentPath = '/' + segments.join('/');

    // ✅ FIXED: দুটোই null হলে লগইন নেই
    const isLoggedIn = !!userToken && !!userData;

    if (!isLoggedIn) {
      // login/signup page এ থাকলে ঠিক আছে
      if (
        currentPath === '/' ||
        currentPath === '/index' ||
        currentPath.startsWith('/signup')
      ) return;
      // অন্য page থেকে login এ পাঠাও
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
      if (currentPath !== '/initial-payment') {
        router.replace('/initial-payment');
      }
      return;
    }

    if (status === 'active') {
      if (
        currentPath === '/' ||
        currentPath === '/index' ||
        currentPath.startsWith('/signup') ||
        currentPath === '/initial-payment'
      ) {
        router.replace('/home');
      }
      return;
    }

    // banned
    router.replace('/');

  }, [userToken, userData, isLoading]);

  return null;
}

// ✅ FIXED: isLoading এর সময় Stack render হবে না
// আগে Stack সবসময় render হত → expo-router index page দেখিয়ে দিত → home এ চলে যেত
function AppContent() {
  const { isLoading } = useContext(AuthContext) as any;

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0984E3" />
      </View>
    );
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
});