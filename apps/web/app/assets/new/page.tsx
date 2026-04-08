'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewAssetPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState('car');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Recupera project attivo (per ora: primo)
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .single();

    const { error } = await supabase.from('assets').insert({
      name,
      type,
      project_id: projects.id,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="w-full max-w-sm rounded-xl bg-slate-800 p-6 shadow-xl">
      <h1 className="text-xl font-semibold mb-4">
        Nuovo asset
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Nome asset (es. Auto principale)"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full rounded-md bg-slate-700 px-4 py-3 text-sm"
        />

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full rounded-md bg-slate-700 px-4 py-3 text-sm"
        >
          <option value="car">Auto</option>
          <option value="home">Casa</option>
          <option value="other">Altro</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-3 text-sm font-medium hover:bg-blue-700"
        >
          {loading ? 'Salvataggio...' : 'Crea asset'}
        </button>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
``
