import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useContext, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { doTask } from '../services/api';

const PARTNER_APPS = [
  { id: '1',  name: 'App Task 01', link: 'https://play.google.com/store/apps/details?id=com.whatsapp' },
  { id: '2',  name: 'App Task 02', link: 'https://play.google.com/store/apps/details?id=com.facebook.katana' },
  { id: '3',  name: 'App Task 03', link: 'https://play.google.com/store/apps/details?id=com.instagram.android' },
  { id: '4',  name: 'App Task 04', link: 'https://play.google.com/store/apps/details?id=com.tiktok.android' },
  { id: '5',  name: 'App Task 05', link: 'https://play.google.com/store/apps/details?id=com.snapchat.android' },
  { id: '6',  name: 'App Task 06', link: 'https://play.google.com/store/apps/details?id=com.twitter.android' },
  { id: '7',  name: 'App Task 07', link: 'https://play.google.com/store/apps/details?id=com.youtube.android' },
  { id: '8',  name: 'App Task 08', link: 'https://play.google.com/store/apps/details?id=com.telegram.messenger' },
  { id: '9',  name: 'App Task 09', link: 'https://play.google.com/store/apps/details?id=com.viber.voip' },
  { id: '10', name: 'App Task 10', link: 'https://play.google.com/store/apps/details?id=com.imo.android.imoim' },
  { id: '11', name: 'App Task 11', link: 'https://play.google.com/store/apps/details?id=com.bigo.live' },
  { id: '12', name: 'App Task 12', link: 'https://play.google.com/store/apps/details?id=com.gaana' },
];

const PACKAGE_LIMIT: Record<string, number> = {
  Bronze: 4, Silver: 6, Gold: 8, Platinum: 10, Diamond: 12,
};

