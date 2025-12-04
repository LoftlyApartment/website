import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { retryFailedSync } from '@/lib/guestly/sync';

export async function POST() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all failed syncs
    const { data: failedBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id')
      .eq('guestly_sync_status', 'failed');

    if (fetchError) {
      console.error('Error fetching failed bookings:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Type the booking data
    type BookingId = { id: string };
    const typedFailedBookings = (failedBookings || []) as BookingId[];

    if (typedFailedBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No failed syncs to retry',
        retriedCount: 0,
        successCount: 0,
      });
    }

    // Retry each failed sync
    const results = await Promise.allSettled(
      typedFailedBookings.map(booking => retryFailedSync(booking.id))
    );

    const successCount = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length;

    return NextResponse.json({
      success: true,
      message: `Retried ${typedFailedBookings.length} failed syncs`,
      retriedCount: typedFailedBookings.length,
      successCount,
      failedCount: typedFailedBookings.length - successCount,
    });
  } catch (error) {
    console.error('Error in /api/admin/guestly/retry-all:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
