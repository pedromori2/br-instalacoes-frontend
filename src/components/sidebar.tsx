"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Users,
  Package,
  FileText,
  Vault,
  UserCog,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { roleLabel } from "@/lib/labels";
import { BrandIcon } from "@/components/brand-mark";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lancamentos", label: "Lancamentos", icon: ArrowLeftRight },
  { href: "/relatorios", label: "Relatorios", icon: BarChart3 },
  { href: "/orcamentos", label: "Orcamentos", icon: FileText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/itens", label: "Produtos e Servicos", icon: Package },
  { href: "/caixa", label: "Fechamento de Caixa", icon: Vault },
];

const adminOnlyItems = [{ href: "/usuarios", label: "Usuarios", icon: UserCog }];

function initials(nome?: string): string {
  if (!nome) return "?";
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const items = isAdmin ? [...navItems, ...adminOnlyItems] : navItems;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-5">
        <BrandIcon className="h-9 w-9 shadow-sm" symbolClassName="h-5 w-5" />
        <span className="text-sm font-extrabold uppercase leading-tight tracking-tight text-slate-900">
          <span className="text-primary-600">BR</span>
          <br />
          Instalações
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary-600" />}
              <Icon size={18} className={active ? "text-primary-600" : "text-slate-400"} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            {initials(user?.nome)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{user?.nome}</p>
            <p className="truncate text-xs text-slate-500">{user ? roleLabel[user.role] : ""}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
