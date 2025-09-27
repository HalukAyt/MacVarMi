// src/services/api.ts
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_PORT = 5136;
export const API_URL = Platform.select({
  android: `http://10.0.2.2:${LOCAL_PORT}`,
  ios: `http://localhost:${LOCAL_PORT}`,
  default: `http://10.0.2.2:${LOCAL_PORT}`,
}) as string;

let memToken: string | null = null;

export async function setToken(t: string) {
  memToken = t;
  try { await AsyncStorage.setItem("auth_token", t); } catch {}
}

export async function clearToken() {
  memToken = null;
  try { await AsyncStorage.removeItem("auth_token"); } catch {}
}

async function getToken(): Promise<string | null> {
  if (memToken) return memToken;
  try {
    const t = await AsyncStorage.getItem("auth_token");
    memToken = t;
    return t;
  } catch {
    return null;
  }
}

type ReqInit = Omit<RequestInit, "headers" | "body"> & {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: string | undefined;
};

async function request(path: string, init: ReqInit = {}) {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Accept": "application/json",
  };

  // Body varsa JSON gönder
  if (init.body) {
    headers["Content-Type"] = "application/json";
  }

  // Token varsa Authorization ekle
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  // 401 geldiğinde token süresi dolmuş olabilir → kullanıcıyı çıkışa yönlendirin
  if (res.status === 401) {
    // İstersen burada clearToken() çağırıp login ekranına yönlendirebilirsin
    // await clearToken();
    throw new Error("Unauthorized (401): Giriş yapmanız gerekiyor.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) =>
    request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: any) =>
    request(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: (path: string) => request(path, { method: "DELETE" }),
};

export default api;
