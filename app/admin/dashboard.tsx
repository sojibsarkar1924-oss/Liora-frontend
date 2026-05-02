import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  adminApprovePayment,
  adminRejectPayment,
  adminWithdrawAction,
  getAdminPayments,
  getAdminWithdraws,
} from '../../services/api';

type Tab = 'payments' | 'withdraws';

export default function AdminDashboard() {
  const router = useRouter();
  const { userToken, userData, logout } = useContext(AuthContext) as any;

  const [activeTab,  setActiveTab]  = useState<Tab>('payments');
  const [payments,   setPayments]   = useState<any[]>([]);
  const [withdraws,  setWithdraws]  = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingPayments: 0, approvedPayments: 0, pendingWithdraws: 0,
  });

  // ✅ পাঠিয়ে দেন চাপার পর Confirm state track করার জন্য
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const fetchAll = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [payData, wdData] = await Promise.all([
        getAdminPayments(userToken).catch(() => ({ data: [] })),
        getAdminWithdraws(userToken).catch(() => ({ data: [] })),
      ]);

      const payList = Array.isArray(payData?.payments) ? payData.payments :
                Array.isArray(payData?.data)      ? payData.data     : [];

      const wdList  = Array.isArray(wdData?.withdraws) ? wdData.withdraws :
                Array.isArray(wdData?.data)       ? wdData.data      :
                Array.isArray(wdData)             ? wdData           : [];
    setPayments(payList.filter((p: any) => p.status === 'Pending'));
      setWithdraws(wdList);
      setStats({
        pendingPayments:  payList.filter((p: any) => p.status === 'Pending').length,
        approvedPayments: payList.filter((p: any) => p.status === 'Approved').length,
        pendingWithdraws: wdList.filter((w: any)  => w.status === 'Pending').length,
      });
    } catch {
      Alert.alert('ত্রুটি', 'ডাটা লোড হয়নি।');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchAll(false); };

  // ── Payment Approve ──
  const approvePayment = (id: string, name: string) => {
    Alert.alert('✅ অনুমোদন?', `${name} এর পেমেন্ট অনুমোদন করলে একাউন্ট সক্রিয় হবে।`, [
      { text: 'না', style: 'cancel' },
      { text: 'হ্যাঁ', onPress: async () => {
        try {
          await adminApprovePayment(id, userToken);
          Alert.alert('✅ সফল!', `${name} এর একাউন্ট সক্রিয় হয়েছে।`);
          fetchAll(false);
        } catch (e: any) { Alert.alert('❌ ব্যর্থ', e?.msg || 'সমস্যা হয়েছে।'); }
      }},
    ]);
  };

  // ── Payment Reject ──
  const rejectPayment = (id: string, name: string) => {
    Alert.alert('❌ বাতিল?', `${name} এর পেমেন্ট বাতিল করবেন?`, [
      { text: 'না', style: 'cancel' },
      { text: 'বাতিল করুন', style: 'destructive', onPress: async () => {
        try {
          await adminRejectPayment(id, userToken);
          Alert.alert('সফল', 'পেমেন্ট বাতিল হয়েছে।');
          fetchAll(false);
        } catch (e: any) { Alert.alert('❌ ব্যর্থ', e?.msg || 'সমস্যা হয়েছে।'); }
      }},
    ]);
  };

  // ✅ নতুন flow: পাঠিয়ে দেন → নম্বর কপি + সাথে সাথে Approved + Confirm বাটন
  const sendWithdraw = async (item: any) => {
    try {
      // ১. নম্বর কপি
      await Clipboard.setStringAsync(item.number);

      // ২. সাথে সাথে backend Approved
      await adminWithdrawAction(item._id, 'Approved', userToken);

      // ৩. বাটন Confirm এ পরিবর্তন
      setSentIds(prev => {
        const next = new Set(prev);
        next.add(item._id);
        return next;
      });

      // ৪. List refresh
      fetchAll(false);

    } catch (e: any) {
      Alert.alert('❌ ব্যর্থ', e?.msg || 'সমস্যা হয়েছে।');
    }
  };

  // ── Withdraw Reject ──
  const rejectWithdraw = (id: string, name: string) => {
    Alert.alert('❌ বাতিল?', `${name} এর উইথড্র বাতিল করবেন? টাকা ফেরত যাবে।`, [
      { text: 'না', style: 'cancel' },
      { text: 'বাতিল', style: 'destructive', onPress: async () => {
        try {
          await adminWithdrawAction(id, 'Rejected', userToken);
          Alert.alert('সফল', 'উইথড্র বাতিল হয়েছে। টাকা ফেরত গেছে।');
          fetchAll(false);
        } catch (e: any) { Alert.alert('❌ ব্যর্থ', e?.msg || 'সমস্যা হয়েছে।'); }
      }},
    ]);
  };

  const handleLogout = () => {
    Alert.alert('লগআউট', 'লগআউট করবেন?', [
      { text: 'না', style: 'cancel' },
      { text: 'হ্যাঁ', onPress: () => logout() },
    ]);
  };

  // ── Payment Card ──
  const renderPaymentCard = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.userId?.name || 'U')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardName}>{item.userId?.name || 'অজানা'}</Text>
          <Text style={styles.cardSub}>{item.userId?.email || ''}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: '#fef9c3' }]}>
          <Text style={[styles.badgeText, { color: '#854d0e' }]}>{item.packageName || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        {[
          { label: '💰 পরিমাণ',  value: `৳${item.amount?.toLocaleString()}` },
          { label: '📱 মেথড',    value: item.method || 'Bkash' },
          { label: '📞 নম্বর',   value: item.senderNumber || '-' },
          { label: '🔖 TrxID',   value: item.trxId || '-', highlight: true },
          { label: '📅 তারিখ',   value: item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : '-' },
          { label: '📋 রেফার',   value: item.userId?.referralCode || '-' },
        ].map((info, i) => (
          <View key={i} style={styles.infoItem}>
            <Text style={styles.infoLabel}>{info.label}</Text>
            <Text style={[styles.infoValue, info.highlight && { color: '#7c3aed' }]}>{info.value}</Text>
          </View>
        ))}
      </View>

      {item.status === 'Pending' ? (
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
            onPress={() => rejectPayment(item._id, item.userId?.name || 'ব্যবহারকারী')}>
            <Ionicons name="close-circle-outline" size={18} color="white" />
            <Text style={styles.actionBtnText}>বাতিল</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}
            onPress={() => approvePayment(item._id, item.userId?.name || 'ব্যবহারকারী')}>
            <Ionicons name="checkmark-circle-outline" size={18} color="white" />
            <Text style={styles.actionBtnText}>অনুমোদন করুন</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.statusTag,
          { backgroundColor: item.status === 'Approved' ? '#dcfce7' : '#fee2e2' }]}>
          <Text style={{ color: item.status === 'Approved' ? '#15803d' : '#dc2626', fontWeight: 'bold' }}>
            {item.status === 'Approved' ? '✅ অনুমোদিত' : '❌ বাতিল'}
          </Text>
        </View>
      )}
    </View>
  );

  // ── Withdraw Card ──
  const renderWithdrawCard = ({ item }: any) => {
    const isSent = sentIds.has(item._id);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: '#7c3aed' }]}>
            <Text style={styles.avatarText}>{(item.userId?.name || 'U')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.cardName}>{item.userId?.name || 'অজানা'}</Text>
            <Text style={styles.cardSub}>{item.userId?.email || ''}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#ede9fe' }]}>
            <Text style={[styles.badgeText, { color: '#7c3aed' }]}>৳{item.amount?.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          {[
            { label: '📱 মেথড',   value: item.method || '-' },
            { label: '📞 নম্বর',  value: item.number || '-' },
            { label: '📅 তারিখ',  value: item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : '-' },
            { label: '📊 স্ট্যাটাস', value: item.status || '-',
              highlight: item.status === 'Pending' },
          ].map((info, i) => (
            <View key={i} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={[styles.infoValue, info.highlight && { color: '#d97706' }]}>{info.value}</Text>
            </View>
          ))}
        </View>

        {item.status === 'Pending' && (
          <View>
            {isSent ? (
              // ✅ পাঠানো হয়েছে — Confirm বাটন (disabled, শুধু দেখানোর জন্য)
              <View style={[styles.actionBtnFull, { backgroundColor: '#00B894', marginBottom: 8 }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                <Text style={styles.actionBtnText}>✅ পাঠানো হয়েছে — Confirmed</Text>
              </View>
            ) : (
              // পাঠিয়ে দেন বাটন
              <TouchableOpacity
                style={[styles.actionBtnFull, { backgroundColor: '#7c3aed', marginBottom: 8 }]}
                onPress={() => sendWithdraw(item)}
              >
                <Ionicons name="send-outline" size={18} color="white" />
                <Text style={styles.actionBtnText}>💸 পাঠিয়ে দেন</Text>
              </TouchableOpacity>
            )}

            {!isSent && (
              <TouchableOpacity
                style={[styles.actionBtnFull, { backgroundColor: '#ef4444' }]}
                onPress={() => rejectWithdraw(item._id, item.userId?.name || 'ব্যবহারকারী')}
              >
                <Ionicons name="close-circle-outline" size={18} color="white" />
                <Text style={styles.actionBtnText}>❌ বাতিল (টাকা ফেরত)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const currentData     = activeTab === 'payments' ? payments : withdraws;
  const currentRenderer = activeTab === 'payments' ? renderPaymentCard : renderWithdrawCard;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0f172a" barStyle="light-content" />

      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚙️ Admin Panel</Text>
          <Text style={styles.headerSub}>স্বাগতম, {userData?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        stickyHeaderIndices={[1]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { num: stats.pendingPayments,  label: '💳 পেন্ডিং পেমেন্ট', color: '#3b82f6' },
            { num: stats.approvedPayments, label: '✅ অনুমোদিত',          color: '#16a34a' },
            { num: stats.pendingWithdraws, label: '💸 পেন্ডিং উইথড্র',   color: '#7c3aed' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: s.color }]}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'payments' && styles.tabActive]}
            onPress={() => setActiveTab('payments')}
          >
            <Ionicons name="card-outline" size={18} color={activeTab === 'payments' ? '#6366f1' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'payments' && styles.tabTextActive]}>
              মেম্বারশিপ ({stats.pendingPayments})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'withdraws' && styles.tabActive]}
            onPress={() => setActiveTab('withdraws')}
          >
            <Ionicons name="cash-outline" size={18} color={activeTab === 'withdraws' ? '#7c3aed' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'withdraws' && styles.tabTextActive]}>
              উইথড্র ({stats.pendingWithdraws})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 60 }} />
        ) : currentData.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>কোনো রিকোয়েস্ট নেই</Text>
            <Text style={styles.emptyText}>নতুন রিকোয়েস্ট আসলে এখানে দেখাবে</Text>
          </View>
        ) : (
          <FlatList
            data={currentData}
            keyExtractor={(item) => item._id}
            renderItem={currentRenderer}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 44 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  headerSub:   { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  logoutBtn:   { backgroundColor: '#1e293b', padding: 10, borderRadius: 10 },

  statsRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', elevation: 4 },
  statNum:  { fontSize: 24, fontWeight: 'bold', color: 'white' },
  statLbl:  { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 4, textAlign: 'center' },

  tabBar: {
    flexDirection: 'row', backgroundColor: 'white',
    marginHorizontal: 16, borderRadius: 14,
    padding: 4, elevation: 3, marginBottom: 8,
  },
  tabBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  tabActive:     { backgroundColor: '#f1f5f9' },
  tabText:       { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  tabTextActive: { color: '#1e293b' },

  card: {
    backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 14,
    elevation: 4, shadowColor: '#0f172a', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 },
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar:      { width: 46, height: 46, borderRadius: 23, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  avatarText:  { color: 'white', fontWeight: 'bold', fontSize: 20 },
  cardName:    { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cardSub:     { fontSize: 12, color: '#64748b', marginTop: 2 },
  badge:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText:   { fontWeight: 'bold', fontSize: 13 },

  infoGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  infoItem:  { width: '47%', backgroundColor: '#f8fafc', padding: 10, borderRadius: 12 },
  infoLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 3 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#1e293b' },

  btnRow:         { flexDirection: 'row', gap: 10 },
  actionBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 6 },
  actionBtnFull:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 6 },
  actionBtnText:  { color: 'white', fontWeight: 'bold', fontSize: 14 },
  statusTag:      { padding: 12, borderRadius: 12, alignItems: 'center' },

  empty:     { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle:{ fontSize: 18, fontWeight: 'bold', color: '#64748b', marginTop: 16 },
  emptyText: { fontSize: 13, color: '#94a3b8', marginTop: 6, textAlign: 'center' },
});