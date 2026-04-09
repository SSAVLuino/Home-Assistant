import { SupabaseClient } from '@supabase/supabase-js'

export type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface ProjectPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canCreateAssets: boolean
  canEditAssets: boolean
  canDeleteAssets: boolean
  canCreateDeadlines: boolean
  canEditDeadlines: boolean
  canDeleteDeadlines: boolean
  canManageMembers: boolean
  role: ProjectRole | null
  isOwner: boolean
}

/**
 * Ottiene il ruolo dell'utente in un progetto
 */
export async function getUserProjectRole(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
): Promise<ProjectRole | null> {
  // 1. Verifica se è il proprietario
  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', projectId)
    .single()

  if (project?.owner_id === userId) {
    return 'owner'
  }

  // 2. Verifica se è un membro
  const { data: member } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()

  if (member?.role) {
    return member.role as ProjectRole
  }

  return null // Non ha accesso al progetto
}

/**
 * Calcola i permessi dell'utente in base al ruolo
 */
export function getPermissionsFromRole(role: ProjectRole | null): ProjectPermissions {
  const basePermissions: ProjectPermissions = {
    canView: false,
    canEdit: false,
    canDelete: false,
    canCreateAssets: false,
    canEditAssets: false,
    canDeleteAssets: false,
    canCreateDeadlines: false,
    canEditDeadlines: false,
    canDeleteDeadlines: false,
    canManageMembers: false,
    role,
    isOwner: false,
  }

  if (!role) return basePermissions

  switch (role) {
    case 'owner':
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canCreateAssets: true,
        canEditAssets: true,
        canDeleteAssets: true,
        canCreateDeadlines: true,
        canEditDeadlines: true,
        canDeleteDeadlines: true,
        canManageMembers: true,
        role: 'owner',
        isOwner: true,
      }

    case 'admin':
      return {
        canView: true,
        canEdit: true,
        canDelete: false, // Admin non può eliminare il progetto
        canCreateAssets: true,
        canEditAssets: true,
        canDeleteAssets: true,
        canCreateDeadlines: true,
        canEditDeadlines: true,
        canDeleteDeadlines: true,
        canManageMembers: false, // Admin non gestisce membri
        role: 'admin',
        isOwner: false,
      }

    case 'editor':
      return {
        canView: true,
        canEdit: false, // Editor non modifica le impostazioni del progetto
        canDelete: false,
        canCreateAssets: true,
        canEditAssets: true,
        canDeleteAssets: false, // Editor non elimina, solo modifica
        canCreateDeadlines: true,
        canEditDeadlines: true,
        canDeleteDeadlines: false,
        canManageMembers: false,
        role: 'editor',
        isOwner: false,
      }

    case 'viewer':
      return {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreateAssets: false,
        canEditAssets: false,
        canDeleteAssets: false,
        canCreateDeadlines: false,
        canEditDeadlines: false,
        canDeleteDeadlines: false,
        canManageMembers: false,
        role: 'viewer',
        isOwner: false,
      }

    default:
      return basePermissions
  }
}

/**
 * Funzione combinata: ottiene ruolo e calcola permessi
 */
export async function getProjectPermissions(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
): Promise<ProjectPermissions> {
  const role = await getUserProjectRole(supabase, projectId, userId)
  return getPermissionsFromRole(role)
}

/**
 * Verifica se l'utente ha accesso al progetto
 */
export async function canAccessProject(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
): Promise<boolean> {
  const role = await getUserProjectRole(supabase, projectId, userId)
  return role !== null
}

/**
 * Hook-like function per ottenere permessi (per use in client components)
 */
export function getPermissionChecks(permissions: ProjectPermissions) {
  return {
    // Progetti
    canEditProject: permissions.canEdit,
    canDeleteProject: permissions.canDelete,
    
    // Asset
    canCreateAsset: permissions.canCreateAssets,
    canEditAsset: permissions.canEditAssets,
    canDeleteAsset: permissions.canDeleteAssets,
    
    // Scadenze
    canCreateDeadline: permissions.canCreateDeadlines,
    canEditDeadline: permissions.canEditDeadlines,
    canDeleteDeadline: permissions.canDeleteDeadlines,
    
    // Membri
    canManageMembers: permissions.canManageMembers,
    
    // Utility
    isOwner: permissions.isOwner,
    isReadOnly: permissions.role === 'viewer',
    role: permissions.role,
  }
}

/**
 * Formatta il nome del ruolo per display
 */
export function formatRoleName(role: ProjectRole | null): string {
  switch (role) {
    case 'owner': return 'Proprietario'
    case 'admin': return 'Amministratore'
    case 'editor': return 'Editor'
    case 'viewer': return 'Visualizzatore'
    default: return 'Nessun ruolo'
  }
}

/**
 * Colore badge per ruolo
 */
export function getRoleBadgeColor(role: ProjectRole | null): string {
  switch (role) {
    case 'owner': return 'bg-primary-100 text-primary-700 border-primary-300'
    case 'admin': return 'bg-purple-100 text-purple-700 border-purple-300'
    case 'editor': return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'viewer': return 'bg-gray-100 text-gray-700 border-gray-300'
    default: return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}
