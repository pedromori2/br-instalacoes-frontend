"use client";

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<(value: boolean) => void>();

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function handle(result: boolean) {
    setOptions(null);
    resolveRef.current?.(result);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={options !== null} onClose={() => handle(false)} title={options?.title ?? "Confirmar acao"} widthClassName="max-w-md">
        {options && (
          <div className="space-y-5">
            <p className="text-sm text-slate-700">{options.message}</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => handle(false)}>
                {options.cancelLabel ?? "Cancelar"}
              </Button>
              <Button variant={options.variant === "danger" ? "danger" : "primary"} onClick={() => handle(true)}>
                {options.confirmLabel ?? "Confirmar"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm deve ser usado dentro de um ConfirmProvider");
  }
  return ctx;
}
