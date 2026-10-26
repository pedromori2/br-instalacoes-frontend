"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { useOrcamentos, useCreateOrcamento } from "@/hooks/use-orcamentos";
import { useClientes } from "@/hooks/use-clientes";
import { StatusOrcamento } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { extractErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate, todayIso } from "@/lib/format";
import { statusOrcamentoColor, statusOrcamentoLabel } from "@/lib/labels";

const schema = z.object({
  clienteId: z.coerce.number().min(1, "Cliente e obrigatorio"),
  dataOrcamento: z.string().min(1, "Data e obrigatoria"),
  dataValidade: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OrcamentosPage() {
  const router = useRouter();
  const [filtroStatus, setFiltroStatus] = useState<StatusOrcamento | "">("");
  const { data: orcamentos, isLoading } = useOrcamentos(filtroStatus || undefined);
  const { data: clientes } = useClientes();
  const createOrcamento = useCreateOrcamento();

  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function abrirNovo() {
    reset({ clienteId: undefined, dataOrcamento: todayIso(), dataValidade: "", observacoes: "" });
    setError(null);
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const orcamento = await createOrcamento.mutateAsync({ ...values, itens: [] });
      setModalOpen(false);
      router.push(`/orcamentos/${orcamento.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orcamentos"
        description="Monte orcamentos para seus clientes com produtos e servicos"
        action={
          <Button onClick={abrirNovo}>
            <Plus size={16} /> Novo orcamento
          </Button>
        }
      />

      <Card>
        <CardContent className="flex items-center gap-3">
          <Label className="mb-0 shrink-0">Status</Label>
          <Select
            className="w-56"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusOrcamento | "")}
          >
            <option value="">Todos</option>
            {Object.entries(statusOrcamentoLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card>
        {(orcamentos ?? []).length === 0 ? (
          <EmptyState icon={FileText} title="Nenhum orcamento encontrado" description="Clique em 'Novo orcamento' para comecar." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Numero</Th>
                <Th>Cliente</Th>
                <Th>Data</Th>
                <Th>Status</Th>
                <Th className="text-right">Valor total</Th>
                <Th className="w-10" />
              </Tr>
            </Thead>
            <Tbody>
              {(orcamentos ?? []).map((orcamento) => (
                <Tr key={orcamento.id} className="cursor-pointer" onClick={() => router.push(`/orcamentos/${orcamento.id}`)}>
                  <Td className="font-medium text-slate-900">#{orcamento.id}</Td>
                  <Td>{orcamento.clienteNome}</Td>
                  <Td>{formatDate(orcamento.dataOrcamento)}</Td>
                  <Td>
                    <Badge className={statusOrcamentoColor[orcamento.status]}>{statusOrcamentoLabel[orcamento.status]}</Badge>
                  </Td>
                  <Td className="text-right font-medium">{formatCurrency(orcamento.valorTotal)}</Td>
                  <Td className="text-slate-300">
                    <ChevronRight size={16} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo orcamento">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <Label htmlFor="clienteId">Cliente *</Label>
            <Select id="clienteId" {...register("clienteId")}>
              <option value="">Selecione...</option>
              {(clientes ?? []).map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </Select>
            {errors.clienteId && <p className="mt-1 text-xs text-red-600">{errors.clienteId.message}</p>}
            {(clientes ?? []).length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                <Link href="/clientes" className="text-primary-600 hover:underline">
                  Cadastre um cliente
                </Link>{" "}
                antes de criar um orcamento.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataOrcamento">Data *</Label>
              <Input id="dataOrcamento" type="date" {...register("dataOrcamento")} />
            </div>
            <div>
              <Label htmlFor="dataValidade">Valido ate</Label>
              <Input id="dataValidade" type="date" {...register("dataValidade")} />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observacoes</Label>
            <Textarea id="observacoes" rows={3} {...register("observacoes")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Criar e adicionar itens
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
