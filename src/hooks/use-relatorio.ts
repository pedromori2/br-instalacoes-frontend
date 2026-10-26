import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RelatorioFinanceiro, TipoLancamento } from "@/lib/types";

export interface RelatorioFiltro {
  dataInicio?: string;
  dataFim?: string;
  tipo?: TipoLancamento | "";
  categoriaId?: number | "";
}

export function useRelatorio(filtro: RelatorioFiltro) {
  return useQuery({
    queryKey: ["relatorio", filtro],
    queryFn: async () =>
      (
        await api.get<RelatorioFinanceiro>("/relatorios/financeiro", {
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
