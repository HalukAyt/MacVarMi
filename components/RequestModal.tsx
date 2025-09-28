import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Alert, FlatList } from "react-native";
import { RequestsApi } from "@/src/services/requests";
import type { JoinRequest } from "@/src/types";

type Props = {
  visible: boolean;
  onClose: () => void;
  matchId: number;
  onChanged?: () => void; // 👈 YENİ
};

export default function RequestsModal({ visible, onClose, matchId, onChanged }: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<JoinRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const list: JoinRequest[] = await RequestsApi.listForMatch(matchId);
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Bekleyen istekler alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (visible) load();
  }, [visible, matchId]);

  async function accept(id: number) {
    try {
      await RequestsApi.accept(id);
      await load();          // modal listesini tazele
      onChanged?.();         // 👈 parent’a “değişti” de
      Alert.alert("Onaylandı", "İstek kabul edildi.");
    } catch (e: any) {
      Alert.alert("Hata", e?.message || "İstek kabul edilemedi.");
    }
  }

  async function reject(id: number) {
    try {
      await RequestsApi.reject(id);
      await load();
      onChanged?.();         // 👈 parent’a “değişti” de
      Alert.alert("Reddedildi", "İstek reddedildi.");
    } catch (e: any) {
      Alert.alert("Hata", e?.message || "İstek reddedilemedi.");
    }
  }

  const renderItem = ({ item }: { item: JoinRequest }) => (
    <View style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderColor: "#e5e5e5" }}>
      <Text style={{ fontWeight: "600" }}>
        İstek #{item.id} • Kullanıcı: {item.requesterId} • Pozisyon: {item.position}
      </Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
        <TouchableOpacity onPress={() => accept(item.id)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#e1ffe1", borderRadius: 8 }}>
          <Text>Kabul</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => reject(item.id)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#ffe1e1", borderRadius: 8 }}>
          <Text>Reddet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 16 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, maxHeight: "80%" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Bekleyen İstekler</Text>

          {loading && <ActivityIndicator />}
          {error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}

          {!loading && !error && items.length === 0 ? (
            <Text>Bekleyen istek yok.</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(x) => String(x.id)}
              renderItem={renderItem}
              style={{ minWidth: 260 }}
            />
          )}

          <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignSelf: "flex-end" }}>
            <Text style={{ color: "#007aff" }}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
