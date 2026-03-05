import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

// ✅ সরাসরি fetch — api.js import নেই
const API_URL = 'liora-backend-production-74f1.up.railway.appliora-backend-production-74f1.up.railway.app/api';

const TYPE_CONFIG: any = {
  withdraw: { icon: 'arrow-up-circle-outline',   color: '#E17055', label: 'উইথড্র'      },
  task:     { icon: 'gift-outline',              color: '#00B894', label: 'দৈনিক বোনাস' },
  deposit:  { icon: 'arrow-down-circle-outline', color: '#0984E3', label: 'ডিপোজিট'     },
  referral: { icon: 'people-outline',            color: '#6C5CE7', label: 'রেফার বোনাস' },
  team:     { icon: 'star-outline',              color: '#FDCB6E', label: 'টিম বোনাস'   },
};

const STATUS_COLOR: any = {
  Pending:  '#FDCB6E',
  Approved: '#00B894',
  Rejected: '#E17055',
  Success:  '#00B894',
};

// ✅ তারিখ format — bn-BD নেই
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch { return '-'; }
};

const FILTERS = [
  { key: 'all',      label: 'সব'       },
  { key: 'task',     label: '💰 ইনকাম' },
  { key: 'withdraw', label: '📤 উইথড্র' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const { userData } = useContext(AuthContext) as any;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered,     setFiltered]     = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState('');

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const userId = userData?._id || userData?.id;
      if (!userId) { setError('ইউজার পাওয়া যায়নি।'); return; }

      // ✅ FIXED: সরাসরি /api/history/:userId fetch করো
      const res    = await fetch(`${API_URL}/history/${userId}`);
      const result = await res.json();

      // ✅ FIXED: result.data (আগে result.transactions ছিল — ভুল)
      const list = result?.data || [];
      setTransactions(list);
      applyFilter(activeFilter, list);

    } catch (e: any) {
      setError(e?.msg || 'লেনদেন লোড করা যায়নি।');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const applyFilter = (key: string, list = transactions) => {
    setActiveFilter(key);
    setFiltered(key === 'all' ? list : list.filter((t) => t.type === key));
  };

  // ✅ সারসংক্ষেপ
  const totalIncome   = transactions
    .filter(t => t.type !== 'withdraw')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const totalWithdraw = transactions
    .filter(t => t.type === 'withdraw' && t.status === 'Approved')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const renderItem = ({ item }: any) => {
    const cfg   = TYPE_CONFIG[item.type] || TYPE_CONFIG.task;
    const isOut = item.type === 'withdraw';
    const sColor = STATUS_COLOR[item.status] || '#636E72';

    // ✅ FIXED: toLocaleString('bn-BD') সরানো
    const numAmount = isNaN(Number(item.amount)) ? 0 : Number(item.amount);
    const amountStr = (isOut ? '-৳' : '+৳') + String(Math.floor(numAmount));

    return (
      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: cfg.color + '20' }]}>
          <Ionicons name={cfg.icon} size={24} color={cfg.color} />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardLabel}>{item.label || cfg.label}</Text>
          <Text style={styles.cardDate}>{formatDate(item.date || item.createdAt)}</Text>
          {item.method && (
            <Text style={styles.cardMeta}>{item.method}{item.number ? ` • ${item.number}` : ''}</Text>
          )}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.cardAmount, { color: isOut ? '#E17055' : '#00B894' }]}>
            {amountStr}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: sColor + '20' }]}>
            <Text style={[styles.statusText, { color: sColor }]}>
              {item.status === 'Pending'  ? 'পেন্ডিং'  :
               item.status === 'Approved' ? 'সম্পন্ন'  :
               item.status === 'Rejected' ? 'বাতিল'    :
               item.status === 'Success'  ? 'সফল'      : item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ✅ summary amount — bn-BD ছাড়া
  const incomeStr   = '৳' + String(Math.floor(totalIncome));
  const withdrawStr = '৳' + String(Math.floor(totalWithdraw));

  return (
    <LinearGradient colors={['#C8DFF7', '#EEF5FF']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1A2533" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>লেনদেনের ইতিহাস</Text>
          <TouchableOpacity onPress={() => loadData(true)} style={styles.backBtn}>
            <Ionicons name="refresh-outline" size={22} color="#0984E3" />
          </TouchableOpacity>
        </View>

        {/* সারসংক্ষেপ */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderLeftColor: '#00B894' }]}>
            <Text style={styles.summaryValue}>{incomeStr}</Text>
            <Text style={styles.summaryLabel}>মোট আয়</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#E17055' }]}>
            <Text style={styles.summaryValue}>{withdrawStr}</Text>
            <Text style={styles.summaryLabel}>মোট উইথড্র</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#0984E3' }]}>
            <Text style={styles.summaryValue}>{transactions.length}</Text>
            <Text style={styles.summaryLabel}>মোট লেনদেন</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, activeFilter === f.key && styles.filterActive]}
              onPress={() => applyFilter(f.key)}
            >
              <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0984E3" />
            <Text style={{ marginTop: 12, color: '#636E72' }}>লোড হচ্ছে...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="wifi-outline" size={50} color="#b2bec3" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
              <Text style={styles.retryText}>আবার চেষ্টা করুন</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="file-tray-outline" size={50} color="#b2bec3" />
            <Text style={styles.errorText}>কোনো লেনদেন নেই</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(_, index) => String(index)}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(true)}
                colors={['#0984E3']}
              />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A2533' },
  backBtn: {
    padding: 10, backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },

  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  summaryCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14, padding: 12, borderLeftWidth: 4, elevation: 2,
  },
  summaryValue: { fontSize: 15, fontWeight: 'bold', color: '#1A2533' },
  summaryLabel: { fontSize: 11, color: '#636E72', marginTop: 3 },

  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  filterActive:     { backgroundColor: '#0984E3', borderColor: '#0984E3' },
  filterText:       { fontSize: 13, color: '#636E72', fontWeight: '600' },
  filterTextActive: { color: 'white' },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 14, borderRadius: 16, marginBottom: 10,
    elevation: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  iconBox:     { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardLabel:   { fontSize: 15, fontWeight: 'bold', color: '#1A2533' },
  cardDate:    { fontSize: 12, color: '#636E72', marginTop: 2 },
  cardMeta:    { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  cardAmount:  { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText:  { fontSize: 11, fontWeight: '600' },

  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#636E72', fontSize: 14, marginTop: 12, textAlign: 'center' },
  retryBtn:  { marginTop: 16, backgroundColor: '#0984E3', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  retryText: { color: 'white', fontWeight: 'bold' },
});