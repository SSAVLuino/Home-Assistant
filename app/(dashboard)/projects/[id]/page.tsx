import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Users, Package, Calendar, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import ProjectMembers from './ProjectMembers'
import { getProjectPermissions, formatRoleName, getRoleBadgeColor } from '@/lib/permissionsHelper'

async function getProject(id: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members(
        user_id,
        role
      ),
      assets(
        id,
        name,
        type,
        created_at
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

  if (error || !project) notFound()

  // Calcola i permessi dell'utente
  const permissions = await getProjectPermissions(supabase, id, user.id)
  
  // Se non ha accesso, blocca
  if (!permissions.canView) {
    notFound()
  }

  return { project, user, permissions }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { project, user, permissions } = await getProject(params.id)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai progetti
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <span className={`text-xs px-3 py-1 rounded-full border ${getRoleBadgeColor(permissions.role)}`}>
                <Shield className="h-3 w-3 inline mr-1" />
                {formatRoleName(permissions.role)}
              </span>
            </div>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Creato il {format(new Date(project.created_at), 'dd MMMM yyyy', { locale: it })}
            </p>
          </div>
          
          {permissions.canEdit && (
            <Link
              href={`/projects/${project.id}/edit`}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit className="h-5 w-5" />
              Modifica
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset del progetto */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Asset</h2>
                <span className="text-sm text-gray-500">({project.assets?.length || 0})</span>
              </div>
              {permissions.canCreateAssets && (
                <Link
                  href={`/assets/new?project_id=${project.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Aggiungi
                </Link>
              )}
            </div>
            <div className="divide-y divide-gray-200">
              {project.assets && project.assets.length > 0 ? (
                project.assets.map((asset: any) => (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{asset.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{asset.type}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(new Date(asset.created_at), 'dd MMM yyyy', { locale: it })}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessun asset</p>
                </div>
              )}
            </div>
          </div>

          {/* Scadenze del progetto */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Scadenze</h2>
                <span className="text-sm text-gray-500">({project.deadlines?.length || 0})</span>
              </div>
              {permissions.canCreateDeadlines && (
                <Link
                  href={`/deadlines/new?project_id=${project.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Aggiungi
                </Link>
              )}
            </div>
            <div className="divide-y divide-gray-200">
              {project.deadlines && project.deadlines.length > 0 ? (
                project.deadlines.map((deadline: any) => (
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

        {/* Membri del progetto */}
        <div className="lg:col-span-1">
          <ProjectMembers 
            projectId={project.id}
            currentMembers={project.project_members || []}
            isOwner={project.owner_id === user.id}
          />
        </div>
      </div>
    </div>
  )
}
