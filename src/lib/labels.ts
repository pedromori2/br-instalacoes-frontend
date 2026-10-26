import {
  FormaPagamento,
  Role,
  StatusFechamento,
  StatusOrcamento,
  TipoDesconto,
  TipoItem,
  TipoLancamento,
} from "./types";

export const tipoLancamentoLabel: Record<TipoLancamento, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saida",
};

export const tipoItemLabel: Record<TipoItem, string> = {
  PRODUTO: "Produto",
  SERVICO: "Servico",
};

export const formaPagamentoLabel: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  CARTAO_CREDITO: "Cartao de credito",
  CARTAO_DEBITO: "Cartao de debito",
  TRANSFERENCIA: "Transferencia",
  BOLETO: "Boleto",
};

export const statusOrcamentoLabel: Record<StatusOrcamento, string> = {
  RASCUNHO: "Rascunho",
  ENVIADO: "Enviado",
  APROVADO: "Aprovado",
  FINALIZADO: "Finalizado",
  REJEITADO: "Rejeitado",
  CANCELADO: "Cancelado",
};

export const statusOrcamentoColor: Record<StatusOrcamento, string> = {
  RASCUNHO: "bg-slate-100 text-slate-700",
  ENVIADO: "bg-blue-100 text-blue-700",
  APROVADO: "bg-emerald-100 text-emerald-700",
  FINALIZADO: "bg-teal-100 text-teal-700",
  REJEITADO: "bg-red-100 text-red-700",
  CANCELADO: "bg-slate-200 text-slate-500",
};

export const tipoDescontoLabel: Record<TipoDesconto, string> = {
  NENHUM: "Sem desconto",
  PERCENTUAL: "Percentual (%)",
  VALOR_FIXO: "Valor fixo (R$)",
};

export const statusFechamentoLabel: Record<StatusFechamento, string> = {
  ABERTO: "Aberto",
  FECHADO: "Fechado",
};

export const roleLabel: Record<Role, string> = {
  ADMIN: "Administrador",
  OPERADOR: "Operador",
};
