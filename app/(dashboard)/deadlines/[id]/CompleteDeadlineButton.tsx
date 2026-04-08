'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { addDays, addMonths, addYears, format } from 'date-fns'

interface CompleteDeadlineButtonProps {
  deadlineId: string
  currentDueDate: string
  frequency: string | null
}

export default function CompleteDeadlineButton({ 
  deadlineId, 
  currentDueDate,
  frequency 
}: CompleteDeadlineButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [doneAt, setDoneAt] = useState(new Date().toISOString().split('T')[0])
  const [nextDueDate, setNextDueDate] = useState(currentDueDate)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Calcola la prossima data suggerita quando si apre il modal
  useEffect(() => {
    if (isOpen && frequency && frequency !== 'once') {
      const calculatedDate = calculateNextDueDate(currentDueDate, frequency)
      setNextDueDate(calculatedDate)
    } else {
      setNextDueDate(currentDueDate)
    }
  }, [isOpen, currentDueDate, frequency])

  const calculateNextDueDate = (date: string, freq: string): string => {
    const currentDate = new Date(date)
    let nextDate = currentDate

    switch (freq) {
      case 'daily':
        nextDate = addDays(currentDate, 1)
        break
      case 'weekly':
        nextDate = addDays(currentDate, 7)
        break
      case 'monthly':
        nextDate = addMonths(currentDate, 1)
        break
      case 'quarterly':
        nextDate = addMonths(currentDate, 3)
        break
      case 'biannual':
        nextDate = addMonths(currentDate, 6)
        break
      case 'yearly':
        nextDate = addYears(currentDate, 1)
        break
      default:
        nextDate = currentDate
    }

    return format(nextDate, 'yyyy-MM-dd')
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      // 1. Salva il log del completamento
      const { error: logError } = await supabase
        .from('deadline_logs')
        .insert({
          deadline_id: deadlineId,
          done_at: doneAt,
          notes: notes || null,
        })

      if (logError) throw logError

      // 2. Aggiorna la scadenza con la nuova data (se è cambiata)
      if (nextDueDate !== currentDueDate) {
        const { error: updateError } = await supabase
          .from('deadlines')
          .update({ due_date: nextDueDate })
          .eq('id', deadlineId)

        if (updateError) throw updateError
      }

      setIsOpen(false)
      setNotes('')
      setDoneAt(new Date().toISOString().split('T')[0])
      router.refresh()
    } catch (error: any) {
      alert('Errore: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getFrequencyLabel = (freq: string | null): string => {
    const labels: Record<string, string> = {
      'daily': 'Giornaliera',
      'weekly': 'Settimanale',
      'monthly': 'Mensile',
      'quarterly': 'Trimestrale',
      'biannual': 'Semestrale',
      'yearly': 'Annuale',
      'once': 'Una tantum'
    }
    return freq ? labels[freq] || freq : 'Nessuna ricorrenza'
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        <CheckCircle2 className="h-5 w-5" />
        Segna come Completata
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Segna Completata</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="doneAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Data Completamento
                </label>
                <input
                  type="date"
                  id="doneAt"
                  value={doneAt}
                  onChange={(e) => setDoneAt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {frequency && frequency !== 'once' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    📅 Scadenza Ricorrente ({getFrequencyLabel(frequency)})
                  </p>
                  <label htmlFor="nextDueDate" className="block text-sm text-blue-700 mb-2">
                    Prossima Scadenza (puoi modificarla)
                  </label>
                  <input
                    type="date"
                    id="nextDueDate"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Data calcolata automaticamente, ma puoi cambiarla prima di salvare
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Note (opzionali)
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
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvataggio...' : 'Conferma'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
