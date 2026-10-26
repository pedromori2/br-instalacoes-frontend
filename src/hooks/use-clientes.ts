import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Cliente } from "@/lib/types";

const KEY = ["clientes"];

export interface ClienteInput {
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  observacoes?: string;
  ativo?: boolean;
}

export function useClientes() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await api.get<Cliente[]>("/clientes")).data,
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClienteInput) => (await api.post<Cliente>("/clientes", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: ClienteInput }) =>
      (await api.put<Cliente>(`/clientes/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/clientes/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
