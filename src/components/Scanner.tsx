import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, Keyboard } from 'lucide-react'

interface ScannerProps {
  onScan: (code: string) => void
  onClose: () => void
}

export function Scanner({ onScan, onClose }: ScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera')
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    if (mode !== 'camera') return

    let mounted = true
    const scanner = new Html5Qrcode('scanner-container')
    scannerRef.current = scanner

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: 1.777,
          },
          (decodedText) => {
            if (mounted) {
              onScan(decodedText)
              stop()
            }
          },
          () => { /* ignora erros de frame */ }
        )
        if (mounted) setScanning(true)
      } catch (err: any) {
        if (mounted) {
          if (err?.name === 'NotAllowedError') {
            setError('Permissão de câmera negada. Verifique as configurações.')
          } else if (err?.name === 'NotFoundError') {
            setError('Nenhuma câmera encontrada neste dispositivo.')
          } else {
            setError('Não foi possível iniciar a câmera. Digite o código manualmente.')
          }
        }
      }
    }

    start()

    return () => {
      mounted = false
      stop()
    }
  }, [mode])

  const stop = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch { /* ignora */ }
      scannerRef.current = null
      setScanning(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const input = (e.currentTarget.elements.namedItem('manualCode') as HTMLInputElement)
    const code = input.value.trim()
    if (code) {
      onScan(code)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-bg-surface shadow-modal">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <h3 className="font-display text-lg font-bold">Escanear código</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted transition hover:bg-bg-soft" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-border-subtle">
          <button
            onClick={() => setMode('camera')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition ${
              mode === 'camera' ? 'border-b-2 border-brand-violet text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Camera className="h-4 w-4" /> Câmera
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition ${
              mode === 'manual' ? 'border-b-2 border-brand-violet text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Keyboard className="h-4 w-4" /> Digitar código
          </button>
        </div>

        <div className="p-4">
          {mode === 'camera' && (
            <>
              <div id="scanner-container" className="overflow-hidden rounded-xl bg-black" style={{ minHeight: 280 }} />
              {scanning && !error && <p className="mt-3 text-center text-sm text-text-muted">Aponte a câmera para o código...</p>}
              {error && <div className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
            </>
          )}

          {mode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <p className="text-sm text-text-muted">Digite o código de barras ou SKU do produto.</p>
              <input name="manualCode" className="field" placeholder="Ex: 789100000001 ou VES-001" autoFocus required />
              <button type="submit" className="btn-primary w-full">Buscar produto</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}