import { clearToken } from "@/src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";
import { View, Text, Alert, Button } from "react-native";

export default function Settings() {
  const router = useRouter();
  async function logout() {
    
    await AsyncStorage.removeItem("token");
    clearToken();
    Alert.alert("Çıkış yapıldı");
    router.replace("/auth/login");
  }
  
  return (
       <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="Çıkış Yap" onPress={logout} />
    </View>
  );
}
