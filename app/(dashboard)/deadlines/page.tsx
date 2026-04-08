import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, AlertCircle } from 'lucide-react'
import { format, parseISO, isBefore, isToday, isFuture } from 'date-fns'
import { it } from 'date-fns/locale'

async function getDeadlines() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ottieni i progetti dell'utente
  const { data: userProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', user.id)

  const projectIds = userProjects?.map(p => p.id) || []

  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select(`
      *,
      projects(name),
      assets(name)
    `)
    .in('project_id', projectIds.length > 0 ? projectIds : ['00000000-0000-0000-0000-000000000000'])
    .order('due_date', { ascending: true })

  return { deadlines: deadlines || [] }
}

function getDeadlineStatus(dueDate: string) {
  const date = parseISO(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (isBefore(date, today)) {
    return { label: 'Scaduta', color: 'text-red-600 bg-red-50 border-red-200' }
  } else if (isToday(date)) {
    return { label: 'Oggi', color: 'text-orange-600 bg-orange-50 border-orange-200' }
  } else {
    return { label: 'In scadenza', color: 'text-green-600 bg-green-50 border-green-200' }
  }
}

export default async function DeadlinesPage() {
  const { deadlines } = await getDeadlines()

  const overdueDeadlines = deadlines.filter(d => isBefore(parseISO(d.due_date), new Date()))
  const upcomingDeadlines = deadlines.filter(d => !isBefore(parseISO(d.due_date), new Date()))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scadenze</h1>
          <p className="text-gray-600 mt-1">Gestisci le tue scadenze</p>
        </div>
        <Link
          href="/deadlines/new"
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuova Scadenza
        </Link>
      </div>

      {deadlines.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna scadenza</h3>
          <p className="text-gray-600 mb-6">Inizia creando la tua prima scadenza</p>
          <Link
            href="/deadlines/new"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Crea Scadenza
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Scadenze scadute */}
          {overdueDeadlines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-900">Scadenze Scadute ({overdueDeadlines.length})</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {overdueDeadlines.map((deadline: any) => {
                  const status = getDeadlineStatus(deadline.due_date)
                  return (
                    <Link
                      key={deadline.id}
                      href={`/deadlines/${deadline.id}`}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded border ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{deadline.category}</span>
                            {deadline.frequency && <span>• {deadline.frequency}</span>}
                            <span>• {deadline.projects?.name || deadline.assets?.name || 'N/A'}</span>
                          </div>
                          {deadline.notes && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-1">{deadline.notes}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-medium text-red-600">
                            {format(parseISO(deadline.due_date), 'dd MMM yyyy', { locale: it })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Scadenze future */}
          {upcomingDeadlines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Prossime Scadenze ({upcomingDeadlines.length})</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingDeadlines.map((deadline: any) => {
                  const status = getDeadlineStatus(deadline.due_date)
                  return (
                    <Link
                      key={deadline.id}
                      href={`/deadlines/${deadline.id}`}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded border ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{deadline.category}</span>
                            {deadline.frequency && <span>• {deadline.frequency}</span>}
                            <span>• {deadline.projects?.name || deadline.assets?.name || 'N/A'}</span>
                          </div>
                          {deadline.notes && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-1">{deadline.notes}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-sm font-medium ${isToday(parseISO(deadline.due_date)) ? 'text-orange-600' : 'text-gray-900'}`}>
                            {format(parseISO(deadline.due_date), 'dd MMM yyyy', { locale: it })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
