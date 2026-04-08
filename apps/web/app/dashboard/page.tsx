import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  // 1. Verifica utente
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Recupera progetti dell’utente
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name')
    .eq('owner_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  // 3. Nessun progetto → onboarding
  if (!projects || projects.length === 0) {
    redirect('/projects/new');
  }

  // 4. Almeno un progetto → dashboard vera
  return (
    <main className="w-full max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">
        Dashboard
      </h1>

      <p className="text-slate-300 mb-6">
        Progetto attivo: <strong>{projects[0].name}</strong>
      </p>

      {/* Qui poi metteremo scadenze, summary, ecc */}
    </main>
  );
}
