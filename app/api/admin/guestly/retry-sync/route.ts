import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { retryFailedSync } from '@/lib/guestly/sync';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing bookingId' },
        { status: 400 }
      );
    }

    // Retry the sync
    const result = await retryFailedSync(bookingId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        reservationId: result.reservationId,
        message: 'Sync retry successful',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Sync retry failed',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in /api/admin/guestly/retry-sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
