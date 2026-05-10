import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  // ✅ FIXED: সরাসরি API call না করে AuthContext এর login() ব্যবহার করা
  const { login } = useContext(AuthContext) as any;

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("ত্রুটি", "ইমেইল এবং পাসওয়ার্ড দিন।");
      return;
    }

    setLoading(true);
    try {
      // ✅ AuthContext.login() — সঠিক key তে save করে, state আপডেট করে
      const user = await login(email.trim(), password);

      const role   = user?.role   || 'user';
      const status = user?.status || 'pending';

      if (role === 'admin') {
        router.replace("/admin/dashboard");
      } else if (status === 'active') {
        router.replace("/home");
      } else {
        // pending — payment page
        Alert.alert(
          "একাউন্ট পেন্ডিং",
          "আপনার একাউন্ট সক্রিয় করতে পেমেন্ট করুন।"
        );
        router.replace("/initial-payment");
      }

    } catch (error: any) {
      Alert.alert(
        "লগইন ব্যর্থ",
        error?.msg || error?.message || "ইমেইল বা পাসওয়ার্ড ভুল।"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Liora</Text>
        <Text style={styles.subtitle}>Welcome Back</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>একাউন্ট নেই? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>নতুন একাউন্ট খুলুন</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 5,
  },
  form: { width: "100%" },
  input: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 16,
    color: "#1e293b",
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  btnText: { color: "white", fontSize: 18, fontWeight: "bold" },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 25,
    justifyContent: 'center',
  },
  signupText: { color: '#64748b', fontSize: 15 },
  signupLink: { color: '#2563eb', fontWeight: 'bold', fontSize: 15 },
});