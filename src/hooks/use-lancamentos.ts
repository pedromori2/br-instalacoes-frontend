import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FormaPagamento, Lancamento, TipoLancamento } from "@/lib/types";

const KEY = ["lancamentos"];

export interface LancamentoFiltro {
  dataInicio?: string;
  dataFim?: string;
  tipo?: TipoLancamento | "";
  categoriaId?: number | "";
}

export interface LancamentoInput {
  tipo: TipoLancamento;
  categoriaId: number;
  descricao: string;
  valor: number;
  dataLancamento: string;
  formaPagamento: FormaPagamento;
}

export function useLancamentos(filtro: LancamentoFiltro) {
  return useQuery({
    queryKey: [...KEY, filtro],
    queryFn: async () =>
      (
        await api.get<Lancamento[]>("/lancamentos", {
          params: {
            dataInicio: filtro.dataInicio || undefined,
            dataFim: filtro.dataFim || undefined,
            tipo: filtro.tipo || undefined,
            categoriaId: filtro.categoriaId || undefined,
          },
        })
      ).data,
  });
}

export function useCreateLancamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LancamentoInput) => (await api.post<Lancamento>("/lancamentos", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateLancamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: LancamentoInput }) =>
      (await api.put<Lancamento>(`/lancamentos/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLancamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/lancamentos/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
