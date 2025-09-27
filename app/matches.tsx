// app/matches.tsx
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '../src/context/AppStore';
import type { Match, Position } from '../src/types';

export default function Matches() {
  const { state, dispatch } = useAppStore();
  const router = useRouter();

  const openMatches = useMemo(
    () => state.matches.filter(m => m.status === 'OPEN'),
    [state.matches]
  );

  const renderItem = ({ item }: { item: Match }) => {
    const venue = state.venues.find(v => v.id === item.venueId)?.name ?? 'Saha';
    const start = new Date(item.startTime).toLocaleString();
    const neededEntries = Object.entries(item.positionsNeeded)
      .filter(([_, n]) => (n ?? 0) > 0) as [Position, number][];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
  router.push({
    pathname: '/match/[id]',
    params: { id: String(item.id) },
  })
}

        activeOpacity={0.8}
      >
        <Text style={styles.title}>{venue}</Text>
        <Text style={styles.meta}>Başlangıç: {start}</Text>
        <Text style={styles.meta}>
          Seviye: {item.levelMin}-{item.levelMax} • Kişi Başı: {item.feePerPlayer ?? 0}₺
        </Text>

        <View style={styles.row}>
          {neededEntries.length === 0 ? (
            <Text style={styles.badge}>Kadro tamam</Text>
          ) : neededEntries.map(([pos, count]) => (
            <View key={pos} style={styles.posBtn}>
              <Text style={styles.posText}>{pos} ({count})</Text>
            </View>
          ))}
        </View>

        <Text style={styles.detailHint}>Detay için dokun</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList<Match>
        data={openMatches}
        keyExtractor={(m) => String(m.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Açık maç yok.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginVertical: 8, elevation: 2 },
  title: { fontSize: 18, fontWeight: '600' },
  meta: { color: '#444', marginTop: 4 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  posBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#e6f0ff' },
  posText: { fontWeight: '600' },
  badge: { backgroundColor: '#e1ffe1', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  detailHint: { marginTop: 10, color: '#777', fontSize: 12 }
});
