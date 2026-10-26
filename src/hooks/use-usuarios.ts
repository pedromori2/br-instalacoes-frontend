import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Role, Usuario } from "@/lib/types";

const KEY = ["usuarios"];

export interface UsuarioCreateInput {
  nome: string;
  email: string;
  senha: string;
  role: Role;
}

export interface UsuarioUpdateInput {
  nome: string;
  role: Role;
  ativo: boolean;
  novaSenha?: string;
}

export function useUsuarios() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await api.get<Usuario[]>("/usuarios")).data,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UsuarioCreateInput) => (await api.post<Usuario>("/usuarios", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UsuarioUpdateInput }) =>
      (await api.put<Usuario>(`/usuarios/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
