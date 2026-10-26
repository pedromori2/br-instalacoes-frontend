export type Role = "ADMIN" | "OPERADOR";

export type TipoLancamento = "ENTRADA" | "SAIDA";

export type TipoItem = "PRODUTO" | "SERVICO";

export type FormaPagamento =
  | "DINHEIRO"
  | "PIX"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "TRANSFERENCIA"
  | "BOLETO";

export type StatusOrcamento =
  | "RASCUNHO"
  | "ENVIADO"
  | "APROVADO"
  | "FINALIZADO"
  | "REJEITADO"
  | "CANCELADO";

export type TipoDesconto = "NENHUM" | "PERCENTUAL" | "VALOR_FIXO";

export type StatusFechamento = "ABERTO" | "FECHADO";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  createdAt: string;
}

export interface Cliente {
  id: number;
  nome: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  createdAt: string;
}

export interface Item {
  id: number;
  nome: string;
  descricao?: string | null;
  tipo: TipoItem;
  precoUnitario: number;
  unidade: string;
  ativo: boolean;
  createdAt: string;
}

export interface Categoria {
  id: number;
  nome: string;
  tipo: TipoLancamento;
  descricao?: string | null;
}

export interface Lancamento {
  id: number;
  tipo: TipoLancamento;
  categoriaId: number;
  categoriaNome: string;
  descricao: string;
  valor: number;
  dataLancamento: string;
  formaPagamento: FormaPagamento;
  orcamentoId?: number | null;
  fechamentoCaixaId?: number | null;
  travadoPorFechamento: boolean;
  usuarioNome: string;
  createdAt: string;
}

export interface OrcamentoItem {
  id: number;
  itemId: number;
  itemNome: string;
  descricaoPersonalizada?: string | null;
  quantidade: number;
  valorUnitario: number;
  tipoDesconto: TipoDesconto;
  valorDesconto: number;
  valorTotal: number;
}

export interface Orcamento {
  id: number;
  clienteId: number;
  clienteNome: string;
  dataOrcamento: string;
  dataValidade?: string | null;
  status: StatusOrcamento;
  observacoes?: string | null;
  valorTotal: number;
  usuarioNome: string;
  createdAt: string;
  itens: OrcamentoItem[];
}

export interface FechamentoCaixa {
  id: number | null;
  dataFechamento: string;
  saldoInicial: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinalCalculado: number;
  saldoFinalInformado?: number | null;
  diferenca?: number | null;
  status: StatusFechamento;
  observacoes?: string | null;
  usuarioNome?: string | null;
  dataHoraFechamento?: string | null;
}

export interface CategoriaTotal {
  categoriaId: number;
  categoriaNome: string;
  tipo: TipoLancamento;
  total: number;
}

export interface RelatorioFinanceiro {
  dataInicio?: string | null;
  dataFim?: string | null;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  porCategoria: CategoriaTotal[];
  lancamentos: Lancamento[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: { field: string; message: string }[] | null;
}
