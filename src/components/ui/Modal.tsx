import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A0B2E]/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn("relative w-full card rounded-modal shadow-modal overflow-hidden", sizes[size])}
      >
        {title && (
          <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-text-muted hover:bg-bg-soft/60">
              <X className="h-4 w-4" />
            </button>
          </header>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-border-subtle bg-bg-base/50 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}