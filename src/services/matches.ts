import type { JoinRequest, Match, Position } from "../types";
import api from "./api";

export type MatchListItem = {
  id: number;
  venueName: string;
  startTime: string;
  levelMin: number;
  levelMax: number;
  feePerPlayer?: number;
  status: "OPEN" | "FILLED" | "CANCELLED";
  positionsNeeded: Partial<Record<Position, number>>;
};

export const MatchesApi = {
  list: (): Promise<MatchListItem[]> => api.get(`/api/Matches`),
  detail: (id: number): Promise<Match> => api.get(`/api/Matches/${id}`),
  create: (data: any) => api.post("/api/Matches", data),
  cancel: (id: number) => api.post(`/api/Matches/${id}/cancel`),

  // 🔧 Değişiklik: ikinci parametre artık body -> { position: Position }
  sendRequest: (id: number, body: { position: Position }) =>
    api.post(`/api/Matches/${id}/requests`, body),
};

export const RequestsApi = {
  listPending: (matchId: number): Promise<JoinRequest[]> =>
    api.get(`/api/requests/match/${matchId}`),
  accept: (id: number) => api.post(`/api/requests/${id}/accept`),
  reject: (id: number) => api.post(`/api/requests/${id}/reject`),
};
