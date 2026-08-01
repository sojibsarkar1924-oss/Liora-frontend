import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// আপনার প্রকল্পের ফন্ট নাম অনুযায়ী পরিবর্তন করুন
const customFont = 'AnekBangla-Regular';

const WithdrawScreen = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const quickAmounts = [ 1290, 1500, 2000];

  // ব্যালেন্স কার্ডের জন্য ডায়াগোনাল স্ট্রাইপ (কয়েকটি রোটেটেড লাইন)
  const renderDiagonalStripes = () => {
    const stripes = [];
    for (let i = 0; i < 8; i++) {
      stripes.push(
        <View
          key={i}
          style={[
            styles.stripeLine,
            { left: -60 + i * 45 },
          ]}
        />
      );
    }
    return stripes;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1D21" />

      {/* ব্রাউজার হেডার */}
      <View style={styles.browserHeader}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>withdraw.html</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="dots-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* টপবার */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.walletContainer}>
            <Text style={styles.walletEmoji}>💰</Text>
            <Text style={[styles.walletText, { fontFamily: customFont }]}>আমার ওয়ালেট</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ব্যালেন্স কার্ড */}
        <LinearGradient
          colors={['#3B3F48', '#20232A', '#3B3F48']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          {/* ডায়াগোনাল স্ট্রাইপ ওভারলে */}
          <View style={styles.stripeOverlay} pointerEvents="none">
            {renderDiagonalStripes()}
          </View>

          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceLabel, { fontFamily: customFont }]}>বর্তমান ব্যালেন্স</Text>
          </View>
          <Text style={[styles.balanceAmount, { fontFamily: customFont }]}>৳ 0.00</Text>
          <View style={styles.balanceFooter}>
            <Text style={[styles.balanceFooterText, { fontFamily: customFont }]}>। সর্বনিম্ন:</Text>
            <Text style={[styles.balanceFooterText, { fontFamily: customFont }]}>
              <Icon name="history" size={14} color="#6B7280" /> ২৪-৪৮ ঘণ্টায়
            </Text>
          </View>

          {/* গোল্ডেন বর্ডার */}
          <View style={styles.cardBorder} />
        </LinearGradient>

        {/* উইথড্র মেথড */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { fontFamily: customFont }]}>
            উইথড্র মেথড সিলেক্ট করুন
          </Text>
          <TouchableOpacity style={styles.methodButton}>
            <Icon name="check-circle" size={22} color="#FFFFFF" />
            <Text style={[styles.methodText, { fontFamily: customFont }]}>Bkash</Text>
          </TouchableOpacity>
        </View>

        {/* একাউন্ট নাম্বার */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { fontFamily: customFont }]}>
            একাউন্ট নাম্বার
          </Text>
          <View style={styles.inputContainer}>
            <Icon name="phone" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { fontFamily: customFont }]}
              placeholder="017xxxxxxxx"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
          </View>
        </View>

        {/* টাকার পরিমাণ */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { fontFamily: customFont }]}>
            টাকার পরিমাণ
          </Text>
          <View style={styles.inputContainer}>
            <Text style={[styles.takaIcon, { fontFamily: customFont }]}>৳</Text>
            <TextInput
              style={[styles.input, { fontFamily: customFont }]}
              placeholder="সর্বনিম্ন 1290 টাকা"
              placeholderTextColor="#14B8A6"
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setSelectedAmount(null);
              }}
            />
          </View>
        </View>

        {/* দ্রুত সিলেক্ট */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { fontFamily: customFont }]}>
            দ্রুত সিলেক্ট
          </Text>
          <View style={styles.quickAmountGrid}>
            {quickAmounts.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.quickAmountButton,
                  selectedAmount === amt && styles.selectedQuickAmount,
                ]}
                onPress={() => {
                  setSelectedAmount(amt);
                  setAmount(amt.toString());
                }}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    { fontFamily: customFont },
                    selectedAmount === amt && styles.selectedQuickAmountText,
                  ]}
                >
                  ৳{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* সাবমিট বোতাম - গ্লো ইফেক্ট সহ */}
        <View style={styles.submitButtonWrapper}>
          <TouchableOpacity style={styles.submitButton} activeOpacity={0.85}>
            <Text style={[styles.submitButtonText, { fontFamily: customFont }]}>
              ↑ টাকা তুলুন
            </Text>
          </TouchableOpacity>
        </View>

        {/* ইনফো বক্স */}
        <View style={styles.infoBox}>
          <Icon name="shield-check" size={24} color="#6B7280" style={styles.infoIcon} />
          <Text style={[styles.infoText, { fontFamily: customFont }]}>
            রিকোয়েস্ট পেন্ডিং থাকলে ২৪-৪৮ ঘণ্টার মধ্যে প্রসেস হবে। সমস্যায় সাপোর্ট যোগাযোগ করুন।
          </Text>
        </View>
      </ScrollView>

      {/* বটম ট্যাব নেভিগেশন */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Icon name="home-outline" size={24} color="#6B7280" />
          <Text style={[styles.tabLabel, { fontFamily: customFont }]}>হোম</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Icon name="wallet" size={24} color="#14B8A6" />
          <Text style={[styles.tabLabel, styles.tabLabelActive, { fontFamily: customFont }]}>
            ওয়ালেট
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Icon name="history" size={24} color="#6B7280" />
          <Text style={[styles.tabLabel, { fontFamily: customFont }]}>হিস্টোরি</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Icon name="account-outline" size={24} color="#6B7280" />
          <Text style={[styles.tabLabel, { fontFamily: customFont }]}>প্রোফাইল</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1D21',
  },
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D343E',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#2D343E',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  walletText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  stripeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  stripeLine: {
    position: 'absolute',
    top: -40,
    width: 18,
    height: 260,
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '20deg' }],
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#D4AF37',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  balanceFooterText: {
    color: '#6B7280',
    fontSize: 12,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#D4AF3744',
    borderRadius: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', // ✅ hug content, full-width নয়
    backgroundColor: '#ED58A6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  methodText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D343E',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  takaIcon: {
    color: '#14B8A6',
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#FFFFFF',
    fontSize: 16,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: '#2D343E',
    borderRadius: 8,
    width: '23%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectedQuickAmount: {
    backgroundColor: '#14B8A622',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  quickAmountText: {
    color: '#14B8A6',
    fontSize: 14,
  },
  selectedQuickAmountText: {
    fontWeight: 'bold',
  },
  submitButtonWrapper: {
    marginBottom: 20,
    borderRadius: 24,
    // গ্লো ইফেক্ট (iOS)
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    // Android গ্লো-ইশ elevation
    elevation: 10,
  },
  submitButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#0B3D2E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2D343E',
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
  },
  iconButton: {
    padding: 8,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1A1D21',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#2D343E',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#14B8A6',
    fontWeight: 'bold',
  },
});

export default WithdrawScreen;