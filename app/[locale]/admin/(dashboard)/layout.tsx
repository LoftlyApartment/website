import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import type { AdminProfile } from '@/types/database';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  console.log('Admin layout - checking auth');

  const { data: { user }, error } = await supabase.auth.getUser();

  console.log('User:', user);
  console.log('Auth error:', error);

  if (!user || error) {
    console.log('No user found, redirecting to login');
    redirect(`/${locale}/admin/login`);
  }

  // Use admin client to bypass RLS for admin_profiles check
  const adminSupabase = createAdminClient();
  const { data: adminProfile, error: profileError } = await adminSupabase
    .from('admin_profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: AdminProfile | null; error: any };

  console.log('Admin profile:', adminProfile);
  console.log('Profile error:', profileError);

  if (!adminProfile || profileError || !adminProfile.is_active) {
    console.log('No active admin profile found, redirecting to login');
    redirect(`/${locale}/admin/login`);
  }

  console.log('Auth check passed, rendering dashboard');

  return (
    <div className="flex h-screen bg-neutral-50">
      <AdminSidebar locale={locale} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} adminProfile={adminProfile} locale={locale} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
