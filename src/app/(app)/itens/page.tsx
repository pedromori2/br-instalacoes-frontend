"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useItens, useCreateItem, useUpdateItem, useDeleteItem, ItemInput } from "@/hooks/use-itens";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import { formatCurrency } from "@/lib/format";
import { tipoItemLabel } from "@/lib/labels";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  nome: z.string().min(1, "Nome e obrigatorio"),
  descricao: z.string().optional(),
  tipo: z.enum(["PRODUTO", "SERVICO"]),
  precoUnitario: z.coerce.number().min(0, "Preco nao pode ser negativo"),
  unidade: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ItensPage() {
  const { isAdmin } = useAuth();
  const { data: itens, isLoading } = useItens();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const confirm = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { tipo: "PRODUTO", unidade: "un" } });

  function abrirNovo() {
    setEditing(null);
    reset({ nome: "", descricao: "", tipo: "PRODUTO", precoUnitario: 0, unidade: "un" });
    setError(null);
    setModalOpen(true);
  }

  function abrirEdicao(item: Item) {
    setEditing(item);
    reset({
      nome: item.nome,
      descricao: item.descricao ?? "",
      tipo: item.tipo,
      precoUnitario: item.precoUnitario,
      unidade: item.unidade,
    });
    setError(null);
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    const input: ItemInput = { ...values, ativo: editing?.ativo ?? true };
    try {
      if (editing) {
        await updateItem.mutateAsync({ id: editing.id, input });
      } else {
        await createItem.mutateAsync(input);
      }
      setModalOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onDelete(item: Item) {
    const ok = await confirm({ message: `Excluir "${item.nome}"?`, variant: "danger", confirmLabel: "Excluir" });
    if (!ok) return;
    try {
      await deleteItem.mutateAsync(item.id);
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos e Servicos"
        description="Itens disponiveis para compor orcamentos"
        action={
          <Button onClick={abrirNovo}>
            <Plus size={16} /> Novo item
          </Button>
        }
      />

      <Card>
        {(itens ?? []).length === 0 ? (
          <EmptyState icon={Package} title="Nenhum produto ou servico cadastrado ainda" description="Clique em 'Novo item' para comecar." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Tipo</Th>
                <Th>Preco unitario</Th>
                <Th>Unidade</Th>
                <Th>Status</Th>
                <Th className="text-right">Acoes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(itens ?? []).map((item) => (
                <Tr key={item.id}>
                  <Td className="font-medium text-slate-900">{item.nome}</Td>
                  <Td>
                    <Badge className={item.tipo === "PRODUTO" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}>
                      {tipoItemLabel[item.tipo]}
                    </Badge>
                  </Td>
                  <Td>{formatCurrency(item.precoUnitario)}</Td>
                  <Td>{item.unidade}</Td>
                  <Td>
                    <Badge className={item.ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                      {item.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(item)}>
                        <Pencil size={14} />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar item" : "Novo item"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select id="tipo" {...register("tipo")}>
                <option value="PRODUTO">Produto</option>
                <option value="SERVICO">Servico</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="unidade">Unidade</Label>
              <Input id="unidade" placeholder="un, hora, kg..." {...register("unidade")} />
            </div>
          </div>

          <div>
            <Label htmlFor="precoUnitario">Preco unitario (R$) *</Label>
            <Input id="precoUnitario" type="number" step="0.01" min="0" {...register("precoUnitario")} />
            {errors.precoUnitario && <p className="mt-1 text-xs text-red-600">{errors.precoUnitario.message}</p>}
          </div>

          <div>
            <Label htmlFor="descricao">Descricao</Label>
            <Textarea id="descricao" rows={3} {...register("descricao")} />
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
