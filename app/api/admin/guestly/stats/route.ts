import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GuestlySyncStatus } from '@/types/database';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sync statistics
    const { data: bookings, error: statsError } = await supabase
      .from('bookings')
      .select('guestly_sync_status, guestly_synced_at');

    if (statsError) {
      console.error('Error fetching sync stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Type the bookings data
    type BookingStats = {
      guestly_sync_status: GuestlySyncStatus | null;
      guestly_synced_at: string | null;
    };
    const typedBookings = (bookings || []) as BookingStats[];

    // Calculate stats
    const totalSynced = typedBookings.filter(b => b.guestly_sync_status === 'synced').length;
    const failedSyncs = typedBookings.filter(b => b.guestly_sync_status === 'failed').length;
    const pendingSyncs = typedBookings.filter(b => b.guestly_sync_status === 'pending').length;

    // Get last sync time
    const syncedBookings = typedBookings.filter(b => b.guestly_synced_at);
    const lastSyncTime = syncedBookings.length > 0
      ? syncedBookings.reduce((latest, booking) => {
          const syncTime = new Date(booking.guestly_synced_at!);
          return syncTime > latest ? syncTime : latest;
        }, new Date(0)).toISOString()
      : null;

    // Calculate success rate
    const totalAttempts = totalSynced + failedSyncs;
    const successRate = totalAttempts > 0 ? (totalSynced / totalAttempts) * 100 : 0;

    // Get recent failures
    const { data: recentFailures, error: failuresError } = await supabase
      .from('bookings')
      .select('id, booking_reference, guestly_sync_error, created_at')
      .eq('guestly_sync_status', 'failed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (failuresError) {
      console.error('Error fetching recent failures:', failuresError);
    }

    return NextResponse.json({
      totalSynced,
      failedSyncs,
      pendingSyncs,
      lastSyncTime,
      successRate,
      recentFailures: recentFailures || [],
    });
  } catch (error) {
    console.error('Error in /api/admin/guestly/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
