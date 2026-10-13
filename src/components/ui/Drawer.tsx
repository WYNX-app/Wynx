import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, title, children, footer, width = "max-w-xl" }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#1A0B2E]/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className={`relative flex h-full w-full ${width} flex-col bg-bg-surface shadow-modal md:rounded-l-modal`}
      >
        <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-text-muted hover:bg-bg-soft/60">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="border-t border-border-subtle px-6 py-4 flex items-center justify-end gap-2">
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body
  );
}