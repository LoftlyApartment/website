import { createClient } from '@/lib/supabase/server';

interface BookingGuest {
  guest_email: string;
  guest_first_name: string;
  guest_last_name: string;
}

export default async function AdminGuestsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('guest_email, guest_first_name, guest_last_name')
    .order('created_at', { ascending: false });

  // Get unique guests
  const uniqueGuests = (bookings as BookingGuest[] | null)?.reduce((acc: any[], booking) => {
    const existingGuest = acc.find(g => g.email === booking.guest_email);
    if (!existingGuest) {
      acc.push({
        email: booking.guest_email,
        firstName: booking.guest_first_name,
        lastName: booking.guest_last_name,
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Guests Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-neutral-600">Guests management interface coming soon...</p>
        <div className="mt-4">
          <p className="text-sm text-neutral-500">Total Guests: {uniqueGuests?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
