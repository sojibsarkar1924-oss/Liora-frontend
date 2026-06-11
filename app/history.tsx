import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

// ✅ আপনার বর্তমান ব্যাকএন্ড ইউআরএল অপরিবর্তিত রাখা হয়েছে
const API_URL = 'https://liora-backend-nmx8.onrender.com/api';

// 📢 ব্যাকএন্ডে এপিআই রেডি না হওয়া পর্যন্ত এই ডিফল্ট ব্যানারগুলো অ্যাপে শো করবে
const DEFAULT_BANNERS = [
  {
    _id: 'default1',
    title: '📢 ১০০% ফ্রি আর্নিং অ্যাপে স্বাগতম!',
    description: 'এখন মেম্বারশিপ একদম ফ্রি! প্রতিদিন ২০টি ভিডিও দেখুন, অ্যাপ ইনস্টল করুন এবং ওয়েবসাইট ভিজিট করে ১২ থেকে ২০ টাকা অনায়াসে ইনকাম করুন।',
    imageUrl: 'https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?w=600',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'default2',
    title: '🔥 রেফার করুন এবং টিম বোনাস জিতুন!',
    description: 'আপনার রেফার কোড ব্যবহার করে বন্ধুদের জয়েন করালেই পাচ্ছেন ৬০ টাকা সরাসরি বোনাস! এছাড়াও আপনার সিনিয়র ৬ জেনারেশন পর্যন্ত পাবেন ১০ টাকা করে টিম বোনাস।',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'default3',
    title: '💰 পেমেন্ট নেওয়ার নিয়মাবলী',
    description: 'আপনার ব্যালেন্স ৫০ টাকা হলেই মোবাইল রিচার্জ এবং ২০০ টাকা বা তার বেশি হলে সরাসরি বিকাশ অ্যাপের মাধ্যমে মুহূর্তেই পেমেন্ট উইথড্র করে নিতে পারবেন।',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600',
    createdAt: new Date().toISOString()
  }
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch { return '-'; }
};

export default function HistoryScreen() {
  const router = useRouter();
  const { userData } = useContext(AuthContext) as any;

  const [banners,    setBanners]    = useState<any[]>(DEFAULT_BANNERS);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');

  const loadBanners = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      // 🌐 ব্যাকএন্ড থেকে ব্যানার ফেচ করার চেষ্টা করবে
      const res = await fetch(`${API_URL}/banners`);
      if (res.ok) {
        const result = await res.json();
        const list = result?.data || result || [];
        if (list.length > 0) {
          setBanners(list);
        } else {
          setBanners(DEFAULT_BANNERS);
        }
      } else {
        // এপিআই না থাকলে বা এরর হলে ডিফল্ট ব্যানারই দেখাবে
        setBanners(DEFAULT_BANNERS);
      }
    } catch (e: any) {
      console.log('Backend banners not setup yet, using defaults.');
      setBanners(DEFAULT_BANNERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const renderBannerItem = ({ item }: any) => {
    return (
      <View style={styles.bannerCard}>
        {/* ব্যানার ইমেজ */}
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.bannerImage} 
          resizeMode="cover"
        />
        
        {/* ব্যানার টেক্সট কন্টেন্ট */}
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerDescription}>{item.description}</Text>
          
          <View style={styles.cardFooter}>
            <Ionicons name="calendar-outline" size={14} color="#636E72" />
            <Text style={styles.bannerDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#C8DFF7', '#EEF5FF']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1A2533" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>অফিসিয়াল নোটিশ ও ব্যানার</Text>
          <TouchableOpacity onPress={() => loadBanners(true)} style={styles.backBtn}>
            <Ionicons name="refresh-outline" size={22} color="#0984E3" />
          </TouchableOpacity>
        </View>

        {/* Banner List */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0984E3" />
            <Text style={{ marginTop: 12, color: '#636E72' }}>নোটিশ লোড হচ্ছে...</Text>
          </View>
        ) : (
          <FlatList
            data={banners}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderBannerItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadBanners(true)}
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
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A2533' },
  backBtn: {
    padding: 10, 
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.8)',
  },

  // ── নতুন ব্যানার কার্ড স্টাইল ──
  bannerCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  bannerImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#dfe6e9',
  },
  bannerContent: {
    padding: 16,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A2533',
    marginBottom: 8,
    lineHeight: 22,
  },
  bannerDescription: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  bannerDate: {
    fontSize: 11,
    color: '#636E72',
  },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});