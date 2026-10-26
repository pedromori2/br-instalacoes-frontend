import axios from "axios";
import { supabase } from "./supabase";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; fieldErrors?: { field: string; message: string }[] } | undefined;
    if (data?.fieldErrors && data.fieldErrors.length > 0) {
      return data.fieldErrors.map((f) => f.message).join("; ");
    }
    if (data?.message) {
      return data.message;
    }
  }
  // Erros do Supabase (ex: login invalido) chegam como Error comum, nao como AxiosError.
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}
