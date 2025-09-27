import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAppStore } from '../src/context/AppStore';
import type { Match, Review } from '../src/types';

function isWithin72hPast(iso: string) {
  const start = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - start;
  return diff > 0 && diff <= 72 * 60 * 60 * 1000;
}

export default function ReviewsScreen() {
  const { state, dispatch } = useAppStore();
  const currentUserId = state.currentUserId;

  const eligiblePairs = useMemo(() => {
    const pairs: { match: Match; toUserId: number }[] = [];
    state.matches.forEach(m => {
      if (!isWithin72hPast(m.startTime)) return;
      const alreadyLeftBy = (toId: number) => state.reviews.some(r => r.matchId === m.id && r.fromUserId === currentUserId && r.toUserId === toId);
      if (currentUserId === m.ownerId) {
        // host rates players (excluding self)
        m.roster
          .filter(r => r.userId !== m.ownerId)
          .forEach(r => { if (!alreadyLeftBy(r.userId)) pairs.push({ match: m, toUserId: r.userId }); });
      } else {
        // player rates host
        if (m.roster.some(r => r.userId === currentUserId) && !alreadyLeftBy(m.ownerId)) {
          pairs.push({ match: m, toUserId: m.ownerId });
        }
      }
    });
    return pairs;
  }, [state.matches, state.reviews, state.currentUserId]);

  const [stars, setStars] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const data = eligiblePairs.map(p => {
    const toUser = state.users.find(u => u.id === p.toUserId)?.name ?? `Kişi #${p.toUserId}`;
    const key = `${p.match.id}-${p.toUserId}`;
    return { key, toUserId: p.toUserId, match: p.match, toUser };
  });

  function submit(item: { key: string; toUserId: number; match: Match; toUser: string }) {
    const s = stars[item.key] ?? 0;
    if (s <= 0) { Alert.alert('Lütfen yıldız verin'); return; }
    const review: Review = {
      id: Math.floor(Math.random() * 1_000_000),
      matchId: item.match.id,
      fromUserId: currentUserId,
      toUserId: item.toUserId,
      stars: s,
      comment: comments[item.key],
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_REVIEW', review });
    Alert.alert('Teşekkürler', `${item.toUser} için ${s}⭐ verdiniz.`);
  }

  const renderItem = ({ item }: { item: { key: string; toUserId: number; match: Match; toUser: string } }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.toUser}</Text>
      <Text style={styles.meta}>Maç #{item.match.id} – {new Date(item.match.startTime).toLocaleString()}</Text>

      <View style={styles.stars}>
        {[1,2,3,4,5].map(n => (
          <TouchableOpacity key={n} onPress={() => setStars(s => ({ ...s, [item.key]: n }))}>
            <FontAwesome name={(stars[item.key] ?? 0) >= n ? 'star' : 'star-o'} size={28} />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Yorum (opsiyonel)"
        value={comments[item.key] ?? ''}
        onChangeText={t => setComments(c => ({ ...c, [item.key]: t }))}
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.submit} onPress={() => submit(item)}>
        <Text style={styles.submitText}>Gönder</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={i => i.key}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Şu an puanlayacağın kişi yok.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginVertical: 8, elevation: 2 },
  title: { fontSize: 18, fontWeight: '600' },
  meta: { color: '#555', marginTop: 4 },
  stars: { flexDirection: 'row', gap: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginTop: 10, minHeight: 60 },
  submit: { backgroundColor: '#111', paddingVertical: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: '600' },
});
