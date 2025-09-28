import { useRouter } from "expo-router";
import React from "react";
import { Alert, Button, View } from "react-native";
import { AuthApi } from "@/src/services/auth";
import { useAppStore } from "@/src/context/AppStore";

export default function Settings() {
  const router = useRouter();
  const { dispatch } = useAppStore();

  const logout = async () => {
    await AuthApi.logout();              // auth_token + memToken temizlenir
    dispatch({ type: "AUTH_CLEAR" });    // token=null, currentUser=null
    dispatch({ type: "CLEAR_DOMAIN" });  // matches=[], requests=[] ...
    Alert.alert("Çıkış yapıldı");
    router.replace("/auth/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="Çıkış Yap" onPress={logout} />
    </View>
  );
}
