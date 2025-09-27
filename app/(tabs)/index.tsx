// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { setToken } from "../../src/services/api";

export default function Index() {
  const [ready, setReady] = React.useState(false);
  const [hasToken, setHasToken] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("token");
      if (t) { setToken(t); setHasToken(true); }
      else { setHasToken(false); }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // (tabs) grubunu href'te kullanma
  return hasToken ? <Redirect href="/matches" /> : <Redirect href="/auth/login" />;
}
