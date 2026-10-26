import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function PageHeader({ title, description, action, leading, trailing }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {leading}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            {trailing}
          </div>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
