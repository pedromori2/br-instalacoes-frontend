import { Loader2 } from "lucide-react";
import clsx from "clsx";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx("animate-spin text-primary-600", className)} size={20} />;
}

export function PageSpinner() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
