import clsx from "clsx";

/**
 * Simbolo da marca: um telhado (instalacoes/construcao) com uma janela em grade,
 * inspirado no guia de identidade visual da BR Instalacoes.
 */
export function BrandSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 19.5 16 8l11 11.5"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.5 21V15.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" opacity="0.55" />
      <path d="M22.5 21V15.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" opacity="0.55" />
      <rect x="13.4" y="13.4" width="2.3" height="2.3" rx="0.4" fill="currentColor" />
      <rect x="16.3" y="13.4" width="2.3" height="2.3" rx="0.4" fill="currentColor" />
      <rect x="13.4" y="16.3" width="2.3" height="2.3" rx="0.4" fill="currentColor" />
      <rect x="16.3" y="16.3" width="2.3" height="2.3" rx="0.4" fill="currentColor" />
    </svg>
  );
}

interface BrandIconProps {
  className?: string;
  symbolClassName?: string;
}

/** Badge quadrado com o simbolo da marca - usado no sidebar, login e favicon in-app. */
export function BrandIcon({ className, symbolClassName }: BrandIconProps) {
  return (
    <div className={clsx("flex shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white", className)}>
      <BrandSymbol className={symbolClassName} />
    </div>
  );
}

interface BrandWordmarkProps {
  className?: string;
  tagline?: boolean;
}

/** "BR INSTALACOES" com destaque de cor no "BR", e tagline opcional. */
export function BrandWordmark({ className, tagline }: BrandWordmarkProps) {
  return (
    <div className={className}>
      <p className="font-extrabold uppercase leading-none tracking-tight text-slate-900">
        <span className="text-primary-600">BR</span> Instalações
      </p>
      {tagline && (
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Qualidade <span className="text-primary-500">•</span> Segurança <span className="text-primary-500">•</span>{" "}
          Resultados
        </p>
      )}
    </div>
  );
}
