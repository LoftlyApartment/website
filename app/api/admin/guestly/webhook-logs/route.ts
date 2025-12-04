import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const status = searchParams.get('status');
    const eventType = searchParams.get('eventType');

    const offset = (page - 1) * limit;

    // Filter for Guestly webhooks only
    const source = 'guestly';

    // Build query
    let query = supabase
      .from('webhook_logs')
      .select('*', { count: 'exact' })
      .eq('source', source);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (eventType && eventType !== 'all') {
      query = query.eq('event_type', eventType);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: logs, error: logsError, count } = await query;

    if (logsError) {
      console.error('Error fetching webhook logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch webhook logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      logs: logs || [],
      hasMore: count ? offset + limit < count : false,
      total: count || 0,
    });
  } catch (error) {
    console.error('Error in /api/admin/guestly/webhook-logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
