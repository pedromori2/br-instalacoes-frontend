"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import {
  useClientes,
  useCreateCliente,
  useUpdateCliente,
  useDeleteCliente,
  ClienteInput,
} from "@/hooks/use-clientes";
import { Cliente } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirm } from "@/components/confirm-provider";
import { extractErrorMessage } from "@/lib/api";
import { maskCpfCnpj } from "@/lib/format";
import { isValidCpfCnpj } from "@/lib/validators";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  nome: z.string().min(1, "Nome e obrigatorio"),
  documento: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === "" || isValidCpfCnpj(val), { message: "CPF/CNPJ invalido" }),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ClientesPage() {
  const { isAdmin } = useAuth();
  const { data: clientes, isLoading } = useClientes();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const deleteCliente = useDeleteCliente();
  const confirm = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const documentoField = register("documento");

  function abrirNovo() {
    setEditing(null);
    reset({ nome: "", documento: "", email: "", telefone: "", endereco: "", observacoes: "" });
    setError(null);
    setModalOpen(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setEditing(cliente);
    reset({
      nome: cliente.nome,
      documento: cliente.documento ?? "",
      email: cliente.email ?? "",
      telefone: cliente.telefone ?? "",
      endereco: cliente.endereco ?? "",
      observacoes: cliente.observacoes ?? "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    const input: ClienteInput = { ...values, ativo: editing?.ativo ?? true };
    try {
      if (editing) {
        await updateCliente.mutateAsync({ id: editing.id, input });
      } else {
        await createCliente.mutateAsync(input);
      }
      setModalOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onDelete(cliente: Cliente) {
    const ok = await confirm({
      message: `Excluir o cliente "${cliente.nome}"?`,
      variant: "danger",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    try {
      await deleteCliente.mutateAsync(cliente.id);
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastro de clientes para montagem de orcamentos"
        action={
          <Button onClick={abrirNovo}>
            <Plus size={16} /> Novo cliente
          </Button>
        }
      />

      <Card>
        {(clientes ?? []).length === 0 ? (
          <EmptyState icon={Users} title="Nenhum cliente cadastrado ainda" description="Clique em 'Novo cliente' para comecar." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Documento</Th>
                <Th>Contato</Th>
                <Th>Status</Th>
                <Th className="text-right">Acoes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(clientes ?? []).map((cliente) => (
                <Tr key={cliente.id}>
                  <Td className="font-medium text-slate-900">{cliente.nome}</Td>
                  <Td>{cliente.documento || "-"}</Td>
                  <Td>
                    {cliente.email && <div>{cliente.email}</div>}
                    {cliente.telefone && <div className="text-xs text-slate-500">{cliente.telefone}</div>}
                    {!cliente.email && !cliente.telefone && "-"}
                  </Td>
                  <Td>
                    <Badge className={cliente.ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                      {cliente.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(cliente)}>
                        <Pencil size={14} />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => onDelete(cliente)}>
                          <Trash2 size={14} className="text-red-600" />
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar cliente" : "Novo cliente"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documento">CPF/CNPJ</Label>
              <Input
                id="documento"
                inputMode="numeric"
                maxLength={18}
                placeholder="000.000.000-00"
                name={documentoField.name}
                ref={documentoField.ref}
                onBlur={documentoField.onBlur}
                onChange={(e) => {
                  e.target.value = maskCpfCnpj(e.target.value);
                  documentoField.onChange(e);
                }}
              />
              {errors.documento && <p className="mt-1 text-xs text-red-600">{errors.documento.message}</p>}
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register("telefone")} />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="endereco">Endereco</Label>
            <Input id="endereco" {...register("endereco")} />
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
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
