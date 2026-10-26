import { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Card, CardContent } from "@/components/ui/card";

type Tone = "primary" | "success" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-emerald-50 text-emerald-600",
  danger: "bg-red-50 text-red-600",
  neutral: "bg-slate-100 text-slate-600",
};

const valueToneClasses: Record<Tone, string> = {
  primary: "text-slate-900",
  success: "text-emerald-700",
  danger: "text-red-700",
  neutral: "text-slate-900",
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
}

export function StatCard({ label, value, icon: Icon, tone = "neutral" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className={clsx("truncate text-xl font-semibold", valueToneClasses[tone])}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