export default function TaskScreen() {
  const { userData, updateUserData } = useContext(AuthContext) as any;

  const [timer,       setTimer]       = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentApp,  setCurrentApp]  = useState<string | null>(null);
  const [doneCount,   setDoneCount]   = useState(0);
  const timerRef   = useRef<any>(null);
  const claimedRef = useRef(false);

  // ✅ FIXED: pkgName সঠিকভাবে বের করা
  const rawPkg  = (userData?.packageName && userData?.packageName !== 'None')
    ? userData.packageName
    : (userData?.package || '');
  const pkgName = rawPkg
    ? rawPkg.charAt(0).toUpperCase() + rawPkg.slice(1).toLowerCase()
    : 'Bronze';

  // ✅ FIXED: limit সঠিক package থেকে নেওয়া
  const limit   = PACKAGE_LIMIT[pkgName] || 4;

  const today      = new Date().toISOString().split('T')[0];
  const serverDone = userData?.lastTaskDate === today ? (userData?.todayTaskCount || 0) : 0;
  const done       = Math.max(serverDone, doneCount);
  const remaining  = Math.max(0, limit - done);
  const progressRatio = limit > 0 ? done / limit : 0;
  const pendingTasks  = PARTNER_APPS.slice(0, limit).filter((_, index) => index >= done);

  const handleInstall = (link: string, appName: string) => {
    if (remaining <= 0) {
      return Alert.alert('⏰ সম্পন্ন', `আজকের ${limit}টি কাজ শেষ! কাল আবার আসুন।`);
    }
    claimedRef.current = false;
    setCurrentApp(appName);
    Linking.openURL(link);
    setTimer(10);
    setIsVerifying(true);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleClaim();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClaim = async () => {
    if (claimedRef.current) return;
    claimedRef.current = true;
    clearInterval(timerRef.current);

    const userId = userData?._id || userData?.id;
    if (!userId) {
      setIsVerifying(false);
      return Alert.alert('❌ ত্রুটি', 'আবার লগইন করুন।');
    }
    try {
      const result = await doTask(userId);
      setDoneCount(prev => prev + 1);
      if (updateUserData) await updateUserData(userId).catch(() => {});
      Alert.alert('✅ সফল!', result.msg);
    } catch (err: any) {
      Alert.alert('❌ দুঃখিত', err?.msg || 'কাজটি সম্পন্ন হয়নি।');
    } finally {
      setIsVerifying(false);
      setCurrentApp(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>প্যাকেজ: {pkgName}</Text>
        <Text style={styles.balanceText}>ব্যালেন্স: ৳{userData?.balance || 0}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>আজকের কাজ: {done}/{limit}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { flex: progressRatio }]} />
            <View style={{ flex: Math.max(0, 1 - progressRatio) }} />
          </View>
          {remaining > 0 ? (
            <Text style={styles.remainingText}>বাকি {remaining}টি কাজ</Text>
          ) : (
            <Text style={[styles.remainingText, { color: '#27ae60' }]}>✅ আজকের সব কাজ শেষ!</Text>
          )}
        </View>
      </View>

      {pendingTasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="checkmark-done-circle" size={80} color="#27ae60" />
          <Text style={styles.emptyText}>🎉 আজকের সব কাজ সম্পন্ন!</Text>
          <Text style={styles.emptySubText}>কাল আবার নতুন কাজ পাবেন।</Text>
        </View>
      ) : (
        <FlatList
          data={pendingTasks}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <Ionicons name="logo-google-playstore" size={28} color="#27ae60" />
              <Text style={styles.appName}>{item.name}</Text>
              <TouchableOpacity
                style={styles.installBtn}
                onPress={() => handleInstall(item.link, item.name)}
                activeOpacity={0.8}
              >
                <Text style={styles.installBtnText}>ইন্সটল</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={isVerifying} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <ActivityIndicator size="large" color="#27ae60" />
            <Text style={styles.modalTitle}>ভেরিফাই হচ্ছে...</Text>
            <Text style={styles.modalSub}>{currentApp}</Text>
            <Text style={styles.timerText}>{timer} সেকেন্ড</Text>
            <Text style={styles.modalHint}>অ্যাপটি ইন্সটল করুন এবং অপেক্ষা করুন</Text>
            {timer <= 5 && (
              <TouchableOpacity onPress={handleClaim} style={styles.claimBtn}>
                <Text style={styles.claimBtnText}>✅ এখনই দাবি করুন</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f8f9fa' },
  header:          { backgroundColor: '#fff', padding: 20, borderRadius: 16, margin: 16, elevation: 3 },
  headerTitle:     { fontSize: 16, fontWeight: 'bold', color: '#333' },
  balanceText:     { fontSize: 20, color: '#27ae60', fontWeight: 'bold', marginTop: 4 },
  progressRow:     { marginTop: 12 },
  progressText:    { fontSize: 13, color: '#555', marginBottom: 6 },
  progressBarBg:   { height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, flexDirection: 'row', overflow: 'hidden' },
  progressBarFill: { height: 8, backgroundColor: '#27ae60' },
  remainingText:   { fontSize: 12, color: '#e74c3c', marginTop: 5, fontWeight: '600' },
  taskCard:        { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12, elevation: 2 },
  appName:         { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#333' },
  installBtn:      { backgroundColor: '#27ae60', paddingVertical: 9, paddingHorizontal: 18, borderRadius: 10 },
  installBtnText:  { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyBox:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText:       { fontSize: 20, fontWeight: 'bold', color: '#27ae60', marginTop: 16 },
  emptySubText:    { fontSize: 14, color: '#999', marginTop: 8 },
  modalBg:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox:        { backgroundColor: '#fff', padding: 32, borderRadius: 24, alignItems: 'center', width: '82%' },
  modalTitle:      { fontSize: 18, fontWeight: 'bold', marginTop: 14, color: '#333' },
  modalSub:        { fontSize: 14, color: '#666', marginTop: 4 },
  timerText:       { fontSize: 36, fontWeight: 'bold', color: '#e74c3c', marginTop: 12 },
  modalHint:       { fontSize: 12, color: '#999', marginTop: 10, textAlign: 'center' },
  claimBtn:        { marginTop: 16, backgroundColor: '#27ae60', paddingVertical: 10, paddingHorizontal: 28, borderRadius: 10 },
  claimBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});