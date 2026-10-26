import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FechamentoCaixa } from "@/lib/types";

const KEY = ["caixa"];

export function useHistoricoCaixa() {
  return useQuery({
    queryKey: [...KEY, "historico"],
    queryFn: async () => (await api.get<FechamentoCaixa[]>("/caixa/fechamentos")).data,
  });
}

export function useResumoDoDia(data: string) {
  return useQuery({
    queryKey: [...KEY, "resumo", data],
    queryFn: async () => (await api.get<FechamentoCaixa>(`/caixa/fechamentos/${data}`)).data,
    enabled: Boolean(data),
  });
}

export function useFecharCaixa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      saldoFinalInformado,
      observacoes,
    }: {
      data: string;
      saldoFinalInformado: number;
      observacoes?: string;
    }) => (await api.post<FechamentoCaixa>(`/caixa/fechamentos/${data}/fechar`, { saldoFinalInformado, observacoes }))
      .data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useReabrirCaixa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/caixa/fechamentos/${id}/reabrir`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
