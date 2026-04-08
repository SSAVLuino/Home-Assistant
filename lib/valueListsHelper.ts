import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Carica value lists con supporto per valori personalizzati utente
 * Mostra: valori default + override personali
 */
export async function loadValueLists(
  supabase: SupabaseClient,
  category: string,
  userId: string,
  onlyActive: boolean = true
) {
  // Carica valori default (user_id = null) + valori personali
  const query = supabase
    .from('value_lists')
    .select('*')
    .eq('category', category)
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('order_index')

  if (onlyActive) {
    query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) throw error

  // Merge: se esiste versione personale, sostituisci quella default
  const personalValues = (data || []).filter(item => item.user_id === userId)
  const defaultValues = (data || []).filter(item => item.user_id === null)

  const mergedItems = defaultValues.map(defaultItem => {
    const personalOverride = personalValues.find(p => p.value === defaultItem.value)
    return personalOverride || defaultItem
  })

  // Aggiungi valori personali che non hanno default
  const personalOnlyValues = personalValues.filter(
    p => !defaultValues.some(d => d.value === p.value)
  )

  return [...mergedItems, ...personalOnlyValues].sort((a, b) => a.order_index - b.order_index)
}
