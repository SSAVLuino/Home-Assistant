'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <main>
        <h1>Controlla la tua email</h1>
        <p>
          Ti abbiamo inviato un link per confermare
          la registrazione.
        </p>
        <button onClick={() => router.push('/login')}>
          Vai al login
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Crea account</h1>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          minLength={6}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Creazione...' : 'Registrati'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginBottom: 12,
  fontSize: 16,
  borderRadius: 6,
  border: '1px solid #ccc',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  backgroundColor: '#16a34a',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 16,
};
