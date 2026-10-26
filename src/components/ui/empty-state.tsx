import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={20} />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-xs text-xs text-slate-500">{description}</p>}
    </div>
  );
}
