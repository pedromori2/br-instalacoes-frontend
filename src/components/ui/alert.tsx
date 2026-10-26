import { HTMLAttributes } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import clsx from "clsx";

type Variant = "error" | "success" | "info";

const variantClasses: Record<Variant, string> = {
  error: "bg-red-50 text-red-700 border-red-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

const variantIcon: Record<Variant, typeof Info> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function Alert({
  variant = "info",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  const Icon = variantIcon[variant];
  return (
    <div
      className={clsx("flex items-start gap-2 rounded-lg border px-4 py-3 text-sm", variantClasses[variant], className)}
      {...props}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
