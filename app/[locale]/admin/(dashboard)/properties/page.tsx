import { createClient } from '@/lib/supabase/server';

export default async function AdminPropertiesPage() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Properties Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-neutral-600">Properties management interface coming soon...</p>
        <div className="mt-4">
          <p className="text-sm text-neutral-500">Total Properties: {properties?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
