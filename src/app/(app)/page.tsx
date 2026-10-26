"use client";

import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Scale, FileText, ChevronRight } from "lucide-react";
import { useRelatorio } from "@/hooks/use-relatorio";
import { useOrcamentos } from "@/hooks/use-orcamentos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { statusOrcamentoColor, statusOrcamentoLabel } from "@/lib/labels";

function inicioDoMes(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function hojeIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const dataInicio = inicioDoMes();
  const dataFim = hojeIso();
  const { data: relatorio, isLoading } = useRelatorio({ dataInicio, dataFim });
  const { data: orcamentos } = useOrcamentos();

  const orcamentosRecentes = (orcamentos ?? []).slice(0, 5);

  if (isLoading || !relatorio) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Resumo do mes atual (${formatDate(dataInicio)} a ${formatDate(dataFim)})`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Entradas" value={formatCurrency(relatorio.totalEntradas)} icon={ArrowUpCircle} tone="success" />
        <StatCard label="Saidas" value={formatCurrency(relatorio.totalSaidas)} icon={ArrowDownCircle} tone="danger" />
        <StatCard label="Saldo" value={formatCurrency(relatorio.saldo)} icon={Scale} tone="primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <FileText size={16} className="text-slate-400" /> Orcamentos recentes
          </CardTitle>
          <Link
            href="/orcamentos"
            className="flex items-center gap-0.5 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Ver todos
            <ChevronRight size={14} />
          </Link>
        </CardHeader>
        <CardContent className={orcamentosRecentes.length === 0 ? "" : "space-y-2"}>
          {orcamentosRecentes.length === 0 && (
            <EmptyState icon={FileText} title="Nenhum orcamento cadastrado ainda" />
          )}
          {orcamentosRecentes.map((orcamento) => (
            <Link
              key={orcamento.id}
              href={`/orcamentos/${orcamento.id}`}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  #{orcamento.id} - {orcamento.clienteNome}
                </p>
                <p className="text-xs text-slate-500">{formatDate(orcamento.dataOrcamento)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(orcamento.valorTotal)}</span>
                <Badge className={statusOrcamentoColor[orcamento.status]}>{statusOrcamentoLabel[orcamento.status]}</Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
