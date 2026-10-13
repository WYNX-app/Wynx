import { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField: keyof T;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns, rows, keyField,
  emptyMessage = "Nenhum registro encontrado.",
  onRowClick,
}: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-border-subtle bg-bg-surface py-12 text-center text-sm text-text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border-subtle bg-bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-base/60">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    !c.align && "text-left",
                    c.className
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border-subtle/60 last:border-0 transition",
                  onRowClick && "cursor-pointer hover:bg-bg-soft/40"
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 py-3 text-text-secondary",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center"
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}