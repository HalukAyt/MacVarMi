// app/match/[id].tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../src/context/AppStore';
import type { Match, Position, RosterEntry } from '../../src/types';
import RequestsModal from '../../components/RequestModal';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = Number(id);
  const { state, dispatch } = useAppStore();
  const router = useRouter();

  const match = state.matches.find(m => m.id === matchId);
  const venue = state.venues.find(v => v.id === match?.venueId);

  const [reqsOpen, setReqsOpen] = useState(false);

  if (!match) {
    return (
      <View style={styles.center}>
        <Text>Maç bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.secondary}>
          <Text>Geri dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Guard SONRASI: non-null kopya
  const m: Match = match;

  const neededEntries = useMemo(() => {
    return Object.entries(m.positionsNeeded)
      .filter(([_, n]) => (n ?? 0) > 0) as [Position, number][];
  }, [m.positionsNeeded]);

  const isOwner = state.currentUser?.id === m.ownerId;

  function sendRequest(position: Position) {
    dispatch({ type: 'SEND_JOIN_REQUEST', matchId: m.id, position });
    Alert.alert('İstek gönderildi', `${position} için başvurun iletildi.`);
  }

  function openChatWith(userId: number) {
    Alert.alert('Sohbet', `Kullanıcı #${userId} ile sohbet başlatılacak (SignalR eklenecek).`);
  }

  return (
    <ScrollView style={{backgroundColor: "#eff5d2"}} contentContainerStyle={{ padding: 16, marginTop:50 }}>
      <Text style={styles.title}>{venue?.name ?? 'Saha'}</Text>
      <View style={styles.details}>
      <Text style={styles.meta}>Tarih: {new Date(m.startTime).toLocaleString()}</Text>
      <Text style={styles.meta}>Seviye: {m.levelMin} - {m.levelMax}</Text>
      <Text style={styles.meta}>Ücret: {m.feePerPlayer ?? 0}₺</Text>
      </View>
      <Text style={[styles.status, m.status === 'OPEN' ? styles.open : styles.filled]}>
        Durum: {m.status}
      </Text>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Eksik Pozisyonlar</Text>
        <View style={styles.row}>
          {neededEntries.length === 0 ? (
            <Text style={styles.badge}>Kadro tamam 🎉</Text>
          ) : neededEntries.map(([pos, count]) => (
            <TouchableOpacity key={pos} style={styles.posBtn} onPress={() => sendRequest(pos)}>
              <Text style={styles.posText}>{pos} ({count})</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Kadro</Text>
        {m.roster.length === 0 ? (
          <Text style={styles.faint}>Henüz katılan yok.</Text>
        ) : m.roster.map((r: RosterEntry, i) => (
          <View key={`${r.userId}-${i}`} style={styles.rosterItem}>
            <Text style={styles.rosterText}>
              #{r.userId} • {r.position} • {new Date(r.joinedAt).toLocaleTimeString()}
            </Text>
            {isOwner && (
              <TouchableOpacity onPress={() => openChatWith(r.userId)}>
                <Text style={styles.link}>Sohbet</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {isOwner && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primary} onPress={() => setReqsOpen(true)}>
            <Text style={styles.primaryText}>Bekleyen İstekler</Text>
          </TouchableOpacity>
        </View>
      )}

      <RequestsModal visible={reqsOpen} onClose={() => setReqsOpen(false)} matchId={m.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  meta: { color: '#fff', marginTop: 6, fontSize:18, fontWeight: '700' },
  status: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, color: '#fff' },
  open: { backgroundColor: '#rgb(0, 255, 153)', fontSize:18, fontWeight:700, color:"#000", marginTop:10, marginBottom:3 },
  filled: { backgroundColor: 'red', fontSize:18, fontWeight:700, color:"#fff", marginTop:10, marginBottom:3 },
  block: { marginTop: 16, backgroundColor: '#788371', borderRadius: 12, padding: 12, elevation: 2, },
  blockTitle: { fontWeight: '700', marginBottom: 8 , color:"#fff", fontSize:18 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  posBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#e6f0ff' },
  posText: { fontWeight: '600' },
  badge: { backgroundColor: '#e1ffe1', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  faint: { color: '#777' },
  rosterItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee' },
  rosterText: { fontWeight: '700', color:"#fff", fontSize:18 },
  link: { color: '#859F3D', fontSize:18,fontWeight:"700", backgroundColor:"#fff",borderRadius:8, padding:4},
  actions: { marginTop: 16, width:150, alignSelf:"center" },
  primary: { backgroundColor: '#fff', paddingVertical: 12, borderRadius: 10, alignItems: 'center',borderWidth:2,borderColor:"black" },
  primaryText: { color: '#859f3d', fontWeight: '700', fontSize:18 },
  secondary: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  details:{marginRight:200 , backgroundColor:"#4B4D47" , borderRadius:12 , borderWidth:1, borderColor:"#000" , paddingLeft:10 , marginTop:15}
});
