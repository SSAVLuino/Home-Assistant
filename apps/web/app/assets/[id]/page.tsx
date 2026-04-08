import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function AssetsPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: assets, error } = await supabase
    .from('assets')
    .select('id, name, type')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
