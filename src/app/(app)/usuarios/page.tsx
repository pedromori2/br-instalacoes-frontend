"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, UserCog } from "lucide-react";
import { useUsuarios, useCreateUsuario, useUpdateUsuario } from "@/hooks/use-usuarios";
import { Usuario } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { extractErrorMessage } from "@/lib/api";
import { roleLabel } from "@/lib/labels";
import { useAuth } from "@/lib/auth-context";

const createSchema = z.object({
  nome: z.string().min(1, "Nome e obrigatorio"),
  email: z.string().email("Email invalido"),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  role: z.enum(["ADMIN", "OPERADOR"]),
});
type CreateFormValues = z.infer<typeof createSchema>;

const updateSchema = z.object({
  nome: z.string().min(1, "Nome e obrigatorio"),
  role: z.enum(["ADMIN", "OPERADOR"]),
  ativo: z.boolean(),
  novaSenha: z.string().optional(),
});
type UpdateFormValues = z.infer<typeof updateSchema>;

export default function UsuariosPage() {
  const { isAdmin } = useAuth();
  const { data: usuarios, isLoading } = useUsuarios();
  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: "OPERADOR" },
  });
  const updateForm = useForm<UpdateFormValues>({ resolver: zodResolver(updateSchema) });

  if (!isAdmin) {
    return <Alert variant="error">Apenas administradores podem acessar esta pagina.</Alert>;
  }

  function abrirNovo() {
    createForm.reset({ nome: "", email: "", senha: "", role: "OPERADOR" });
    setError(null);
    setCreateModalOpen(true);
  }

  function abrirEdicao(usuario: Usuario) {
    setEditing(usuario);
    updateForm.reset({ nome: usuario.nome, role: usuario.role, ativo: usuario.ativo, novaSenha: "" });
    setError(null);
  }

  async function onSubmitCreate(values: CreateFormValues) {
    setError(null);
    try {
      await createUsuario.mutateAsync(values);
      setCreateModalOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onSubmitUpdate(values: UpdateFormValues) {
    if (!editing) return;
    setError(null);
    try {
      await updateUsuario.mutateAsync({
        id: editing.id,
        input: { ...values, novaSenha: values.novaSenha || undefined },
      });
      setEditing(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gerencie quem pode acessar o sistema"
        action={
          <Button onClick={abrirNovo}>
            <Plus size={16} /> Novo usuario
          </Button>
        }
      />

      <Card>
        {(usuarios ?? []).length === 0 ? (
          <EmptyState icon={UserCog} title="Nenhum usuario cadastrado ainda" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Papel</Th>
                <Th>Status</Th>
                <Th className="text-right">Acoes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(usuarios ?? []).map((usuario) => (
                <Tr key={usuario.id}>
                  <Td className="font-medium text-slate-900">{usuario.nome}</Td>
                  <Td>{usuario.email}</Td>
                  <Td>
                    <Badge className={usuario.role === "ADMIN" ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-600"}>
                      {roleLabel[usuario.role]}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge className={usuario.ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => abrirEdicao(usuario)}>
                      <Pencil size={14} />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Novo usuario">
        <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...createForm.register("nome")} />
            {createForm.formState.errors.nome && (
              <p className="mt-1 text-xs text-red-600">{createForm.formState.errors.nome.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...createForm.register("email")} />
            {createForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">{createForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="senha">Senha *</Label>
            <Input id="senha" type="password" {...createForm.register("senha")} />
            {createForm.formState.errors.senha && (
              <p className="mt-1 text-xs text-red-600">{createForm.formState.errors.senha.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="role">Papel *</Label>
            <Select id="role" {...createForm.register("role")}>
              <option value="OPERADOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createForm.formState.isSubmitting}>
              Criar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Editar usuario - ${editing?.nome ?? ""}`}>
        <form onSubmit={updateForm.handleSubmit(onSubmitUpdate)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          <div>
            <Label htmlFor="nomeEdit">Nome *</Label>
            <Input id="nomeEdit" {...updateForm.register("nome")} />
          </div>
          <div>
            <Label htmlFor="roleEdit">Papel *</Label>
            <Select id="roleEdit" {...updateForm.register("role")}>
              <option value="OPERADOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="ativoEdit"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/30"
              {...updateForm.register("ativo")}
            />
            <Label htmlFor="ativoEdit" className="mb-0">
              Usuario ativo
            </Label>
          </div>
          <div>
            <Label htmlFor="novaSenha">Nova senha (deixe vazio para manter)</Label>
            <Input id="novaSenha" type="password" {...updateForm.register("novaSenha")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateForm.formState.isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
