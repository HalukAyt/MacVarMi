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
      const data = await MatchesApi.list();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // İlk açılışta
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Ekran odağa geldiğinde her seferinde yenile
  useFocusEffect(
    useCallback(() => {
      fetchList();
    }, [fetchList])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchList();
    } finally {
      setRefreshing(false);
    }
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
            onPress={() =>
              router.push({ pathname: "/match/[id]", params: { id: String(item.id) } })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.title}>{item.venueName}</Text>
            <Text>{new Date(item.startTime).toLocaleString()}</Text>
            <Text>
              Seviye: {item.levelMin}-{item.levelMax} • Ücret: {item.feePerPlayer ?? 0}₺
            </Text>
            <Text>Durum: {item.status}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ justifyContent: "center", alignItems: "center", marginTop: 100 }}>
            <Text>Açık maç yok.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "white", padding: 12, borderRadius: 8, marginVertical: 6 },
  title: { fontWeight: "700", fontSize: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", width: "100%" },
});
