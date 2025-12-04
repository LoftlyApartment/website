import { createClient } from '@/lib/supabase/server';
import { BookingsTable } from '@/components/admin/BookingsTable';
import { BookingsFilters } from '@/components/admin/BookingsFilters';

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (name, address)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
      </div>

      <BookingsFilters />

      <div className="bg-white rounded-lg shadow">
        <BookingsTable bookings={bookings || []} />
      </div>
    </div>
  );
}
