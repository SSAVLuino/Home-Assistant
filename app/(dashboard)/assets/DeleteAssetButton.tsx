'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'

export default function DeleteAssetButton({ assetId, assetName }: { assetId: string, assetName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleConfirm = async () => {
    setShowConfirm(false)
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)

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
        title="Elimina asset"
        message={`Sei sicuro di voler eliminare l'asset "${assetName}"?`}
        confirmLabel="Elimina"
        danger
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {isDeleting ? 'Eliminazione...' : 'Elimina'}
      </button>
    </>
  )
}
