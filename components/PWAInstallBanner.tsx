'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Controlla se già installato
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    if (isStandalone || isIOSStandalone) {
      return // Già installato, non mostrare banner
    }

    // Controlla se l'utente ha già nascosto il banner (usa sessionStorage invece di localStorage)
    const bannerDismissed = sessionStorage.getItem('pwa-banner-dismissed')
    if (bannerDismissed) {
      return
    }

    // Ascolta evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 beforeinstallprompt event captured')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Mostra banner dopo 2 secondi per dare tempo al SW di registrarsi
      setTimeout(() => {
        setShowBanner(true)
      }, 2000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listener per quando app viene installata
    const handleAppInstalled = () => {
      console.log('✅ PWA installata!')
      setShowBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('❌ No deferred prompt available')
      return
    }

    console.log('🚀 Calling prompt()')
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`✨ User choice: ${outcome}`)

      if (outcome === 'accepted') {
        console.log('✅ User accepted install')
      } else {
        console.log('❌ User dismissed install')
      }
    } catch (error) {
      console.error('Error during install:', error)
    }

    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleDismiss = () => {
    console.log('👋 User dismissed banner')
    setShowBanner(false)
    // Usa sessionStorage invece di localStorage (disponibile anche in SW context)
    sessionStorage.setItem('pwa-banner-dismissed', 'true')
  }

  if (!showBanner || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl shadow-2xl p-4 border border-orange-500">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <img 
              src="/icons/icon-96x96.png" 
              alt="Scadix" 
              className="w-10 h-10 rounded"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">Installa Scadix</h3>
            <p className="text-sm text-orange-100 mb-3">
              Aggiungi l'app alla schermata Home per un accesso rapido!
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Installa
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm text-orange-100 hover:text-white transition-colors"
              >
                Non ora
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-orange-200 hover:text-white transition-colors"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
