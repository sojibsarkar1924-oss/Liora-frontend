import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    AppState,
    FlatList,
    Linking,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const API_URL = 'https://liora-backend-nmx8.onrender.com/api';

const STATUS_COLOR: any = {
  Pending:  { bg: '#FFF8E1', text: '#F59E0B', label: '⏳ Pending'  },
  Approved: { bg: '#E8FDF5', text: '#00B894', label: '✅ Approved' },
  Rejected: { bg: '#FFF0EE', text: '#E17055', label: '❌ Rejected' },
};

const METHOD_COLOR: any = {
  Bkash:  '#E2136E',
  Nagad:  '#F7941D',
  Rocket: '#8B008B',
};

export default function AdminWithdrawRequests() {
  const router = useRouter();
  const [requests,   setRequests]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId,   setActionId]   = useState<string | null>(null);
  const [pendingConfirmItem, setPendingConfirmItem] = useState<string | null>(null);

  // ✅ FIX: AppState দিয়ে bKash থেকে ফিরলে Confirm বাটন দেখাবে
  const appState = useRef(AppState.currentState);
  const bkashOpenedForItem = useRef<string | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (bkashOpenedForItem.current) {
          setPendingConfirmItem(bkashOpenedForItem.current);
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  const fetchRequests = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await fetch(API_URL + '/withdraw/admin/requests');
      const data     = await response.json();
      setRequests(data?.success && Array.isArray(data.data) ? data.data : []);
    } catch {
      Alert.alert('Error', 'Data load failed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchRequests(false); };

  const doAction = async (endpoint: string, id: string) => {
    setActionId(id);
    try {
      const res  = await fetch(API_URL + endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      });
      const data = await res.json();
      Alert.alert(data.success ? '✅ সফল!' : '❌ Failed', data.msg || '');
      if (data.success) fetchRequests(false);
    } catch {
      Alert.alert('Error', 'Network error.');
    } finally {
      setActionId(null);
    }
  };

  // ✅ FIX: নম্বর কপি + bKash Merchant খোলা
  const handleManualApprove = async (item: any) => {
    try {
      await Clipboard.setStringAsync(item.number);
    } catch {}

    Alert.alert(
      '💸 ম্যানুয়াল পেমেন্ট',
      `✅ নম্বর কপি হয়েছে!\n\n📱 ${item.method}: ${item.number}\n💰 পরিমাণ: ${item.amount} টাকা\n\nbKash Merchant অ্যাপ খুলে টাকা পাঠান।\nটাকা পাঠানো হলে ফিরে এসে "✅ Confirm" বাটন চাপুন।`,
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: '📲 bKash Merchant খুলুন',
          onPress: async () => {
            bkashOpenedForItem.current = item._id;
            setPendingConfirmItem(item._id);

            // ✅ FIX: সঠিক intent দিয়ে bKash Merchant খোলা
            try {
              await Linking.openURL('intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.bkash.merchantapp;end');
            } catch {
              try {
                await Linking.openURL('market://details?id=com.bkash.merchantapp');
              } catch {
                Alert.alert('⚠️', 'bKash Merchant খুলতে পারেনি। নম্বর কপি হয়েছে — ম্যানুয়ালি পাঠান।');
              }
            }
          },
        },
      ]
    );
  };

  const handleConfirmSent = (item: any) => {
    Alert.alert(
      '✅ নিশ্চিত করুন',
      `${item.amount} টাকা ${item.number} তে পাঠানো সম্পন্ন হয়েছে?\n\nConfirm করলে user এর withdraw status Approved হবে।`,
      [
        { text: 'না, এখনো না', style: 'cancel' },
        {
          text: 'হ্যাঁ, Confirm ✅',
          onPress: () => {
            bkashOpenedForItem.current = null;
            setPendingConfirmItem(null);
            doAction('/withdraw/admin/manual-approve', item._id);
          },
        },
      ]
    );
  };

  const handleReject = (item: any) => {
    Alert.alert(
      '❌ রিকোয়েস্ট বাতিল করবেন?',
      `${item.amount} টাকা user এর ব্যালেন্সে ফেরত যাবে।`,
      [
        { text: 'না', style: 'cancel' },
        {
          text: 'বাতিল করুন',
          style: 'destructive',
          onPress: () => doAction('/withdraw/admin/reject', item._id),
        },
      ]
    );
  };

  // ✅ নম্বরে চাপ দিলে কপি হবে
  const copyNumber = async (number: string) => {
    try {
      await Clipboard.setStringAsync(number);
      Alert.alert('✅ কপি হয়েছে!', number);
    } catch {
      Alert.alert('Error', 'কপি করতে ব্যর্থ।');
    }
  };

  const RequestCard = ({ item }: any) => {
    const isProcessing     = actionId === item._id;
    const isPendingConfirm = pendingConfirmItem === item._id;
    const statusInfo       = STATUS_COLOR[item.status] || STATUS_COLOR.Pending;
    const methodColor      = METHOD_COLOR[item.method] || '#333';
    const amountStr        = String(Math.floor(Number(item.amount) || 0));
    const balanceStr       = String(Math.floor(Number(item.userId?.balance ?? item.userId?.wallet ?? 0)));
    const dateStr          = item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : '-';

    return (
      <View style={styles.card}>

        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(item.userId?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.userName}>{item.userId?.name || 'Unknown'}</Text>
            <Text style={styles.userEmail}>{item.userId?.email || ''}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>পরিমাণ</Text>
            <Text style={styles.detailAmount}>৳{amountStr}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="phone-portrait-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Method</Text>
            <View style={[styles.methodBadge, { backgroundColor: methodColor + '18' }]}>
              <Text style={[styles.methodText, { color: methodColor }]}>{item.method}</Text>
            </View>
          </View>

          {/* ✅ নম্বরে চাপ দিলে কপি হবে */}
          <TouchableOpacity onPress={() => copyNumber(item.number)}>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color="#64748b" />
              <Text style={styles.detailLabel}>নম্বর (চাপুন)</Text>
              <Text style={[styles.detailValue, { color: '#0984E3', textDecorationLine: 'underline' }]}>
                {item.number} 📋
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.detailRow}>
            <Ionicons name="wallet-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>ব্যালেন্স</Text>
            <Text style={styles.detailValue}>৳{balanceStr}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>তারিখ</Text>
            <Text style={styles.detailValue}>{dateStr}</Text>
          </View>

          {item.bkashTrxID ? (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#00B894" />
              <Text style={styles.detailLabel}>TrxID</Text>
              <Text style={[styles.detailValue, { color: '#00B894' }]}>{item.bkashTrxID}</Text>
            </View>
          ) : null}
        </View>

        {item.status === 'Pending' ? (
          isProcessing ? (
            <View style={styles.processingBox}>
              <ActivityIndicator color="#0984E3" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          ) : (
            <View>
              {isPendingConfirm ? (
                <TouchableOpacity
                  style={[styles.btnFull, { backgroundColor: '#00B894' }]}
                  onPress={() => handleConfirmSent(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                  <Text style={styles.btnText}>✅ টাকা পাঠানো হয়েছে — Confirm করুন</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.btnFull, { backgroundColor: '#6C5CE7' }]}
                  onPress={() => handleManualApprove(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="hand-right-outline" size={16} color="white" />
                  <Text style={styles.btnText}>💸 পাঠিয়ে দেন (bKash Merchant)</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.btnFull, { backgroundColor: '#EF4444' }]}
                onPress={() => handleReject(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={16} color="white" />
                <Text style={styles.btnText}>❌ বাতিল (টাকা ফেরত)</Text>
              </TouchableOpacity>
            </View>
          )
        ) : null}

        {item.status === 'Approved' ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#00B894" />
            <Text style={styles.successBannerText}>পেমেন্ট সম্পন্ন হয়েছে ✅</Text>
          </View>
        ) : null}

        {item.status === 'Rejected' ? (
          <View style={styles.rejectBanner}>
            <Ionicons name="close-circle" size={18} color="#E17055" />
            <Text style={styles.rejectBannerText}>বাতিল — টাকা ফেরত দেওয়া হয়েছে ❌</Text>
          </View>
        ) : null}

      </View>
    );
  };

  const pendingCount  = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      <LinearGradient colors={['#1e293b', '#334155']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Withdraw Management</Text>
          <Text style={styles.headerSub}>মোট: {requests.length} টি রিকোয়েস্ট</Text>
        </View>
        <TouchableOpacity onPress={() => fetchRequests()} style={styles.iconBtn}>
          <Ionicons name="refresh-outline" size={22} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsRow}>
        {[
          { label: 'Pending',  count: pendingCount,  color: '#F59E0B' },
          { label: 'Approved', count: approvedCount, color: '#00B894' },
          { label: 'Rejected', count: rejectedCount, color: '#E17055' },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
            <Text style={[styles.statCount, { color: s.color }]}>{s.count}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0984E3" />
          <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <RequestCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0984E3']} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="checkmark-done-circle-outline" size={60} color="#00B894" />
              <Text style={styles.emptyText}>কোনো রিকোয়েস্ট নেই</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f1f5f9' },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18 },
  iconBtn:           { padding: 6 },
  headerTitle:       { fontSize: 18, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  headerSub:         { fontSize: 12, color: '#94a3b8', marginTop: 2, textAlign: 'center' },

  statsRow:          { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  statCard:          { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 14, borderLeftWidth: 4, elevation: 2 },
  statCount:         { fontSize: 24, fontWeight: 'bold' },
  statLabel:         { fontSize: 11, color: '#64748b', marginTop: 2 },

  listContent:       { padding: 16, paddingBottom: 30 },
  card:              { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 } },
  cardHeader:        { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarCircle:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0984E3', justifyContent: 'center', alignItems: 'center' },
  avatarText:        { color: 'white', fontWeight: 'bold', fontSize: 18 },
  userName:          { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  userEmail:         { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:        { fontSize: 12, fontWeight: '700' },

  detailsBox:        { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, gap: 10, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  detailRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel:       { flex: 1, fontSize: 13, color: '#64748b' },
  detailValue:       { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  detailAmount:      { fontSize: 17, fontWeight: 'bold', color: '#059669' },
  methodBadge:       { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  methodText:        { fontSize: 13, fontWeight: '700' },

  btnFull:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, gap: 6, marginBottom: 8 },
  btnText:           { color: 'white', fontWeight: 'bold', fontSize: 14 },

  processingBox:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 14 },
  processingText:    { color: '#0984E3', fontWeight: '600' },

  successBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8FDF5', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#00B89440' },
  successBannerText: { color: '#00B894', fontWeight: '700', fontSize: 14 },
  rejectBanner:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF0EE', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E1705540' },
  rejectBannerText:  { color: '#E17055', fontWeight: '700', fontSize: 14 },

  centered:          { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  loadingText:       { marginTop: 12, color: '#64748b', fontSize: 14 },
  emptyText:         { marginTop: 14, fontSize: 16, color: '#64748b' },
});