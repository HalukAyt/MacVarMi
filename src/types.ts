export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export type MatchStatus = 'OPEN' | 'FILLED' | 'CANCELLED';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  rating?: number; // ortalama
  positions?: Position[];
}

export interface Venue {
  id: number;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface RosterEntry {
  userId: number;
  position: Position;
  joinedAt: string; // ISO
}

export interface Match {
  id: number;
  ownerId: number;
  venueId: number;
  startTime: string; // ISO
  levelMin: number;
  levelMax: number;
  feePerPlayer?: number;
  status: MatchStatus;
  positionsNeeded: Partial<Record<Position, number>>;
  roster: RosterEntry[];
}

export interface JoinRequest {
  id: number;
  matchId: number;
  requesterId: number;
  position: Position;
  status: RequestStatus;
  createdAt: string; // ISO
}

export interface Review {
  id: number;
  matchId: number;
  fromUserId: number;
  toUserId: number;
  stars: number; // 1-5
  comment?: string;
  tags?: string[];
  createdAt: string;
}
