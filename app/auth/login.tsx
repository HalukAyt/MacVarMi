import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import { AuthApi } from "../../src/services/auth";
import { useAppStore } from "../../src/context/AppStore";
import { getUserIdFromToken } from "../../src/utils/auth";
import { FontAwesome } from "@expo/vector-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { dispatch } = useAppStore();

  async function onLogin() {
    if (!email || !password) {
      Alert.alert("Eksik bilgi", "Email ve şifre gerekli.");
      return;
    }
    try {
      setLoading(true);
      const res = await AuthApi.login(email, password);
      if (!res?.token) throw new Error("Token alınamadı.");

      const uid = res.userId ?? getUserIdFromToken(res.token);
      if (!uid) throw new Error("Kullanıcı kimliği çözümlenemedi.");

      dispatch({
        type: "AUTH_SET",
        token: res.token,
        currentUser: { id: uid, name: res.name, email: res.email },
      });
      dispatch({ type: "CLEAR_DOMAIN" });

      router.replace("/(tabs)");
    } catch (e: any) {
      const msg = e?.message || "Giriş başarısız";
      Alert.alert("Giriş başarısız", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/pitch-hd-foto.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* İstersen siyah perde: opacity ile koyulaştır */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.45)" }]} />

        {/* ORTALAMA KAPSAYICI */}
        <View style={styles.center}>
          {/* CARD */}
          <View style={styles.card}>
            <View style={styles.header}>
              <FontAwesome name="user" size={52} color="#111827" />
            </View>

            <Text style={styles.title}>Giriş Yap</Text>

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="#6b7280"
            />
            <TextInput
              placeholder="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#6b7280"
            />

            <Text style={styles.remember}>Beni Hatırla</Text>

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={onLogin}
              disabled={loading}
            >
              <Text style={styles.btnText}>
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.remember}>Hesabın yok mu?</Text>

            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              activeOpacity={0.8}
              onPress={() => router.push("/auth/register")}
            >
              <Text style={[styles.btnText, styles.btnTextSecondary]}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // EKRAN ORTALAMA
  center: {
    flex: 1,
    justifyContent: "center",   // dikey ortalama
    alignItems: "center",       // yatay ortalama
    padding: 16,
  },

  // KART
  card: {
    width: "88%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },

  header: {
    alignSelf: "center",
    height: 90,
    width: 90,
    borderRadius: 45,
    backgroundColor: "#eff5d2",
    borderWidth: 3,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  title: {
    alignSelf: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  input: {
    width: "100%",              // Kart içinde tam genişlik
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    color: "#111827",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
  },

  remember: {
    marginTop: 10,
    color: "#111827",
    fontWeight: "700",
    textAlign: "left",
  },

  btn: {
    marginTop: 14,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#111827",
  },
  btnTextSecondary: { color: "#111827" },
});
