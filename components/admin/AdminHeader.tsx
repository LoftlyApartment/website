'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';

interface AdminHeaderProps {
  user: any;
  adminProfile: any;
  locale: string;
}

export function AdminHeader({ user, adminProfile, locale }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/admin/login`);
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Welcome, {adminProfile.full_name || user.email}</h2>
      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  );
}
