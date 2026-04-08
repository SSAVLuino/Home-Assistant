import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function AssetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: asset, error } = await supabase
    .from('assets')
    .select('id, name, type, details, created_at')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !asset) {
    return notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{asset.name}</h1>

      <p className="text-slate-400 capitalize">
        Tipo asset: {asset.type}
      </p>

      {/* Qui in futuro */}
      <div className="rounded-lg bg-slate-800 p-4">
        <p className="text-sm text-slate-400">
          Qui inseriremo:
        </p>
        <ul className="list-disc list-inside text-sm text-slate-300">
          <li>Scadenze</li>
          <li>Dettagli specifici</li>
          <li>Storico</li>
        </ul>
      </div>
    </div>
  );
}
