import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Item, TipoItem } from "@/lib/types";

const KEY = ["itens"];

export interface ItemInput {
  nome: string;
  descricao?: string;
  tipo: TipoItem;
  precoUnitario: number;
  unidade?: string;
  ativo?: boolean;
}

export function useItens(tipo?: TipoItem) {
  return useQuery({
    queryKey: [...KEY, tipo ?? "TODOS"],
    queryFn: async () => (await api.get<Item[]>("/itens", { params: tipo ? { tipo } : {} })).data,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ItemInput) => (await api.post<Item>("/itens", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: ItemInput }) =>
      (await api.put<Item>(`/itens/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/itens/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
