// app/match/[id].tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../src/context/AppStore';
import type { Match, Position, RosterEntry, Venue } from '../../src/types';
import { MatchesApi } from '../../src/services/matches';
import RequestsModal from '../../components/RequestModal';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = Number(id);
  const { state, dispatch } = useAppStore();
  const router = useRouter();

  // 1) Local/Remote state
  const local: Match | null = state.matches.find((m: Match) => m.id === matchId) ?? null;
  const [remote, setRemote] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reqsOpen, setReqsOpen] = useState<boolean>(false);

  // Tek yerden fetch
  async function reload() {
    if (!matchId) return;
    try {
      const fresh = await MatchesApi.detail(matchId); // backend Get(id) -> Include(Roster, PositionsNeeded)
      setRemote(fresh);                               // ekran anında güncellenir
    } catch {}
  }

  // Sayfa açılışında çek
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!matchId) return;
      try {
        setLoading(true);
        setLoadError(null);
        const data = await MatchesApi.detail(matchId);
        if (!cancelled) setRemote(data);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || 'Maç bilgisi alınamadı.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [matchId]);

  // Modal kapandığında tazele (kabul/ret sonrası)
  useEffect(() => { if (!reqsOpen) reload(); }, [reqsOpen]);

  // 3) Kaynak: önce remote, yoksa local
  const m: Match | null = remote ?? local;

  // Eksik pozisyonlar
  const neededEntries = useMemo(() => {
    const positions = m?.positionsNeeded ?? {};
    return Object.entries(positions)
      .filter(([_, n]) => (n ?? 0) > 0) as [Position, number][];
  }, [m]);

  // Loading
  if (!m && loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Maç yükleniyor...</Text>
      </View>
    );
  }

  // Hata / bulunamadı
  if (!m) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 8 }}>{loadError ?? 'Maç bulunamadı.'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.secondary}>
          <Text>Geri dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Render verileri ---
  const matchData: Match = m;

  // Store’dan venue (olmayabilir)
  const venueFromStore: Venue | undefined = state.venues.find((v: Venue) => v.id === matchData.venueId);

  // Başlıkta saha adını garanti et: venueName (DTO) -> entity.venue?.name -> store -> fallback
  const titleName =
    (m as any)?.venueName ??
    (m as any)?.venue?.name ??
    venueFromStore?.name ??
    `Saha #${matchData.venueId}`;

  const currentUserId: number | null = state.currentUser?.id ?? null;
  const isOwner =
    currentUserId != null &&
    matchData.ownerId != null &&
    Number(currentUserId) === Number(matchData.ownerId);

  const myPending =
    currentUserId != null &&
    state.requests.some((r: any) => r.matchId === matchData.id && r.requesterId === currentUserId && r.status === 'PENDING');

  const myAccepted =
    currentUserId != null &&
    matchData.roster.some((r: RosterEntry) => r.userId === currentUserId);

  const canRequest =
    currentUserId != null &&
    !isOwner &&
    matchData.status === 'OPEN' &&
    !myPending &&
    !myAccepted;

  async function sendRequest(position: Position) {
    if (!canRequest) {
      Alert.alert(
        'Başvuru yapılamaz',
        isOwner
          ? 'Maç sahibi kendi maçına başvuramaz.'
          : myAccepted
          ? 'Zaten kadrodasın.'
          : myPending
          ? 'Zaten bekleyen bir başvurun var.'
          : matchData.status !== 'OPEN'
          ? 'Maç açık değil.'
          : currentUserId == null
          ? 'Oturum bulunamadı.'
          : 'Başvuru koşulları sağlanmıyor.'
      );
      return;
    }

    try {
      const normalized = position.toUpperCase() as Position;
      await MatchesApi.sendRequest(matchData.id, { position: normalized });
      dispatch({ type: 'SEND_JOIN_REQUEST', matchId: matchData.id, position: normalized });
      Alert.alert('İstek gönderildi', `${normalized} için başvurun iletildi.`);
      await reload(); // kendi başvurundan sonra da güncelle
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data ??
        e?.message ??
        'Başvuru sırasında bir hata oluştu.';
      Alert.alert('Başarısız', String(msg));
    }
  }

  return (
    <ScrollView style={{ backgroundColor: '#eff5d2' }} contentContainerStyle={{ padding: 16, marginTop: 50 }}>
      <Text style={styles.title}>{titleName}</Text>

      <View style={styles.details}>
        <Text style={styles.meta}>Tarih: {new Date(matchData.startTime).toLocaleString()}</Text>
        <Text style={styles.meta}>Seviye: {matchData.levelMin} - {matchData.levelMax}</Text>
        <Text style={styles.meta}>Ücret: {matchData.feePerPlayer ?? 0}₺</Text>
      </View>

      <Text style={[styles.status, matchData.status === 'OPEN' ? styles.open : styles.filled]}>
        Durum: {matchData.status}
      </Text>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Eksik Pozisyonlar</Text>
        <View style={styles.row}>
          {neededEntries.length === 0 ? (
            <Text style={styles.badge}>Kadro tamam 🎉</Text>
          ) : neededEntries.map(([pos, count]) => {
              const disabled = (matchData.positionsNeeded[pos] ?? 0) <= 0;
              return (
                <TouchableOpacity
                  key={pos}
                  activeOpacity={0.7}
                  style={[styles.posBtn, disabled && { opacity: 0.5 }]}
                  onPress={() => !disabled && sendRequest(pos)}
                  disabled={disabled}
                >
                  <Text style={styles.posText}>{pos} ({count})</Text>
                </TouchableOpacity>
              );
            })
          }
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Kadro</Text>
        {matchData.roster.length === 0 ? (
          <Text style={styles.faint}>Henüz katılan yok.</Text>
        ) : matchData.roster.map((r: RosterEntry, i: number) => (
          <View key={`${r.userId}-${i}`} style={styles.rosterItem}>
            <Text style={styles.rosterText}>
              #{r.userId} • {r.position} • {new Date(r.joinedAt).toLocaleTimeString()}
            </Text>
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

      <RequestsModal
        visible={reqsOpen}
        onClose={() => setReqsOpen(false)}
        matchId={matchData.id}
        onChanged={reload}   // kabul/ret sonrası hemen güncelle
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  meta: { color: '#fff', marginTop: 6, fontSize: 18, fontWeight: '700' },
  status: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, color: '#fff' },
  open: { backgroundColor: 'rgb(0, 255, 153)', fontSize: 18, fontWeight: '700', color: '#000', marginTop: 10, marginBottom: 3 },
  filled: { backgroundColor: 'red', fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 10, marginBottom: 3 },
  block: { marginTop: 16, backgroundColor: '#788371', borderRadius: 12, padding: 12, elevation: 2 },
  blockTitle: { fontWeight: '700', marginBottom: 8, color: '#fff', fontSize: 18 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  posBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#e6f0ff' },
  posText: { fontWeight: '600' },
  badge: { backgroundColor: '#e1ffe1', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  faint: { color: '#ddd' },
  rosterItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee' },
  rosterText: { fontWeight: '700', color: '#fff', fontSize: 18 },
  link: { color: '#859F3D', fontSize: 18, fontWeight: '700', backgroundColor: '#fff', borderRadius: 8 },
  actions: { marginTop: 16, width: 180, alignSelf: 'center' },
  primary: { backgroundColor: '#fff', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: 'black' },
  primaryText: { color: '#859f3d', fontWeight: '700', fontSize: 18 },
  secondary: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  details: { marginRight: 200, backgroundColor: '#4B4D47', borderRadius: 12, borderWidth: 1, borderColor: '#000', paddingLeft: 10, marginTop: 15 },
});
