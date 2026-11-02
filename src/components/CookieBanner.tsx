import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('wynx_cookie_consent')
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('wynx_cookie_consent', 'accepted')
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem('wynx_cookie_consent', 'declined')
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed z-[1000] 
                     bottom-24 left-4 right-4 
                     sm:bottom-6 sm:left-auto sm:right-6 sm:w-[340px]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/90 dark:bg-[#16142E]/95 p-4 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
            
            <button
              onClick={handleDecline}
              aria-label="Fechar"
              className="absolute top-3 right-3 rounded-lg p-1 text-text-muted hover:bg-black/5 dark:hover:bg-white/10 dark:text-white/40 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pink/20 text-brand-pink">
                <Cookie className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-text-primary dark:text-white">
                Cookies e Privacidade
              </h3>
            </div>

            <p className="text-xs text-text-muted dark:text-white/60 leading-relaxed mb-4 pr-4">
              Usamos cookies para melhorar sua experiência, analisar o tráfego e garantir a segurança. 
              <a href="/privacidade" className="underline ml-1 hover:text-brand-pink transition">
                Saiba mais
              </a>
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                className="flex-1 rounded-lg py-2 text-xs font-semibold text-text-muted dark:text-white/70 border border-border-subtle dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                Recusar
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 rounded-lg bg-brand-gradient py-2 text-xs font-bold text-white shadow-md transition hover:scale-[1.03] active:scale-95"
              >
                Aceitar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}