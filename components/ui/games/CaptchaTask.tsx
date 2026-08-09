/**
 * components/ui/games/CaptchaTask.tsx
 * "ক্যাপচা পূরণ করুন" ফিচারের আসল কোড।
 * র‍্যান্ডম ৪-অক্ষরের কোড দেখানো হয়, ইউজার টাইপ করে মেলাবে।
 * নির্দিষ্ট সংখ্যক ক্যাপচা ঠিকভাবে পূরণ করলে reward পাবে।
 *
 * এটা সম্পূর্ণ নিজে-তৈরি র‍্যান্ডম কোড — কোনো বাইরের API/সোর্স
 * বা রিয়েল-ওয়েবসাইট ক্যাপচা বাইপাস করার সাথে সম্পর্ক নেই।
 */

import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const TOTAL_CAPTCHAS = 4; // ৪টা ক্যাপচা পূরণ করতে হবে
const CODE_LENGTH = 4;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // দেখতে গুলিয়ে যায় এমন অক্ষর (I, O, 0, 1) বাদ

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

type CaptchaTaskProps = {
  onWin?: (reward: number) => void;
  rewardAmount?: number;
};

export default function CaptchaTask({
  onWin = () => {},
  rewardAmount = 8,
}: CaptchaTaskProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const [currentCode, setCurrentCode] = useState(generateCode());
  const [inputValue, setInputValue] = useState('');
  const [isWrong, setIsWrong] = useState(false);

  const handleSubmit = () => {
    const isCorrect =
      inputValue.trim().toUpperCase() === currentCode.toUpperCase();

    if (!isCorrect) {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 600);
      return;
    }

    const newCompletedCount = completedCount + 1;
    setCompletedCount(newCompletedCount);
    setInputValue('');

    if (newCompletedCount >= TOTAL_CAPTCHAS) {
      Alert.alert(
        'অভিনন্দন! 🎉',
        `আপনি ${TOTAL_CAPTCHAS}টি ক্যাপচা সম্পন্ন করেছেন।`,
        [
          {
            text: 'ঠিক আছে',
            onPress: () => {
              onWin(rewardAmount);
              resetTask();
            },
          },
        ]
      );
    } else {
      setCurrentCode(generateCode());
    }
  };

  const resetTask = () => {
    setCompletedCount(0);
    setCurrentCode(generateCode());
    setInputValue('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ক্যাপচা পূরণ করুন</Text>
      <Text style={styles.subtitle}>
        সম্পন্ন হয়েছে: {completedCount} / {TOTAL_CAPTCHAS}
      </Text>

      <View style={[styles.codeBox, isWrong && styles.codeBoxWrong]}>
        <Text style={styles.codeText}>{currentCode}</Text>
      </View>

      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder="কোডটি এখানে লিখুন"
        placeholderTextColor="#5a5f8a"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={CODE_LENGTH}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>যাচাই করুন</Text>
      </TouchableOpacity>

      {isWrong && <Text style={styles.wrongText}>কোড মিলছে না, আবার চেষ্টা করুন</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 24,
    backgroundColor: '#0b0b18',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#9aa0c7', marginBottom: 24 },
  codeBox: {
    borderWidth: 1.5,
    borderColor: '#9c4dff',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 24,
    backgroundColor: '#12132a',
  },
  codeBoxWrong: { borderColor: '#ff5252' },
  codeText: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#c9a6ff',
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#3d4a8f',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#12132a',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#9c4dff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  wrongText: { color: '#ff5252', marginTop: 14, fontSize: 13 },
});