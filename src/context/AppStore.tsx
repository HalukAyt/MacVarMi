// src/context/AppStore.tsx
import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from "react";
import type { Match, JoinRequest, Position, Venue } from "../types";

type UserLite = { id: number; name?: string; email?: string } | null;

export type State = {
  token: string | null;
  currentUser: UserLite;
  matches: Match[];
  requests: JoinRequest[];
  venues: Venue[];
};

const initialState: State = {
  token: null,
  currentUser: null,
  matches: [],
  requests: [],
  venues: [],
};

// ---- Actions ----
type AuthSet = { type: "AUTH_SET"; token: string; currentUser: NonNullable<UserLite> };
type AuthClear = { type: "AUTH_CLEAR" };
type ClearDomain = { type: "CLEAR_DOMAIN" };

// Sen kullanıyorsun: optimistic UI
type SendJoinRequest = { type: "SEND_JOIN_REQUEST"; matchId: number; position: Position };

// İleride başka domain action’ların varsa buraya ekle
export type Action = AuthSet | AuthClear | ClearDomain | SendJoinRequest;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "AUTH_SET":
      return { ...state, token: action.token, currentUser: action.currentUser };
    case "AUTH_CLEAR":
      return { ...state, token: null, currentUser: null };
    case "CLEAR_DOMAIN":
      return { ...state, matches: [], requests: [] };
    case "SEND_JOIN_REQUEST":
      // İstersen requests’e optimistic kayıt ekleyebilirsin; şimdilik state’i koruyoruz.
      return state;
    default:
      return state;
  }
}

const AppStoreContext = createContext<{ state: State; dispatch: Dispatch<Action> } | undefined>(undefined);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppStoreContext.Provider value={{ state, dispatch }}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within <AppStoreProvider>");
  return ctx;
}
