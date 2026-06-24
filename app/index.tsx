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
  const { login } = useContext(AuthContext) as any;

  // ✅ Name + Password দিয়ে লগইন — idCode ব্যাকএন্ড থেকে অটোমেটিক চেক হবে
  const [name,     setName]     = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      // AuthContext → loginUser(name, password) → backend
      // backend নিজেই idCode, referralCode সব check করে user data ফেরত দেবে
      const user = await login(name.trim(), password);

      const role   = user?.role   || 'user';
      const status = user?.status || 'pending';

      if (role === 'admin') {
        router.replace("/admin/dashboard");
      } else if (status === 'active') {
        router.replace("/home");
      } else {
        Alert.alert(
          "Account Pending",
          "Please make payment to activate your account."
        );
        router.replace("/initial-payment");
      }

    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.msg || error?.message || "Name or password is incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Liora</Text>
        <Text style={styles.subtitle}>Welcome Back</Text>
      </View>

      <View style={styles.form}>

        {/* ✅ Name Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Login Button */}
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

        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>No account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>Create New Account</Text>
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
    padding: 24,
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

  inputWrapper: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    fontSize: 16,
    color: "#1e293b",
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    elevation: 3,
  },
  btnText: { color: "white", fontSize: 18, fontWeight: "bold" },

  signupContainer: {
    flexDirection: "row",
    marginTop: 25,
    justifyContent: "center",
  },
  signupText: { color: "#64748b", fontSize: 15 },
  signupLink: { color: "#2563eb", fontWeight: "bold", fontSize: 15 },
});