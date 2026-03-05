import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'https://liora-backend-production-74f1.up.railway.app';

const STATUS_COLOR: any = {
  Pending:  { bg: '#FFF8E1', text: '#F59E0B', label: 'Pending' },
  Approved: { bg: '#E8FDF5', text: '#00B894', label: 'Approved' },
  Rejected: { bg: '#FFF0EE', text: '#E17055', label: 'Rejected' },
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

  const fetchRequests = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await fetch(API_URL + '/admin/requests');
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
      Alert.alert(data.success ? 'Success' : 'Failed', data.msg || '');
      if (data.success) fetchRequests(false);
    } catch {
      Alert.alert('Error', 'Network error.');
    } finally {
      setActionId(null);
    }
  };

  const handleAutoApprove = (item: any) => {
    Alert.alert(
      'Auto bKash',
      'Send ' + item.amount + ' BDT to ' + item.number + '?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => doAction('/admin/auto-approve', item._id) },
      ]
    );
  };

  const handleManualApprove = (item: any) => {
    Alert.alert(
      'Manual Approve',
      'Manually send ' + item.amount + ' BDT to ' + item.number + ', then confirm.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => doAction('/admin/manual-approve', item._id) },
      ]
    );
  };

  const handleReject = (item: any) => {
    Alert.alert(
      'Reject?',
      item.amount + ' BDT will be refunded to user.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => doAction('/admin/reject', item._id) },
      ]
    );
  };

  const RequestCard = ({ item }: any) => {
    const isProcessing = actionId === item._id;
    const statusInfo   = STATUS_COLOR[item.status] || STATUS_COLOR.Pending;
    const methodColor  = METHOD_COLOR[item.method] || '#333';
    const amountStr    = String(Math.floor(Number(item.amount) || 0));
    const balanceStr   = String(Math.floor(Number(item.userId?.balance ?? item.userId?.wallet ?? 0)));
    const dateStr      = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-';

    return (
      <View style={styles.card}>

        {/* Header */}
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

        {/* Details */}
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailAmount}>{'BDT ' + amountStr}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="phone-portrait-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Method</Text>
            <View style={[styles.methodBadge, { backgroundColor: methodColor + '18' }]}>
              <Text style={[styles.methodText, { color: methodColor }]}>{item.method}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Number</Text>
            <Text style={styles.detailValue}>{item.number}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="wallet-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Balance</Text>
            <Text style={styles.detailValue}>{'BDT ' + balanceStr}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Date</Text>
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

        {/* Buttons — only for Pending */}
        {item.status === 'Pending' ? (
          isProcessing ? (
            <View style={styles.processingBox}>
              <ActivityIndicator color="#0984E3" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          ) : (
            <View>
              <View style={styles.btnRow}>
                {/* Auto bKash */}
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#0984E3' }]}
                  onPress={() => handleAutoApprove(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="flash-outline" size={16} color="white" />
                  <Text style={styles.btnText}>Auto bKash</Text>
                </TouchableOpacity>

                {/* Manual */}
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#6C5CE7' }]}
                  onPress={() => handleManualApprove(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="hand-right-outline" size={16} color="white" />
                  <Text style={styles.btnText}>Manual</Text>
                </TouchableOpacity>
              </View>

              {/* Reject */}
              <TouchableOpacity
                style={[styles.btnFull, { backgroundColor: '#EF4444', marginTop: 8 }]}
                onPress={() => handleReject(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={16} color="white" />
                <Text style={styles.btnText}>Reject (Refund)</Text>
              </TouchableOpacity>
            </View>
          )
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
          <Text style={styles.headerSub}>Total: {requests.length}</Text>
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
          <Text style={styles.loadingText}>Loading...</Text>
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
              <Text style={styles.emptyText}>No requests</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f1f5f9' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18 },
  iconBtn:        { padding: 6 },
  headerTitle:    { fontSize: 18, fontWeight: 'bold', color: 'white' },
  headerSub:      { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statsRow:       { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  statCard:       { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 14, borderLeftWidth: 4, elevation: 2 },
  statCount:      { fontSize: 24, fontWeight: 'bold' },
  statLabel:      { fontSize: 11, color: '#64748b', marginTop: 2 },
  listContent:    { padding: 16, paddingBottom: 30 },
  card:           { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 3 },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarCircle:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0984E3', justifyContent: 'center', alignItems: 'center' },
  avatarText:     { color: 'white', fontWeight: 'bold', fontSize: 18 },
  userName:       { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  userEmail:      { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:     { fontSize: 12, fontWeight: '700' },
  detailsBox:     { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, gap: 10, marginBottom: 14 },
  detailRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel:    { flex: 1, fontSize: 13, color: '#64748b' },
  detailValue:    { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  detailAmount:   { fontSize: 16, fontWeight: 'bold', color: '#059669' },
  methodBadge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  methodText:     { fontSize: 13, fontWeight: '700' },
  btnRow:         { flexDirection: 'row', gap: 10 },
  btn:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, gap: 6 },
  btnFull:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, gap: 6 },
  btnText:        { color: 'white', fontWeight: 'bold', fontSize: 14 },
  processingBox:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 14 },
  processingText: { color: '#0984E3', fontWeight: '600' },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  loadingText:    { marginTop: 12, color: '#64748b', fontSize: 14 },
  emptyText:      { marginTop: 14, fontSize: 16, color: '#64748b' },
});