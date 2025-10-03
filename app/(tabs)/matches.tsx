// app/(tabs)/matches.tsx
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MatchesApi, type MatchListItem } from "../../src/services/matches";

export default function Matches() {
  const router = useRouter();
  const [items, setItems] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      const data = await MatchesApi.list(true);   // 👈 kendi açtıklarını gizle
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  useFocusEffect(useCallback(() => { fetchList(); }, [fetchList]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchList(); } finally { setRefreshing(false); }
  }, [fetchList]);

  if (loading) return <Text>Yükleniyor...</Text>;

  return (
    <View style={styles.center}>
      <FlatList
        data={items}
        keyExtractor={(m) => String(m.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: "/match/[id]", params: { id: String(item.id) } })}
            activeOpacity={0.8}
          >
            <Text style={styles.title}>{item.venueName}</Text>
            <Text style={styles.font}>{new Date(item.startTime).toLocaleString()}</Text>
            <Text style={styles.font}>Seviye: {item.levelMin}-{item.levelMax} • Ücret: {item.feePerPlayer ?? 0}₺</Text>
            <Text style={styles.open}>Durum: {item.status}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ justifyContent: "center", alignItems: "center", marginTop: 100 }}>
            <Text>Açık maç yok.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {borderRadius: 8, marginTop: 40, marginRight:250, backgroundColor:"#e6cba8", paddingTop:8, paddingRight:8, paddingLeft: 8, paddingBottom:8, width:200},
  title: { fontWeight: "700", fontSize: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", width: "100%", backgroundColor:"#eff5d2" },
  font: {fontWeight:"500", fontSize:15},
  open: {backgroundColor: 'rgb(0, 255, 153)' , fontWeight:"500", fontSize:15, alignSelf:"flex-start", padding:3, borderRadius:8},
});
