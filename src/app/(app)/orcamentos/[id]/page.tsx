"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Pencil, Trash2, Package, Download, Printer, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import {
  useOrcamento,
  useUpdateOrcamentoHeader,
  useAdicionarItemOrcamento,
  useAtualizarItemOrcamento,
  useRemoverItemOrcamento,
  useAtualizarStatusOrcamento,
} from "@/hooks/use-orcamentos";
import { useClientes } from "@/hooks/use-clientes";
import { useItens } from "@/hooks/use-itens";
import { FormaPagamento, OrcamentoItem, StatusOrcamento } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { PrintableOrcamento } from "@/components/printable-orcamento";
import { useConfirm } from "@/components/confirm-provider";
import { extractErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  formaPagamentoLabel,
  statusOrcamentoColor,
  statusOrcamentoLabel,
  tipoDescontoLabel,
  tipoItemLabel,
} from "@/lib/labels";

const headerSchema = z.object({
  clienteId: z.coerce.number().min(1, "Cliente e obrigatorio"),
  dataOrcamento: z.string().min(1, "Data e obrigatoria"),
  dataValidade: z.string().optional(),
  observacoes: z.string().optional(),
});
type HeaderFormValues = z.infer<typeof headerSchema>;

const optionalNumber = () =>
  z.preprocess((val) => (val === "" || val === undefined || val === null ? undefined : val), z.coerce.number().optional());

const itemSchema = z.object({
  itemId: z.coerce.number().min(1, "Item e obrigatorio"),
  descricaoPersonalizada: z.string().optional(),
  quantidade: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  valorUnitario: optionalNumber(),
  tipoDesconto: z.enum(["NENHUM", "PERCENTUAL", "VALOR_FIXO"]),
  valorDesconto: optionalNumber(),
});
type ItemFormValues = z.infer<typeof itemSchema>;

const TRANSICOES: Record<StatusOrcamento, { status: StatusOrcamento; label: string; variant: "primary" | "danger" }[]> = {
  RASCUNHO: [
    { status: "ENVIADO", label: "Enviar ao cliente", variant: "primary" },
    { status: "CANCELADO", label: "Cancelar", variant: "danger" },
  ],
  ENVIADO: [
    { status: "APROVADO", label: "Aprovar", variant: "primary" },
    { status: "REJEITADO", label: "Rejeitar", variant: "danger" },
    { status: "CANCELADO", label: "Cancelar", variant: "danger" },
  ],
  APROVADO: [
    { status: "FINALIZADO", label: "Finalizar", variant: "primary" },
    { status: "CANCELADO", label: "Cancelar", variant: "danger" },
  ],
  FINALIZADO: [],
  REJEITADO: [],
  CANCELADO: [],
};

