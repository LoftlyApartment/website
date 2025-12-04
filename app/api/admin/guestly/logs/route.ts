import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GuestlySyncStatus } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const filter = searchParams.get('filter') || 'all';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        guestly_reservation_id,
        guestly_sync_status,
        guestly_sync_error,
        guestly_sync_attempts,
        guestly_synced_at,
        created_at,
        guest_email,
        check_in_date,
        properties (name)
      `, { count: 'exact' });

    // Apply filter
    if (filter !== 'all') {
      query = query.eq('guestly_sync_status', filter);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: logs, error: logsError, count } = await query;

    if (logsError) {
      console.error('Error fetching sync logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Define type for logs
    type BookingLog = {
      id: string;
      booking_reference: string;
      guestly_reservation_id: string | null;
      guestly_sync_status: GuestlySyncStatus | null;
      guestly_sync_error: string | null;
      guestly_sync_attempts: number | null;
      guestly_synced_at: string | null;
      created_at: string;
      guest_email: string;
      check_in_date: string;
      properties: { name: string } | null;
    };

    const typedLogs = (logs || []) as BookingLog[];

    // Transform data to include property name
    const transformedLogs = typedLogs.map(log => ({
      ...log,
      property_name: log.properties?.name || 'Unknown Property',
    }));

    return NextResponse.json({
      logs: transformedLogs,
      hasMore: count ? offset + limit < count : false,
      total: count || 0,
    });
  } catch (error) {
    console.error('Error in /api/admin/guestly/logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
