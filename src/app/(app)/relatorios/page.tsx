"use client";

import { useState } from "react";
import { Download, ArrowUpCircle, ArrowDownCircle, Scale, BarChart3 } from "lucide-react";
import { useRelatorio } from "@/hooks/use-relatorio";
import { useCategorias } from "@/hooks/use-categorias";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { tipoLancamentoLabel } from "@/lib/labels";

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipo, setTipo] = useState<"" | "ENTRADA" | "SAIDA">("");
  const [categoriaId, setCategoriaId] = useState<number | "">("");

  const { data: categorias } = useCategorias();
  const { data: relatorio, isLoading } = useRelatorio({ dataInicio, dataFim, tipo, categoriaId });

  function exportarCsv() {
    if (!relatorio) return;
    const linhas = [
      ["Data", "Tipo", "Categoria", "Descricao", "Forma de pagamento", "Valor"],
      ...relatorio.lancamentos.map((l) => [
        l.dataLancamento,
        tipoLancamentoLabel[l.tipo],
        l.categoriaNome,
        l.descricao,
        l.formaPagamento,
        l.valor.toString(),
      ]),
    ];
    const csv = linhas.map((linha) => linha.map((campo) => `"${String(campo).replaceAll('"', '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-financeiro-${dataInicio || "inicio"}-a-${dataFim || "fim"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatorios"
        description="Filtre por periodo, tipo ou categoria"
        action={
          <Button variant="secondary" onClick={exportarCsv} disabled={!relatorio || relatorio.lancamentos.length === 0}>
            <Download size={16} /> Exportar CSV
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label>Data inicio</Label>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div>
            <Label>Data fim</Label>
            <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={tipo} onChange={(e) => setTipo(e.target.value as "" | "ENTRADA" | "SAIDA")}>
              <option value="">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saida</option>
            </Select>
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Todas</option>
              {(categorias ?? []).map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading || !relatorio ? (
        <PageSpinner />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total de entradas" value={formatCurrency(relatorio.totalEntradas)} icon={ArrowUpCircle} tone="success" />
            <StatCard label="Total de saidas" value={formatCurrency(relatorio.totalSaidas)} icon={ArrowDownCircle} tone="danger" />
            <StatCard label="Saldo" value={formatCurrency(relatorio.saldo)} icon={Scale} tone="primary" />
          </div>

          {relatorio.porCategoria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Totais por categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {relatorio.porCategoria.map((c) => (
                  <div key={c.categoriaId} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Badge className={c.tipo === "ENTRADA" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                        {tipoLancamentoLabel[c.tipo]}
                      </Badge>
                      <span className="text-slate-700">{c.categoriaNome}</span>
                    </div>
                    <span className="font-medium text-slate-900">{formatCurrency(c.total)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            {relatorio.lancamentos.length === 0 ? (
              <EmptyState icon={BarChart3} title="Nenhum lancamento encontrado" description="Ajuste os filtros para ver resultados." />
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Data</Th>
                    <Th>Tipo</Th>
                    <Th>Categoria</Th>
                    <Th>Descricao</Th>
                    <Th className="text-right">Valor</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {relatorio.lancamentos.map((l) => (
                    <Tr key={l.id}>
                      <Td>{formatDate(l.dataLancamento)}</Td>
                      <Td>{tipoLancamentoLabel[l.tipo]}</Td>
                      <Td>{l.categoriaNome}</Td>
                      <Td>{l.descricao}</Td>
                      <Td className={`text-right font-medium ${l.tipo === "ENTRADA" ? "text-emerald-700" : "text-red-700"}`}>
                        {formatCurrency(l.valor)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
