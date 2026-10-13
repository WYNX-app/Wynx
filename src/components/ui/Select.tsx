import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option { value: string; label: string }

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, options, placeholder, ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "field appearance-none pr-10",
              error && "border-danger focus:border-danger focus:ring-danger/25",
              className
            )}
            {...rest}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";