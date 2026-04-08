import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <span className="font-semibold">MyDeadlines</span>
        /logout
          <button className="text-sm text-slate-400 hover:text-white">
            Logout
          </button>
        </form>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="flex justify-around border-t border-slate-700 py-2 text-sm">
        /dashboardDashboard</Link>
        /assetsAsset</Link>
        /assets/new+ Asset</Link>
      </nav>
    </div>
  );
}
