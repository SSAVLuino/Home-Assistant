'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { List, Plus, Edit2, Trash2, Save, X } from 'lucide-react'

interface ValueListItem {
  id: string
  category: string
  value: string
  label: string
  order_index: number
  is_active: boolean
}

const CATEGORIES = [
  { value: 'asset_type', label: 'Tipi Asset' },
  { value: 'deadline_category', label: 'Categorie Scadenze' },
  { value: 'deadline_frequency', label: 'Frequenze Scadenze' },
  { value: 'member_role', label: 'Ruoli Membri' },
]

export default function ValueListsPage() {
  const [selectedCategory, setSelectedCategory] = useState('asset_type')
  const [items, setItems] = useState<ValueListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  
  // Form state
  const [formValue, setFormValue] = useState('')
  const [formLabel, setFormLabel] = useState('')
  const [formOrderIndex, setFormOrderIndex] = useState(0)
  
  const supabase = createClient()

  useEffect(() => {
    loadItems()
  }, [selectedCategory])

  const loadItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('value_lists')
        .select('*')
        .eq('category', selectedCategory)
        .order('order_index')

      if (error) throw error
      setItems(data || [])
    } catch (error: any) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setIsAdding(true)
    setFormValue('')
    setFormLabel('')
    setFormOrderIndex(items.length + 1)
  }

  const handleEdit = (item: ValueListItem) => {
    setEditingId(item.id)
    setFormValue(item.value)
    setFormLabel(item.label)
    setFormOrderIndex(item.order_index)
  }

  const handleSave = async () => {
    try {
      if (isAdding) {
        const { error } = await supabase
          .from('value_lists')
          .insert({
            category: selectedCategory,
            value: formValue,
            label: formLabel,
            order_index: formOrderIndex,
            is_active: true,
          })

        if (error) throw error
      } else if (editingId) {
        const { error } = await supabase
          .from('value_lists')
          .update({
            value: formValue,
            label: formLabel,
            order_index: formOrderIndex,
          })
          .eq('id', editingId)

        if (error) throw error
      }

      setIsAdding(false)
      setEditingId(null)
      loadItems()
    } catch (error: any) {
      alert('Errore: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo elemento?')) return

    try {
      const { error } = await supabase
        .from('value_lists')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadItems()
    } catch (error: any) {
      alert('Errore: ' + error.message)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('value_lists')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      loadItems()
    } catch (error: any) {
      alert('Errore: ' + error.message)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormValue('')
    setFormLabel('')
    setFormOrderIndex(0)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Value List</h1>
        <p className="text-gray-600 mt-1">Configura le liste di valori utilizzate nell'applicazione</p>
      </div>

      {/* Category Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Seleziona Categoria
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                selectedCategory === cat.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {CATEGORIES.find(c => c.value === selectedCategory)?.label}
            </h2>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Aggiungi
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valore</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etichetta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAdding && (
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={formOrderIndex}
                        onChange={(e) => setFormOrderIndex(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                        placeholder="valore"
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={formLabel}
                        onChange={(e) => setFormLabel(e.target.value)}
                        placeholder="Etichetta visualizzata"
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Attivo</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-700 p-1"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                )}

                {items.map((item) => (
                  <tr key={item.id} className={editingId === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={formOrderIndex}
                          onChange={(e) => setFormOrderIndex(parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">{item.order_index}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={formValue}
                          onChange={(e) => setFormValue(e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-sm font-mono text-gray-900">{item.value}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={formLabel}
                          onChange={(e) => setFormLabel(e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">{item.label}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                        className={`text-xs px-2 py-1 rounded cursor-pointer ${
                          item.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {item.is_active ? 'Attivo' : 'Disattivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-primary-600 hover:text-primary-700 p-1"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
