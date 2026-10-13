import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

type Tone = "success" | "error" | "info";

interface ToastItem {
  id: string;
  tone: Tone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (t: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

const tones: Record<Tone, string> = {
  success: "border-success/30 bg-success/10 text-success",
  error:   "border-danger/30 bg-danger/10 text-danger",
  info:    "border-brand-violet/30 bg-brand-violet/10 text-[#6B21A8]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
          {items.map((t) => {
            const Icon = icons[t.tone];
            return (
              <div
                key={t.id}
                role="status"
                className={cn("flex items-start gap-3 rounded-xl border bg-bg-surface p-4 shadow-card", tones[t.tone])}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-xs text-text-secondary">{t.description}</p>}
                </div>
                <button onClick={() => remove(t.id)} aria-label="Fechar" className="text-text-muted hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx;
}