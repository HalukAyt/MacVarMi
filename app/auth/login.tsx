import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { AuthApi } from "../../src/services/auth";
import { useAppStore } from "../../src/context/AppStore";
import { getUserIdFromToken } from "../../src/utils/auth";

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
      const res = await AuthApi.login(email, password);     // token AsyncStorage’a yazıldı
      if (!res?.token) throw new Error("Token alınamadı.");

      // 🔑 token’dan userId al ve store’a yaz
      const uid = res.userId ?? getUserIdFromToken(res.token);
      if (!uid) throw new Error("Kullanıcı kimliği çözümlenemedi.");

      dispatch({
        type: "AUTH_SET",
        token: res.token,
        currentUser: { id: uid, name: res.name, email: res.email },
      });
      // önceki kullanıcının verileri kalmasın
      dispatch({ type: "CLEAR_DOMAIN" });

      router.replace("/(tabs)/matches");
    } catch (e: any) {
      const msg = e?.message || "Giriş başarısız";
      Alert.alert("Giriş başarısız", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 16, gap: 12, marginTop: 50 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <Button title={loading ? "Giriş yapılıyor..." : "Giriş yap"} onPress={onLogin} disabled={loading} />
      <Button title="Kayıt ol" onPress={() => router.push("/auth/register")} />
    </View>
  );
}
