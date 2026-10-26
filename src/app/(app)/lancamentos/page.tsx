"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Lock, ArrowLeftRight } from "lucide-react";
import {
  useLancamentos,
  useCreateLancamento,
  useUpdateLancamento,
  useDeleteLancamento,
  LancamentoInput,
} from "@/hooks/use-lancamentos";
import { useCategorias } from "@/hooks/use-categorias";
import { Lancamento } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageSpinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirm } from "@/components/confirm-provider";
import { extractErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate, todayIso } from "@/lib/format";
import { formaPagamentoLabel, tipoLancamentoLabel } from "@/lib/labels";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  categoriaId: z.coerce.number().min(1, "Categoria e obrigatoria"),
  descricao: z.string().min(1, "Descricao e obrigatoria"),
  valor: z.coerce.number().positive("Valor deve ser maior que zero"),
  dataLancamento: z.string().min(1, "Data e obrigatoria"),
  formaPagamento: z.enum(["DINHEIRO", "PIX", "CARTAO_CREDITO", "CARTAO_DEBITO", "TRANSFERENCIA", "BOLETO"]),
});

type FormValues = z.infer<typeof schema>;

export default function LancamentosPage() {
  const { isAdmin } = useAuth();

  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"" | "ENTRADA" | "SAIDA">("");

  const { data: lancamentos, isLoading } = useLancamentos({
    dataInicio: filtroDataInicio,
    dataFim: filtroDataFim,
    tipo: filtroTipo,
  });
  const { data: categoriasEntrada } = useCategorias("ENTRADA");
  const { data: categoriasSaida } = useCategorias("SAIDA");

  const createLancamento = useCreateLancamento();
  const updateLancamento = useUpdateLancamento();
  const deleteLancamento = useDeleteLancamento();
  const confirm = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lancamento | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const tipoSelecionado = watch("tipo");
  const categoriasDisponiveis = tipoSelecionado === "SAIDA" ? categoriasSaida : categoriasEntrada;

  function abrirNovo() {
    setEditing(null);
    reset({
      tipo: "ENTRADA",
      categoriaId: undefined,
      descricao: "",
      valor: undefined,
      dataLancamento: todayIso(),
      formaPagamento: "DINHEIRO",
    });
    setError(null);
    setModalOpen(true);
  }

  function abrirEdicao(lancamento: Lancamento) {
    setEditing(lancamento);
    reset({
      tipo: lancamento.tipo,
      categoriaId: lancamento.categoriaId,
      descricao: lancamento.descricao,
      valor: lancamento.valor,
      dataLancamento: lancamento.dataLancamento,
      formaPagamento: lancamento.formaPagamento,
    });
    setError(null);
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    const input: LancamentoInput = values;
    try {
      if (editing) {
        await updateLancamento.mutateAsync({ id: editing.id, input });
      } else {
        await createLancamento.mutateAsync(input);
      }
      setModalOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onDelete(lancamento: Lancamento) {
    const ok = await confirm({ message: "Excluir este lancamento?", variant: "danger", confirmLabel: "Excluir" });
    if (!ok) return;
    try {
      await deleteLancamento.mutateAsync(lancamento.id);
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lancamentos"
        description="Entradas e saidas financeiras"
        action={
          <Button onClick={abrirNovo}>
            <Plus size={16} /> Novo lancamento
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label>Data inicio</Label>
            <Input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
          </div>
          <div>
            <Label>Data fim</Label>
            <Input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as "" | "ENTRADA" | "SAIDA")}>
              <option value="">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saida</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <PageSpinner />
      ) : (lancamentos ?? []).length === 0 ? (
        <Card>
          <EmptyState
            icon={ArrowLeftRight}
            title="Nenhum lancamento encontrado"
            description="Ajuste os filtros ou cadastre um novo lancamento."
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <Thead>
              <Tr>
                <Th>Data</Th>
                <Th>Tipo</Th>
                <Th>Categoria</Th>
                <Th>Descricao</Th>
                <Th>Forma</Th>
                <Th className="text-right">Valor</Th>
                <Th className="text-right">Acoes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(lancamentos ?? []).map((lancamento) => (
                <Tr key={lancamento.id}>
                  <Td>{formatDate(lancamento.dataLancamento)}</Td>
                  <Td>
                    <Badge
                      className={
                        lancamento.tipo === "ENTRADA" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }
                    >
                      {tipoLancamentoLabel[lancamento.tipo]}
                    </Badge>
                  </Td>
                  <Td>{lancamento.categoriaNome}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {lancamento.descricao}
                      {lancamento.travadoPorFechamento && (
                        <Lock size={12} className="text-slate-400" aria-label="Travado por fechamento de caixa" />
                      )}
                    </div>
                  </Td>
                  <Td>{formaPagamentoLabel[lancamento.formaPagamento]}</Td>
                  <Td
                    className={`text-right font-medium ${
                      lancamento.tipo === "ENTRADA" ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {lancamento.tipo === "SAIDA" ? "-" : ""}
                    {formatCurrency(lancamento.valor)}
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={lancamento.travadoPorFechamento}
                        onClick={() => abrirEdicao(lancamento)}
                      >
                        <Pencil size={14} />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={lancamento.travadoPorFechamento}
                          onClick={() => onDelete(lancamento)}
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar lancamento" : "Novo lancamento"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select id="tipo" {...register("tipo")}>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saida</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoriaId">Categoria *</Label>
              <Select id="categoriaId" {...register("categoriaId")}>
                <option value="">Selecione...</option>
                {(categoriasDisponiveis ?? []).map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </Select>
              {errors.categoriaId && <p className="mt-1 text-xs text-red-600">{errors.categoriaId.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descricao *</Label>
            <Input id="descricao" {...register("descricao")} />
            {errors.descricao && <p className="mt-1 text-xs text-red-600">{errors.descricao.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input id="valor" type="number" step="0.01" min="0" {...register("valor")} />
              {errors.valor && <p className="mt-1 text-xs text-red-600">{errors.valor.message}</p>}
            </div>
            <div>
              <Label htmlFor="dataLancamento">Data *</Label>
              <Input id="dataLancamento" type="date" {...register("dataLancamento")} />
            </div>
          </div>

          <div>
            <Label htmlFor="formaPagamento">Forma de pagamento *</Label>
            <Select id="formaPagamento" {...register("formaPagamento")}>
              {Object.entries(formaPagamentoLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
