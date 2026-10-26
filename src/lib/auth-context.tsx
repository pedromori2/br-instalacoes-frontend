"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { api } from "./api";
import { supabase } from "./supabase";
import { Role } from "./types";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function carregarPerfil() {
    const response = await api.get<AuthUser>("/auth/me");
    setUser(response.data);
  }

  useEffect(() => {
    let active = true;

    async function restaurarSessao() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session && active) {
          await carregarPerfil();
        }
      } catch {
        // sessao invalida/expirada: segue sem usuario restaurado
      } finally {
        if (active) setIsLoading(false);
      }
    }

    restaurarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      throw new Error(error.message === "Invalid login credentials" ? "Email ou senha invalidos" : error.message);
    }
    await carregarPerfil();
  };

  const logout = () => {
    supabase.auth.signOut().finally(() => {
      setUser(null);
      window.location.href = "/login";
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAdmin: user?.role === "ADMIN", login, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
