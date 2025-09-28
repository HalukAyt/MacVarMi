import api, { setToken, clearToken } from "./api";

type AuthResponse = {
  userId: number;
  name: string;
  email: string;
  token: string;
  expiresAt: string;
};

export const AuthApi = {
  register: async (name: string, email: string, password: string) => {
    const res: AuthResponse = await api.post("/api/auth/register", { name, email, password });
    if (res.token) {
      await setToken(res.token);   // token kaydet
    }
    return res;
  },

  login: async (email: string, password: string) => {
    const res: AuthResponse = await api.post("/api/auth/login", { email, password });
    if (res.token) {
      await setToken(res.token);   // token kaydet
    }
    return res;
  },

  logout: async () => {
    await clearToken();            // token sil
  },
};
