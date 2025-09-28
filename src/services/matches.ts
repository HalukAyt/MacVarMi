import api from "./api";
import type { Position } from "../types";

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
  // liste: opsiyonel excludeOwned
  list: (excludeOwned?: boolean): Promise<MatchListItem[]> =>
    api.get(`/api/Matches${excludeOwned ? `?excludeOwned=true` : ""}`),

  // "maçlarım"
  mine: (): Promise<MatchListItem[]> =>
    api.get(`/api/Matches/mine`),

  detail: (id: number) => api.get(`/api/Matches/${id}`),
  create: (data: any) => api.post("/api/Matches", data),
  cancel: (id: number) => api.post(`/api/Matches/${id}/cancel`),

  sendRequest: (id: number, body: { position: Position }) =>
    api.post(`/api/Matches/${id}/requests`, body),
};
