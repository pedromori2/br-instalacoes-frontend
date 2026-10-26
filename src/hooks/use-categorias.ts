import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Categoria, TipoLancamento } from "@/lib/types";

const KEY = ["categorias"];

export interface CategoriaInput {
  nome: string;
  tipo: TipoLancamento;
  descricao?: string;
}

export function useCategorias(tipo?: TipoLancamento) {
  return useQuery({
    queryKey: [...KEY, tipo ?? "TODAS"],
    queryFn: async () => (await api.get<Categoria[]>("/categorias", { params: tipo ? { tipo } : {} })).data,
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CategoriaInput) => (await api.post<Categoria>("/categorias", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categorias/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
