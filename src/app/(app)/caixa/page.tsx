"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, LockOpen, Vault } from "lucide-react";
import { useResumoDoDia, useFecharCaixa, useHistoricoCaixa, useReabrirCaixa } from "@/hooks/use-caixa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirm } from "@/components/confirm-provider";
import { extractErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate, formatDateTime, todayIso } from "@/lib/format";
import { statusFechamentoLabel } from "@/lib/labels";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  saldoFinalInformado: z.coerce.number(),
  observacoes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CaixaPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(todayIso());
  const { data: resumo, isLoading } = useResumoDoDia(data);
  const { data: historico } = useHistoricoCaixa();
  const fecharCaixa = useFecharCaixa();
  const reabrirCaixa = useReabrirCaixa();
  const confirm = useConfirm();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await fecharCaixa.mutateAsync({ data, ...values });
      reset();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onReabrir(id: number) {
    const ok = await confirm({
      message: "Reabrir este fechamento? Os lancamentos do dia serao destravados.",
      variant: "danger",
      confirmLabel: "Reabrir",
    });
    if (!ok) return;
    try {
      await reabrirCaixa.mutateAsync(id);
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Fechamento de Caixa" description="Conferencia diaria do caixa" />

      <Card>
        <CardContent className="flex items-end gap-4">
          <div>
            <Label htmlFor="data">Data</Label>
            <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading || !resumo ? (
        <PageSpinner />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do dia {formatDate(data)}</CardTitle>
            <Badge
              className={resumo.status === "FECHADO" ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-700"}
            >
              <span className="flex items-center gap-1">
                {resumo.status === "FECHADO" ? <Lock size={12} /> : <LockOpen size={12} />}
                {statusFechamentoLabel[resumo.status]}
              </span>
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Saldo inicial</p>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(resumo.saldoInicial)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Entradas</p>
                <p className="text-sm font-semibold text-emerald-700">{formatCurrency(resumo.totalEntradas)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Saidas</p>
                <p className="text-sm font-semibold text-red-700">{formatCurrency(resumo.totalSaidas)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Saldo final calculado</p>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(resumo.saldoFinalCalculado)}</p>
              </div>
            </div>

            {resumo.status === "FECHADO" ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Saldo informado (contado)</p>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(resumo.saldoFinalInformado)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Diferenca</p>
                    <p
                      className={`text-sm font-semibold ${
                        Number(resumo.diferenca) === 0
                          ? "text-slate-900"
                          : Number(resumo.diferenca) > 0
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {formatCurrency(resumo.diferenca)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Fechado por</p>
                    <p className="text-sm text-slate-900">{resumo.usuarioNome}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(resumo.dataHoraFechamento)}</p>
                  </div>
                </div>
                {resumo.observacoes && <p className="mt-3 text-sm text-slate-700">{resumo.observacoes}</p>}
                {isAdmin && resumo.id && (
                  <Button variant="secondary" size="sm" className="mt-4" onClick={() => onReabrir(resumo.id!)}>
                    <LockOpen size={14} /> Reabrir
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t border-slate-100 pt-4">
                {error && <Alert variant="error">{error}</Alert>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="saldoFinalInformado">Saldo contado em caixa (R$) *</Label>
                    <Input id="saldoFinalInformado" type="number" step="0.01" {...register("saldoFinalInformado")} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observacoes</Label>
                  <Textarea id="observacoes" rows={2} {...register("observacoes")} />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  Fechar caixa do dia
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historico de fechamentos</CardTitle>
        </CardHeader>
        {(historico ?? []).length === 0 ? (
          <EmptyState icon={Vault} title="Nenhum fechamento registrado ainda" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Data</Th>
                <Th className="text-right">Saldo inicial</Th>
                <Th className="text-right">Entradas</Th>
                <Th className="text-right">Saidas</Th>
                <Th className="text-right">Saldo final</Th>
                <Th className="text-right">Diferenca</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(historico ?? []).map((f) => (
                <Tr key={f.id}>
                  <Td>{formatDate(f.dataFechamento)}</Td>
                  <Td className="text-right">{formatCurrency(f.saldoInicial)}</Td>
                  <Td className="text-right">{formatCurrency(f.totalEntradas)}</Td>
                  <Td className="text-right">{formatCurrency(f.totalSaidas)}</Td>
                  <Td className="text-right">{formatCurrency(f.saldoFinalCalculado)}</Td>
                  <Td className="text-right">{formatCurrency(f.diferenca)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
