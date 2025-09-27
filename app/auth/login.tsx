import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { setToken } from "../../src/services/api";
import { AuthApi } from "../../src/services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onLogin() {
    if (!email || !password) {
      Alert.alert("Eksik bilgi", "Email ve şifre gerekli.");
      return;
    }
    try {
      setLoading(true);
      const res = await AuthApi.login(email, password);
      await setToken(res.token);
router.replace("/(tabs)/matches");
    } catch (e: any) {
      // Hata mesajını olabildiğince anlamlı göster
      const body = e?.body;
      const msg =
        typeof body === "string"
          ? body
          : body?.message || e?.message || "Giriş başarısız";
      Alert.alert("Giriş başarısız", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
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
