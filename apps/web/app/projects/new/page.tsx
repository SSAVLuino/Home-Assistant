'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewProjectPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('projects').insert({
      name,
      owner_id: user.id,
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
        Crea il tuo primo progetto
      </h1>

      <p className="text-sm text-slate-400 mb-6">
        Il progetto serve per organizzare scadenze,
        auto, casa e manutenzioni.
      </p>

      <form onSubmit={handleCreate} className="space-y-4">
        <input
          placeholder="Nome progetto (es. Casa, Famiglia)"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full rounded-md bg-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-green-600 py-3 text-sm font-medium hover:bg-green-700 transition"
        >
          {loading ? 'Creazione...' : 'Crea progetto'}
        </button>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
