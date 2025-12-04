import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentBookings } from '@/components/admin/RecentBookings';
import { GuestlySyncStatus } from '@/components/admin/GuestlySyncStatus';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get stats
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  const { count: confirmedBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'confirmed');

  const { data: revenueData } = await supabase
    .from('bookings')
    .select('total')
    .eq('payment_status', 'completed');

  const totalRevenue = revenueData?.reduce((sum, b) => sum + Number((b as any).total), 0) || 0;

  const { count: activeProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Get recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (name, address)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Bookings"
          value={totalBookings || 0}
          icon="calendar"
        />
        <StatsCard
          title="Confirmed Bookings"
          value={confirmedBookings || 0}
          icon="check"
        />
        <StatsCard
          title="Total Revenue"
          value={`€${totalRevenue.toFixed(2)}`}
          icon="dollar"
        />
        <StatsCard
          title="Active Properties"
          value={activeProperties || 0}
          icon="building"
        />
      </div>

      {/* Guestly Sync Status */}
      <GuestlySyncStatus />

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
        <RecentBookings bookings={recentBookings || []} />
      </div>
    </div>
  );
}
