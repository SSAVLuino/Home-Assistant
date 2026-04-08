'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, X } from 'lucide-react'

export default function CompleteDeadlineButton({ deadlineId }: { deadlineId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [doneAt, setDoneAt] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleComplete = async () => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('deadline_logs')
        .insert({
          deadline_id: deadlineId,
          done_at: doneAt,
          notes: notes || null,
        })

      if (error) throw error

      setShowModal(false)
      setNotes('')
      router.refresh()
    } catch (error: any) {
      alert('Errore: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        <CheckCircle2 className="h-5 w-5" />
        Segna come Completata
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Completa Scadenza</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="doneAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Data Completamento *
                </label>
                <input
                  type="date"
                  id="doneAt"
                  value={doneAt}
                  onChange={(e) => setDoneAt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Note (opzionale)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Aggiungi note sul completamento..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {loading ? 'Salvataggio...' : 'Salva'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
