import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  placeholder?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className = '', label, error, placeholder = 'Senha', ...rest }, ref) => {
    const [show, setShow] = useState(false)
    const [capsOn, setCapsOn] = useState(false)

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      setCapsOn(e.getModifierState?.('CapsLock') ?? false)
      rest.onKeyDown?.(e)
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">{label}</label>
        )}

        <div className="group relative">
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            placeholder={placeholder}
            className={`field pr-11 transition-all duration-300 ${className}`}
            onKeyDown={handleKey}
            onKeyUp={handleKey}
            {...rest}
          />

          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-text-muted transition hover:bg-bg-soft hover:text-text-primary active:scale-90"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {capsOn && (
          <div className="flex items-center gap-1.5 rounded-lg border border-warning/30 bg-warning/10 px-2 py-1 text-xs text-warning animate-[wynx-fade-in_0.3s_ease-out]">
            <AlertCircle className="h-3.5 w-3.5" />
            Caps Lock está ativado
          </div>
        )}

        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    )
  }
)

PasswordField.displayName = 'PasswordField'