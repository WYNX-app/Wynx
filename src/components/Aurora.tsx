declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}

declare module 'react/jsx-runtime' {
  export const Fragment: any
  export function jsx(type: any, props: any, key?: any): any
  export function jsxs(type: any, props: any, key?: any): any
}

interface AuroraProps {
  variant?: 'splash' | 'login'
  className?: string
}

/**
 * Fundo animado em CSS puro.
 * Sem WebGL, sem crash, funciona em qualquer máquina.
 */
export default function Aurora({ variant = 'splash', className = '' }: AuroraProps) {
  if (variant === 'splash') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div
          className="absolute -left-1/4 top-1/4 h-[700px] w-[700px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(196, 181, 253, 0.55) 0%, transparent 70%)',
            animation: 'wynx-float-1 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -right-1/4 top-1/2 h-[600px] w-[600px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(249, 168, 212, 0.55) 0%, transparent 70%)',
            animation: 'wynx-float-2 22s ease-in-out infinite',
          }}
        />
        <div
          className="absolute left-1/3 -bottom-1/4 h-[500px] w-[500px] rounded-full blur-[110px]"
          style={{
            background: 'radial-gradient(circle, rgba(245, 185, 66, 0.45) 0%, transparent 70%)',
            animation: 'wynx-float-3 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute right-1/4 top-0 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(103, 232, 249, 0.5) 0%, transparent 70%)',
            animation: 'wynx-float-2 25s ease-in-out infinite reverse',
          }}
        />
      </div>
    )
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute -top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(196, 181, 253, 0.7) 0%, transparent 70%)',
          animation: 'wynx-float-1 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[700px] w-[700px] rounded-full blur-[130px]"
        style={{
          background: 'radial-gradient(circle, rgba(249, 168, 212, 0.65) 0%, transparent 70%)',
          animation: 'wynx-float-2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 left-1/3 h-[600px] w-[600px] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(245, 185, 66, 0.4) 0%, transparent 70%)',
          animation: 'wynx-float-3 23s ease-in-out infinite',
        }}
      />
    </div>
  )
}