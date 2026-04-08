import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, Package } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

async function getAsset(id: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: asset, error } = await supabase
    .from('assets')
    .select(`
      *,
      projects(
        id,
        name,
        description
      ),
      deadlines(
        id,
        title,
        due_date,
        category
      )
    `)
    .eq('id', id)
    .single()

  if (error || !asset) notFound()

  return { asset, user }
}

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const { asset } = await getAsset(params.id)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/assets"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna agli asset
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
                <p className="text-gray-600">{asset.type}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Creato il {format(new Date(asset.created_at), 'dd MMMM yyyy', { locale: it })}
            </p>
          </div>
          
          <Link
            href={`/assets/${asset.id}/edit`}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Edit className="h-5 w-5" />
            Modifica
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Progetto</h2>
            {asset.projects ? (
              <Link
                href={`/projects/${asset.projects.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <h3 className="font-medium text-primary-600">{asset.projects.name}</h3>
                {asset.projects.description && (
                  <p className="text-sm text-gray-600 mt-1">{asset.projects.description}</p>
                )}
              </Link>
            ) : (
              <p className="text-gray-500">Nessun progetto associato</p>
            )}
          </div>

          {asset.details && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dettagli</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {typeof asset.details === 'object' 
                    ? JSON.stringify(asset.details, null, 2)
                    : asset.details}
                </pre>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Scadenze</h2>
                <span className="text-sm text-gray-500">({asset.deadlines?.length || 0})</span>
              </div>
              <Link
                href={`/deadlines/new?asset_id=${asset.id}&project_id=${asset.project_id}`}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                + Aggiungi
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {asset.deadlines && asset.deadlines.length > 0 ? (
                asset.deadlines.map((deadline: any) => (
                  <Link
                    key={deadline.id}
                    href={`/deadlines/${deadline.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{deadline.category}</p>
                      </div>
                      <p className="text-sm font-medium text-orange-600">
                        {format(new Date(deadline.due_date), 'dd MMM yyyy', { locale: it })}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessuna scadenza</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Data Creazione</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(asset.created_at), 'dd MMMM yyyy', { locale: it })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-600 font-mono break-all">{asset.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
