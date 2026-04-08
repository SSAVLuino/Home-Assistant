import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, CheckCircle2, Package, FolderKanban } from 'lucide-react'
import { format, parseISO, isBefore } from 'date-fns'
import { it } from 'date-fns/locale'
import CompleteDeadlineButton from './CompleteDeadlineButton'

async function getDeadline(id: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: deadline, error } = await supabase
    .from('deadlines')
    .select(`
      *,
      projects(id, name),
      assets(id, name),
      deadline_logs(
        id,
        done_at,
        notes
      )
    `)
    .eq('id', id)
    .single()

  if (error || !deadline) notFound()

  if (deadline.deadline_logs) {
    deadline.deadline_logs.sort((a: any, b: any) => 
      new Date(b.done_at).getTime() - new Date(a.done_at).getTime()
    )
  }

  return { deadline, user }
}

export default async function DeadlineDetailPage({ params }: { params: { id: string } }) {
  const { deadline } = await getDeadline(params.id)
  const isOverdue = isBefore(parseISO(deadline.due_date), new Date())

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/deadlines"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alle scadenze
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                isOverdue ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                <Calendar className={`h-6 w-6 ${isOverdue ? 'text-red-600' : 'text-orange-600'}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{deadline.title}</h1>
                <p className="text-gray-600">{deadline.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <p className={`text-lg font-semibold ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                Scadenza: {format(parseISO(deadline.due_date), 'dd MMMM yyyy', { locale: it })}
              </p>
              {deadline.frequency && (
                <span className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                  {deadline.frequency}
                </span>
              )}
              {isOverdue && (
                <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                  Scaduta
                </span>
              )}
            </div>
          </div>
          
          <CompleteDeadlineButton deadlineId={deadline.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {deadline.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Note</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{deadline.notes}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Storico Completamenti</h2>
                <span className="text-sm text-gray-500">({deadline.deadline_logs?.length || 0})</span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {deadline.deadline_logs && deadline.deadline_logs.length > 0 ? (
                deadline.deadline_logs.map((log: any) => (
                  <div key={log.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Completata il {format(parseISO(log.done_at), 'dd MMMM yyyy', { locale: it })}
                        </p>
                        {log.notes && (
                          <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                        )}
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessun completamento registrato</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Categoria</dt>
                <dd className="mt-1 text-sm text-gray-900">{deadline.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Data Scadenza</dt>
                <dd className={`mt-1 text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {format(parseISO(deadline.due_date), 'dd MMMM yyyy', { locale: it })}
                </dd>
              </div>
              {deadline.frequency && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Frequenza</dt>
                  <dd className="mt-1 text-sm text-gray-900">{deadline.frequency}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Data Creazione</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(parseISO(deadline.created_at), 'dd MMM yyyy', { locale: it })}
                </dd>
              </div>
            </dl>
          </div>

          {deadline.projects && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progetto</h2>
              <Link
                href={`/projects/${deadline.projects.id}`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <FolderKanban className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-primary-600">{deadline.projects.name}</span>
              </Link>
            </div>
          )}

          {deadline.assets && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset</h2>
              <Link
                href={`/assets/${deadline.assets.id}`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <Package className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-600">{deadline.assets.name}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
