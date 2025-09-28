// app/(tabs)/index.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MatchesApi, type MatchListItem } from "@/src/services/matches";
import { useAppStore } from "@/src/context/AppStore";

export default function Home() {
  const router = useRouter();
  const { state } = useAppStore();
  const name = state.currentUser?.name ?? "Hoş geldin";

  const [items, setItems] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOpenMatches = useCallback(async () => {
    try {
      const list = await MatchesApi.list();
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpenMatches();
  }, [fetchOpenMatches]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOpenMatches();
    } finally {
      setRefreshing(false);
    }
  }, [fetchOpenMatches]);

  // En yakın 3 maçı göster
  const top3 = useMemo(() => {
    return [...items]
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      .slice(0, 3);
  }, [items]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#eff5d2" }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Karşılama bloğu */}
      <View style={styles.hero}>
        <View>
          <Text style={styles.hello}>{name} 👋</Text>
          <Text style={styles.subtitle}>Hadi bir maç bulalım ya da oluşturalım.</Text>
        </View>
        <FontAwesome name="soccer-ball-o" size={36} color="#111827" />
      </View>

      {/* Hızlı Aksiyonlar */}
      <View style={styles.quickRow}>
        <QuickAction
          icon="plus-square"
          label="Maç Oluştur"
          onPress={() => router.push("/create-match")}
        />
        <QuickAction
          icon="calendar"
          label="Maçlar"
          onPress={() => router.push("/matches")}
        />
        <QuickAction
          icon="list"
          label="Maçlarım"
          onPress={() => router.push("/my-matches")}
        />
      </View>

      {/* İstatistik/özet kartları (isteğe bağlı) */}
      <View style={styles.statsRow}>
        <StatCard
          title="Bekleyen İstek"
          value={String(
            state.requests?.filter((r) => r.status === "PENDING").length ?? 0
          )}
        />
      </View>

      {/* Yaklaşan Maçlar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yaklaşan Maçlar</Text>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={{ marginLeft: 8 }}>Yükleniyor…</Text>
          </View>
        ) : top3.length === 0 ? (
          <EmptyState
            text="Şu an açık maç yok."
            cta="Tüm Maçlar"
            onPress={() => router.push("/matches")}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {top3.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({ pathname: "/match/[id]", params: { id: String(m.id) } })
                }
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.cardTitle}>{m.venueName}</Text>
                  <Badge text={m.status === "OPEN" ? "Açık" : m.status} />
                </View>
                <Text style={styles.cardLine}>
                  {new Date(m.startTime).toLocaleString()}
                </Text>
                <Text style={styles.cardLine}>
                  Seviye: {m.levelMin}-{m.levelMax} • Ücret: {m.feePerPlayer ?? 0}₺
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {top3.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/matches")}
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
            <FontAwesome name="angle-right" size={18} color="#111827" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

/* ---------------- Components ---------------- */

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof FontAwesome.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quick} onPress={onPress} activeOpacity={0.85}>
      <FontAwesome name={icon} size={22} color="#111827" />
      <Text style={styles.quickText}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function Badge({ text }: { text: string }) {
  const isOpen = text?.toUpperCase?.() === "OPEN" || text === "Açık";
  return (
    <View style={[styles.badge, { backgroundColor: isOpen ? "#d1fae5" : "#fee2e2" }]}>
      <Text style={[styles.badgeText, { color: isOpen ? "#065f46" : "#991b1b" }]}>{text}</Text>
    </View>
  );
}

function EmptyState({
  text,
  cta,
  onPress,
}: {
  text: string;
  cta?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
      {!!cta && !!onPress && (
        <TouchableOpacity onPress={onPress} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>{cta}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  hero: {
    backgroundColor: "#E1FAD3",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  hello: { fontSize: 20, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 6, color: "#374151", fontWeight: "500" },

  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quick: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickText: { fontWeight: "700", color: "#111827" },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statValue: { fontSize: 22, fontWeight: "800", color: "#111827" },
  statTitle: { marginTop: 4, color: "#6b7280", fontWeight: "600" },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 12 },

  loadingRow: { flexDirection: "row", alignItems: "center" },

  card: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: { fontWeight: "800", fontSize: 16, color: "#111827" },
  cardLine: { color: "#374151", marginTop: 4, fontWeight: "600" },

  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#E1FAD3",
    borderRadius: 10,
  },
  seeAllText: { fontWeight: "800", color: "#111827" },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontWeight: "800", fontSize: 12 },

  empty: { alignItems: "center", paddingVertical: 10, gap: 8 },
  emptyText: { color: "#6b7280", fontWeight: "600" },
  emptyBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyBtnText: { color: "#fff", fontWeight: "800" },
});
