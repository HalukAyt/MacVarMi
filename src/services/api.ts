// src/services/api.ts
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_PORT = 5136;
const API_URL = Platform.select({
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
    memToken = await AsyncStorage.getItem("auth_token");
    return memToken;
  } catch {
    return null;
  }
}

type HttpError = { status: number; body?: any; message: string };

function safeJSONParse(t: string) { try { return JSON.parse(t); } catch { return null; } }

async function request(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (__DEV__) {
    console.log("[api] URL:", `${API_URL}${path}`);
    console.log("[api] Authorization:", headers.Authorization ? headers.Authorization.slice(0, 30) + "..." : "YOK");
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();                // 204/boş gövde güvenli
  const data = text ? safeJSONParse(text) : null;

  if (!res.ok) {
    const err: HttpError = { status: res.status, body: data ?? text, message: res.statusText };
    throw err;
  }
  return data ?? {};                         
}

const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) =>
    request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: any) =>
    request(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: (path: string) => request(path, { method: "DELETE" }),
};

export { API_URL };
export default api;
