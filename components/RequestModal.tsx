// components/RequestsModal.tsx
import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useAppStore } from '../src/context/AppStore';
import type { JoinRequest } from '../src/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  matchId: number;
};

export default function RequestsModal({ visible, onClose, matchId }: Props) {
  const { state, dispatch } = useAppStore();

  const pending = useMemo(
    () => state.requests.filter(r => r.matchId === matchId && r.status === 'PENDING'),
    [state.requests, matchId]
  );

  function accept(id: number) {
    dispatch({ type: 'ACCEPT_REQUEST', requestId: id });
  }
  function reject(id: number) {
    dispatch({ type: 'REJECT_REQUEST', requestId: id });
  }

  const renderItem = ({ item }: { item: JoinRequest }) => (
    <View style={styles.reqRow}>
      <Text style={styles.reqText}>@{item.requesterId} • {item.position}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.ok]} onPress={() => accept(item.id)}>
          <Text style={styles.btnText}>Kabul</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.deny]} onPress={() => reject(item.id)}>
          <Text style={styles.btnText}>Reddet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Bekleyen İstekler</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>Kapat</Text></TouchableOpacity>
          </View>

          {pending.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 24 }}>Bekleyen istek yok.</Text>
          ) : (
            <FlatList
              data={pending}
              keyExtractor={(r) => String(r.id)}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  close: { color: '#2563eb' },
  reqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  reqText: { fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  ok: { backgroundColor: '#10b981' },
  deny: { backgroundColor: '#ef4444' },
  btnText: { color: 'white', fontWeight: '700' },
});
