'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import Link from 'next/link'

export default function PushActivationBanner({ hasNotifyPushDeadlines }: { hasNotifyPushDeadlines: boolean }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!hasNotifyPushDeadlines) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'denied') return

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (!sub) setShow(true)
      })
    }).catch(() => {})
  }, [hasNotifyPushDeadlines])

  if (!show) return null

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-orange-500 shrink-0" />
        <p className="text-sm text-orange-800">
          Hai scadenze con notifiche push attivate.{' '}
          <Link href="/settings" className="font-semibold underline hover:text-orange-900">
            Vai alle impostazioni
          </Link>{' '}
          per attivare le notifiche su questo dispositivo.
        </p>
      </div>
      <button onClick={() => setShow(false)} className="shrink-0 text-orange-400 hover:text-orange-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
