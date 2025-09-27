import React, { createContext, useContext, useReducer } from 'react';
import type {
  Match,
  MatchStatus,
  Venue,
  Position,
  JoinRequest,
  RequestStatus,
  User,
  RosterEntry,
} from '../types';

// ---------- STATE & ACTION ----------
type State = {
  currentUser?: User;
  matches: Match[];
  venues: Venue[];
  requests: JoinRequest[];
};

type Action =
  | { type: 'SEND_JOIN_REQUEST'; matchId: number; position: Position }
  | { type: 'ACCEPT_REQUEST'; requestId: number }
  | { type: 'REJECT_REQUEST'; requestId: number }
  | { type: 'CANCEL_REQUEST'; requestId: number }
  | { type: 'COMPLETE_MATCH_IF_FILLED'; matchId: number };

// ---------- INITIAL STATE (örnek seed veriyle) ----------
const initialState: State = {
  currentUser: { id: 1, name: 'demo', rating: 4.6, positions: ['GK', 'DEF', 'MID', 'FWD'] },
  matches: [
    {
      id: 1,
      ownerId: 1,
      venueId: 10,
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      levelMin: 3,
      levelMax: 6,
      feePerPlayer: 120,
      status: 'OPEN',
      positionsNeeded: { GK: 1, DEF: 1, MID: 0, FWD: 0 },
      roster: [],
    },
  ],
  venues: [{ id: 10, name: 'Kozyatağı Halı Saha' }],
  requests: [],
};

// ---------- TYPE GUARD'lar ----------
const isJoinRequest = (r: JoinRequest | null | undefined): r is JoinRequest => !!r;
const isMatch = (m: Match | null | undefined): m is Match => !!m;
const isFilled = (positionsNeeded: Match['positionsNeeded']) =>
  !Object.values(positionsNeeded).some((n) => (n ?? 0) > 0);

// ---------- REDUCER ----------
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SEND_JOIN_REQUEST': {
      const lastId = state.requests.reduce((mx, r) => Math.max(mx, r.id), 0);
      const newReq: JoinRequest = {
        id: lastId + 1,
        matchId: action.matchId,
        requesterId: state.currentUser?.id ?? 0,
        position: action.position,
        status: 'PENDING', // RequestStatus literal
        createdAt: new Date().toISOString(),
      };
      return { ...state, requests: [...state.requests.filter(isJoinRequest), newReq] };
    }

    case 'ACCEPT_REQUEST': {
      const req = state.requests.find((r) => r.id === action.requestId);
      if (!req) return state;

      const matches = state.matches.filter(isMatch).map((m): Match => {
        if (m.id !== req.matchId) return m;
        const left = Math.max(0, (m.positionsNeeded[req.position] ?? 0) - 1);
        const positionsNeeded = { ...m.positionsNeeded, [req.position]: left };

        // kabul edilen oyuncuyu roster’a ekle
        const newEntry: RosterEntry = {
          userId: req.requesterId,
          position: req.position,
          joinedAt: new Date().toISOString(),
        };
        const nextRoster = [...m.roster, newEntry];

        const nextStatus: MatchStatus = isFilled(positionsNeeded) ? 'FILLED' : m.status;
        return { ...m, positionsNeeded, roster: nextRoster, status: nextStatus };
      });

      const requests = state.requests
        .filter(isJoinRequest)
        .map((r) => (r.id === action.requestId ? { ...r, status: 'ACCEPTED' as const } : r));

      return { ...state, matches, requests };
    }

    case 'REJECT_REQUEST': {
      const requests = state.requests
        .filter(isJoinRequest)
        .map((r) => (r.id === action.requestId ? { ...r, status: 'REJECTED' as const } : r));
      return { ...state, requests };
    }

    case 'CANCEL_REQUEST': {
      const requests = state.requests
        .filter(isJoinRequest)
        .map((r) => (r.id === action.requestId ? { ...r, status: 'CANCELLED' as const } : r));
      return { ...state, requests };
    }

    case 'COMPLETE_MATCH_IF_FILLED': {
      const matches = state.matches.map((m) =>
        m.id === action.matchId && isFilled(m.positionsNeeded)
          ? { ...m, status: 'FILLED' as const }
          : m
      );
      return { ...state, matches };
    }

    default:
      return state;
  }
}

// ---------- CONTEXT ----------
const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

// ---------- PROVIDER (DEBUG LOG dahil) ----------
export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // DEBUG: her state güncellemesinde JSON olarak konsola bas
  React.useEffect(() => {
    console.log('--- STATE GÜNCELLENDİ ---');
    console.log(JSON.stringify(state, null, 2));
  }, [state]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

// ---------- HOOK ----------
export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
