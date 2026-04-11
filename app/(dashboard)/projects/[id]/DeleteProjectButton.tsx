'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

export default function DeleteProjectButton({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleConfirm = async () => {
    setShowConfirm(false)
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      alert('Errore durante l\'eliminazione: ' + error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        title="Elimina progetto"
        message={`Sei sicuro di voler eliminare il progetto "${projectName}"? Questa azione eliminerà anche tutti gli asset e le scadenze associate.`}
        confirmLabel="Elimina"
        danger
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1"
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting ? 'Eliminazione...' : 'Elimina'}
      </button>
    </>
  )
}