export default function OrcamentoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orcamentoId = Number(params.id);

  const { data: orcamento, isLoading } = useOrcamento(orcamentoId);
  const { data: clientes } = useClientes();
  const { data: itensCadastrados } = useItens();

  const updateHeader = useUpdateOrcamentoHeader();
  const adicionarItem = useAdicionarItemOrcamento();
  const atualizarItem = useAtualizarItemOrcamento();
  const removerItem = useRemoverItemOrcamento();
  const atualizarStatus = useAtualizarStatusOrcamento();
  const confirm = useConfirm();

  const [headerModalOpen, setHeaderModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrcamentoItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const [formaPagamentoFinalizacao, setFormaPagamentoFinalizacao] = useState<FormaPagamento>("DINHEIRO");
  const [finalizarError, setFinalizarError] = useState<string | null>(null);

  const headerForm = useForm<HeaderFormValues>({ resolver: zodResolver(headerSchema) });
  const itemForm = useForm<ItemFormValues>({ resolver: zodResolver(itemSchema) });

  useEffect(() => {
    if (orcamento && headerModalOpen) {
      headerForm.reset({
        clienteId: orcamento.clienteId,
        dataOrcamento: orcamento.dataOrcamento,
        dataValidade: orcamento.dataValidade ?? "",
        observacoes: orcamento.observacoes ?? "",
      });
    }
  }, [orcamento, headerModalOpen, headerForm]);

  if (isLoading || !orcamento) return <PageSpinner />;

  const editavel = orcamento.status === "RASCUNHO";
  const acoesDisponiveis = TRANSICOES[orcamento.status];

  function abrirNovoItem() {
    setEditingItem(null);
    itemForm.reset({
      itemId: undefined,
      descricaoPersonalizada: "",
      quantidade: 1,
      valorUnitario: undefined,
      tipoDesconto: "NENHUM",
      valorDesconto: undefined,
    });
    setError(null);
    setItemModalOpen(true);
  }

  function abrirEdicaoItem(item: OrcamentoItem) {
    setEditingItem(item);
    itemForm.reset({
      itemId: item.itemId,
      descricaoPersonalizada: item.descricaoPersonalizada ?? "",
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      tipoDesconto: item.tipoDesconto,
      valorDesconto: item.valorDesconto,
    });
    setError(null);
    setItemModalOpen(true);
  }

  async function onSubmitHeader(values: HeaderFormValues) {
    setError(null);
    try {
      await updateHeader.mutateAsync({ id: orcamentoId, input: { ...values, itens: undefined } });
      setHeaderModalOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onSubmitItem(values: ItemFormValues) {
    setError(null);
    try {
      if (editingItem) {
        await atualizarItem.mutateAsync({ orcamentoId, itemId: editingItem.id, input: values });
      } else {
        await adicionarItem.mutateAsync({ orcamentoId, input: values });
      }
      setItemModalOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onRemoverItem(item: OrcamentoItem) {
    const ok = await confirm({
      message: `Remover "${item.itemNome}" do orcamento?`,
      variant: "danger",
      confirmLabel: "Remover",
    });
    if (!ok) return;
    try {
      await removerItem.mutateAsync({ orcamentoId, itemId: item.id });
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  async function onMudarStatus(novoStatus: StatusOrcamento) {
    if (novoStatus === "FINALIZADO") {
      setFormaPagamentoFinalizacao("DINHEIRO");
      setFinalizarError(null);
      setFinalizarModalOpen(true);
      return;
    }

    const variant = novoStatus === "REJEITADO" || novoStatus === "CANCELADO" ? "danger" : "primary";
    const ok = await confirm({
      message: `Confirmar mudanca de status para ${statusOrcamentoLabel[novoStatus]}?`,
      variant,
      confirmLabel: statusOrcamentoLabel[novoStatus],
    });
    if (!ok) return;
    try {
      await atualizarStatus.mutateAsync({ id: orcamentoId, status: novoStatus });
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  async function onConfirmarFinalizacao() {
    setFinalizarError(null);
    try {
      await atualizarStatus.mutateAsync({
        id: orcamentoId,
        status: "FINALIZADO",
        formaPagamento: formaPagamentoFinalizacao,
      });
      setFinalizarModalOpen(false);
    } catch (err) {
      setFinalizarError(extractErrorMessage(err));
    }
  }

  function onImprimir() {
    window.print();
  }

  function linhasExportacao() {
    if (!orcamento) return [];
    return orcamento.itens.map((item) => ({
      Item: item.itemNome,
      "Descricao personalizada": item.descricaoPersonalizada ?? "",
      Quantidade: item.quantidade,
      "Valor unitario": item.valorUnitario,
      "Tipo de desconto": tipoDescontoLabel[item.tipoDesconto],
      "Valor do desconto": item.valorDesconto,
      "Valor total": item.valorTotal,
    }));
  }

  function onExportarCsv() {
    if (!orcamento) return;
    const cabecalho = [
      ["Orcamento", `#${orcamento.id}`],
      ["Cliente", orcamento.clienteNome],
      ["Data", orcamento.dataOrcamento],
      ["Status", statusOrcamentoLabel[orcamento.status]],
      ["Valor total", orcamento.valorTotal.toString()],
      [],
    ];
    const linhas = linhasExportacao();
    const colunas = Object.keys(linhas[0] ?? { Item: "" });
    const corpo = [colunas, ...linhas.map((linha) => colunas.map((coluna) => (linha as Record<string, unknown>)[coluna]))];
    const todasLinhas = [...cabecalho, ...corpo];

    const csv = todasLinhas
      .map((linha) => linha.map((campo) => `"${String(campo ?? "").replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orcamento-${orcamento.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onExportarXlsx() {
    if (!orcamento) return;
    const linhas = linhasExportacao();
    const planilha = XLSX.utils.aoa_to_sheet([
      [`Orcamento #${orcamento.id}`],
      [`Cliente: ${orcamento.clienteNome}`],
      [`Data: ${orcamento.dataOrcamento}`],
      [`Status: ${statusOrcamentoLabel[orcamento.status]}`],
      [`Valor total: ${orcamento.valorTotal}`],
      [],
    ]);
    XLSX.utils.sheet_add_json(planilha, linhas, { origin: "A7" });
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, "Orcamento");
    XLSX.writeFile(livro, `orcamento-${orcamento.id}.xlsx`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        leading={
          <Button variant="ghost" size="sm" onClick={() => router.push("/orcamentos")}>
            <ArrowLeft size={16} />
          </Button>
        }
        title={`Orcamento #${orcamento.id}`}
        description={`Criado por ${orcamento.usuarioNome}`}
        trailing={<Badge className={statusOrcamentoColor[orcamento.status]}>{statusOrcamentoLabel[orcamento.status]}</Badge>}
        action={
          <div className="flex gap-2">
            <DropdownMenu
              trigger={
                <Button variant="secondary">
                  <Download size={16} /> Exportar
                </Button>
              }
              items={[
                { label: "Imprimir / PDF", icon: Printer, onClick: onImprimir },
                { label: "Exportar CSV", icon: FileText, onClick: onExportarCsv },
                { label: "Exportar XLSX", icon: FileSpreadsheet, onClick: onExportarXlsx },
              ]}
            />
            {acoesDisponiveis.map((acao) => (
              <Button key={acao.status} variant={acao.variant} onClick={() => onMudarStatus(acao.status)}>
                {acao.label}
              </Button>
            ))}
          </div>
        }
      />

      <PrintableOrcamento orcamento={orcamento} />

      <Card>
        <CardHeader>
          <CardTitle>Dados do orcamento</CardTitle>
          {editavel && (
            <Button variant="ghost" size="sm" onClick={() => setHeaderModalOpen(true)}>
              <Pencil size={14} /> Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Cliente</p>
            <p className="text-sm text-slate-900">{orcamento.clienteNome}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Data</p>
            <p className="text-sm text-slate-900">{formatDate(orcamento.dataOrcamento)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Valido ate</p>
            <p className="text-sm text-slate-900">{formatDate(orcamento.dataValidade)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Valor total</p>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(orcamento.valorTotal)}</p>
          </div>
          {orcamento.observacoes && (
            <div className="sm:col-span-4">
              <p className="text-xs font-medium uppercase text-slate-500">Observacoes</p>
              <p className="text-sm text-slate-700">{orcamento.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
          {editavel && (
            <Button size="sm" onClick={abrirNovoItem}>
              <Plus size={14} /> Adicionar item
            </Button>
          )}
        </CardHeader>
        {orcamento.itens.length === 0 ? (
          <EmptyState icon={Package} title="Nenhum item adicionado ainda" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Item</Th>
                <Th>Qtd</Th>
                <Th>Valor unit.</Th>
                <Th>Desconto</Th>
                <Th className="text-right">Total</Th>
                {editavel && <Th className="text-right">Acoes</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {orcamento.itens.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    <p className="font-medium text-slate-900">{item.itemNome}</p>
                    {item.descricaoPersonalizada && (
                      <p className="text-xs text-slate-500">{item.descricaoPersonalizada}</p>
                    )}
                  </Td>
                  <Td>{item.quantidade}</Td>
                  <Td>{formatCurrency(item.valorUnitario)}</Td>
                  <Td>
                    {item.tipoDesconto === "NENHUM"
                      ? "-"
                      : item.tipoDesconto === "PERCENTUAL"
                      ? `${item.valorDesconto}%`
                      : formatCurrency(item.valorDesconto)}
                  </Td>
                  <Td className="text-right font-medium">{formatCurrency(item.valorTotal)}</Td>
                  {editavel && (
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => abrirEdicaoItem(item)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onRemoverItem(item)}>
                          <Trash2 size={14} className="text-red-600" />
                        </Button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal open={headerModalOpen} onClose={() => setHeaderModalOpen(false)} title="Editar orcamento">
        <form onSubmit={headerForm.handleSubmit(onSubmitHeader)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <Label htmlFor="clienteId">Cliente *</Label>
            <Select id="clienteId" {...headerForm.register("clienteId")}>
              {(clientes ?? []).map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataOrcamento">Data *</Label>
              <Input id="dataOrcamento" type="date" {...headerForm.register("dataOrcamento")} />
            </div>
            <div>
              <Label htmlFor="dataValidade">Valido ate</Label>
              <Input id="dataValidade" type="date" {...headerForm.register("dataValidade")} />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observacoes</Label>
            <Textarea id="observacoes" rows={3} {...headerForm.register("observacoes")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setHeaderModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={headerForm.formState.isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={itemModalOpen} onClose={() => setItemModalOpen(false)} title={editingItem ? "Editar item" : "Adicionar item"}>
        <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <Label htmlFor="itemId">Produto/Servico *</Label>
            <Controller
              control={itemForm.control}
              name="itemId"
              render={({ field }) => (
                <Combobox
                  id="itemId"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Buscar produto ou servico..."
                  hasError={!!itemForm.formState.errors.itemId}
                  options={(itensCadastrados ?? []).map((item) => ({
                    value: item.id,
                    label: item.nome,
                    description: `${tipoItemLabel[item.tipo]} - ${formatCurrency(item.precoUnitario)}`,
                  }))}
                />
              )}
            />
            {itemForm.formState.errors.itemId && (
              <p className="mt-1 text-xs text-red-600">{itemForm.formState.errors.itemId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="descricaoPersonalizada">Descricao personalizada (opcional)</Label>
            <Input id="descricaoPersonalizada" {...itemForm.register("descricaoPersonalizada")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input id="quantidade" type="number" step="0.001" min="0" {...itemForm.register("quantidade")} />
              {itemForm.formState.errors.quantidade && (
                <p className="mt-1 text-xs text-red-600">{itemForm.formState.errors.quantidade.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="valorUnitario">Valor unitario (deixe vazio para usar o preco cadastrado)</Label>
              <Input id="valorUnitario" type="number" step="0.01" min="0" {...itemForm.register("valorUnitario")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoDesconto">Desconto</Label>
              <Select id="tipoDesconto" {...itemForm.register("tipoDesconto")}>
                {Object.entries(tipoDescontoLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="valorDesconto">Valor do desconto</Label>
              <Input id="valorDesconto" type="number" step="0.01" min="0" {...itemForm.register("valorDesconto")} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setItemModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={itemForm.formState.isSubmitting}>
              Salvar item
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={finalizarModalOpen} onClose={() => setFinalizarModalOpen(false)} title="Finalizar orcamento" widthClassName="max-w-md">
        <div className="space-y-4">
          {finalizarError && <Alert variant="error">{finalizarError}</Alert>}
          <p className="text-sm text-slate-700">
            Finalizar este orcamento ira gerar automaticamente um lancamento de entrada no valor de{" "}
            <span className="font-semibold">{formatCurrency(orcamento.valorTotal)}</span>.
          </p>
          <div>
            <Label htmlFor="formaPagamentoFinalizacao">Forma de pagamento recebida *</Label>
            <Select
              id="formaPagamentoFinalizacao"
              value={formaPagamentoFinalizacao}
              onChange={(e) => setFormaPagamentoFinalizacao(e.target.value as FormaPagamento)}
            >
              {Object.entries(formaPagamentoLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFinalizarModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={onConfirmarFinalizacao} disabled={atualizarStatus.isPending}>
              Finalizar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
