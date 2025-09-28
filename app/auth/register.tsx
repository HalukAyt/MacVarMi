import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { AuthApi } from "../../src/services/auth";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken } from "../../src/services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function onRegister() {
    try {
      const res = await AuthApi.register(name, email, password); // { token, ... }
      await AsyncStorage.setItem("token", res.token);
      setToken(res.token);
      router.replace("/(tabs)/matches");
    } catch (e: any) {
      Alert.alert("Kayıt başarısız", e.message ?? "Bir hata oluştu");
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <TextInput
        placeholder="Ad"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
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
      <Button title="Kayıt ol" onPress={onRegister} />
    </View>
  );
}
