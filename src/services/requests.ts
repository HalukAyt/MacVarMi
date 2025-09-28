// src/services/requests.ts
import api from "./api";
import type { Position } from "../types";

export const RequestsApi = {
  // Bir maça katılma isteği gönder
  create: (matchId: number, position: Position) =>
    api.post(`/api/requests`, { matchId, position }),

  // İsteği iptal et (gönderen)
  cancel: (requestId: number) =>
    api.post(`/api/requests/${requestId}/cancel`),

  // Maç sahibi: isteği kabul/ret
  accept: (requestId: number) =>
    api.post(`/api/requests/${requestId}/accept`),
  reject: (requestId: number) =>
    api.post(`/api/requests/${requestId}/reject`),

  // Bir maçın bekleyen isteklerini getir (owner için)
  listForMatch: (matchId: number) =>
    api.get(`/api/requests/match/${matchId}`),
};
