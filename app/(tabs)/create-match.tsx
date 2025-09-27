import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MatchesApi } from "../../src/services/matches";

// Basit bir Input helper
function NumInput({
  label, value, onChangeText, placeholder
}: { label: string; value: string; onChangeText: (t: string) => void; placeholder?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType="number-pad"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
      />
    </View>
  );
}

export default function CreateMatch() {
  const router = useRouter();

  // Form state
  const [venueId, setVenueId] = useState<string>("1");      // TODO: Picker ile Venue seçimi
  const [dateISO, setDateISO] = useState<string>(new Date(Date.now() + 2 * 3600_000).toISOString());
  const [levelMin, setLevelMin] = useState<string>("3");
  const [levelMax, setLevelMax] = useState<string>("6");
  const [fee, setFee] = useState<string>("120");

  // Pozisyon ihtiyaçları
  const [gk, setGk] = useState<string>("1");
  const [def, setDef] = useState<string>("1");
  const [mid, setMid] = useState<string>("0");
  const [fwd, setFwd] = useState<string>("0");

  async function onCreate() {
    // basit validasyon
    const vId = Number(venueId);
    const lMin = Number(levelMin);
    const lMax = Number(levelMax);
    const feeVal = fee ? Number(fee) : undefined;

    if (!vId || !dateISO) return Alert.alert("Hata", "Saha ve tarih zorunludur.");
    if (Number.isNaN(lMin) || Number.isNaN(lMax) || lMin > lMax) {
      return Alert.alert("Hata", "Seviye aralığını doğru giriniz.");
    }

    const body = {
      venueId: vId,
      startTime: dateISO,     // Backend MatchCreateDto DateTime bekliyor (ISO uyumlu)
      levelMin: lMin,
      levelMax: lMax,
      feePerPlayer: feeVal ?? null,
      positionsNeeded: {
        GK: Number(gk) || 0,
        DEF: Number(def) || 0,
        MID: Number(mid) || 0,
        FWD: Number(fwd) || 0,
      },
    };

    try {
      const created = await MatchesApi.create(body); // 201 ile match dönecek
      Alert.alert("Başarılı", "Maç oluşturuldu!");
      // Detaya git
      router.replace({ pathname: "/(tabs)/match/[id]", params: { id: String(created.id) } });
    }  catch (e: any) {
  console.log("Create error:", e);               // Metro console’a tam hata
  console.log("Create error status:", e?.status);
  console.log("Create error body:", e?.body);

  Alert.alert(
    `Hata ${e?.status ?? ""}`.trim(),
    JSON.stringify(e?.body ?? e?.message ?? "Bilinmeyen hata", null, 2) // body’yi JSON.stringify ile göster
  );
}

  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.title}>Maç Oluştur</Text>

      <NumInput label="Saha (venueId)" value={venueId} onChangeText={setVenueId} placeholder="1" />

      <View style={styles.row}>
        <Text style={styles.label}>Tarih (ISO)</Text>
        <TextInput
          value={dateISO}
          onChangeText={setDateISO}
          placeholder="2025-10-01T18:30:00.000Z"
          style={styles.input}
        />
      </View>
      {/* Not: Hızlı MVP için ISO string. Sonra DateTimePicker ekleriz. */}

      <NumInput label="Seviye Min" value={levelMin} onChangeText={setLevelMin} placeholder="3" />
      <NumInput label="Seviye Max" value={levelMax} onChangeText={setLevelMax} placeholder="6" />
      <NumInput label="Kişi Başı Ücret" value={fee} onChangeText={setFee} placeholder="120" />

      <Text style={[styles.subtitle, { marginTop: 12 }]}>Eksik Pozisyonlar</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <View style={styles.posCol}><Text style={styles.posLabel}>GK</Text>
          <TextInput style={styles.posInput} keyboardType="number-pad" value={gk} onChangeText={setGk} />
        </View>
        <View style={styles.posCol}><Text style={styles.posLabel}>DEF</Text>
          <TextInput style={styles.posInput} keyboardType="number-pad" value={def} onChangeText={setDef} />
        </View>
        <View style={styles.posCol}><Text style={styles.posLabel}>MID</Text>
          <TextInput style={styles.posInput} keyboardType="number-pad" value={mid} onChangeText={setMid} />
        </View>
        <View style={styles.posCol}><Text style={styles.posLabel}>FWD</Text>
          <TextInput style={styles.posInput} keyboardType="number-pad" value={fwd} onChangeText={setFwd} />
        </View>
      </View>

      <TouchableOpacity onPress={onCreate} style={styles.primary}>
        <Text style={styles.primaryText}>Oluştur</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  subtitle: { fontWeight: "700" },
  row: { marginBottom: 10 },
  label: { marginBottom: 6, color: "#333", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  posCol: { width: "22%", alignItems: "center" },
  posLabel: { fontWeight: "700", marginBottom: 4 },
  posInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, width: "100%", textAlign: "center" },
  primary: { backgroundColor: "#111827", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 16 },
  primaryText: { color: "white", fontWeight: "700" },
});
