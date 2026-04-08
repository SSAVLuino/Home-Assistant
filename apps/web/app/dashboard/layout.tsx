import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between border-b border-slate-700 pb-4">
        <h1 className="text-lg font-semibold">MyDeadlines</h1>
        <form action="/logout" method="post">
          <button className="text-sm text-slate-400 hover:text-white">
            Logout
          </button>
        </form>
      </header>

      {/* Menu */}
      <nav className="mb-6 flex gap-4 text-sm">
        /dashboardDashboard</Link>
        /assets/newNuovo asset</Link>
      </nav>

      {/* Content */}
      {children}
    </div>
  );
}
