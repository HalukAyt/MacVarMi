import { clearToken } from "@/src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert, Button, View } from "react-native";

export default function Settings() {
  const router = useRouter();
  async function logout() {
    
    await AsyncStorage.removeItem("auth_token");
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
