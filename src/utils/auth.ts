// src/utils/auth.ts
import { jwtDecode } from "jwt-decode";

type Claims = {
  sub?: string | number;
  userId?: string | number;
  nameid?: string | number;
};

export function getUserIdFromToken(token: string): number | null {
  try {
    const c = jwtDecode<Claims>(token);
    const id = c.userId ?? c.sub ?? c.nameid;
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
