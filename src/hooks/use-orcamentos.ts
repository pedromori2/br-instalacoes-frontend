import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FormaPagamento, Orcamento, StatusOrcamento, TipoDesconto } from "@/lib/types";

const KEY = ["orcamentos"];

export interface OrcamentoItemInput {
  itemId: number;
  descricaoPersonalizada?: string;
  quantidade: number;
  valorUnitario?: number;
  tipoDesconto?: TipoDesconto;
  valorDesconto?: number;
}

export interface OrcamentoInput {
  clienteId: number;
  dataOrcamento: string;
  dataValidade?: string;
  observacoes?: string;
  itens?: OrcamentoItemInput[];
}

export function useOrcamentos(status?: StatusOrcamento) {
  return useQuery({
    queryKey: [...KEY, status ?? "TODOS"],
    queryFn: async () => (await api.get<Orcamento[]>("/orcamentos", { params: status ? { status } : {} })).data,
  });
}

export function useOrcamento(id: number | null) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: async () => (await api.get<Orcamento>(`/orcamentos/${id}`)).data,
    enabled: id !== null,
  });
}

export function useCreateOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: OrcamentoInput) => (await api.post<Orcamento>("/orcamentos", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateOrcamentoHeader() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: OrcamentoInput }) =>
      (await api.put<Orcamento>(`/orcamentos/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAdicionarItemOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orcamentoId, input }: { orcamentoId: number; input: OrcamentoItemInput }) =>
      (await api.post<Orcamento>(`/orcamentos/${orcamentoId}/itens`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarItemOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orcamentoId,
      itemId,
      input,
    }: {
      orcamentoId: number;
      itemId: number;
      input: OrcamentoItemInput;
    }) => (await api.put<Orcamento>(`/orcamentos/${orcamentoId}/itens/${itemId}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRemoverItemOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orcamentoId, itemId }: { orcamentoId: number; itemId: number }) =>
      (await api.delete<Orcamento>(`/orcamentos/${orcamentoId}/itens/${itemId}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarStatusOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      formaPagamento,
    }: {
      id: number;
      status: StatusOrcamento;
      formaPagamento?: FormaPagamento;
    }) => (await api.patch<Orcamento>(`/orcamentos/${id}/status`, { status, formaPagamento })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/orcamentos/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
