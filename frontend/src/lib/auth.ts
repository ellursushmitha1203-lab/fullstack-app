import apiClient from "./apiClient";

export async function loginUser(email: string, password: string) {
  const res = await apiClient.post("/auth/login", { email, password });
  return res.data;
}

export async function registerUser(name: string, email: string, password: string) {
  const res = await apiClient.post("/auth/register", { name, email, password });
  return res.data;
}

export async function logoutUser() {
  const res = await apiClient.post("/auth/logout");
  return res.data;
}

export async function refreshToken() {
  const res = await apiClient.post("/auth/refresh");
  return res.data;
}

export async function getProfile() {
  const res = await apiClient.get("/users/me");
  return res.data;
}

export async function getUserProgress() {
  const res = await apiClient.get("/users/me/progress");
  return res.data;
}
