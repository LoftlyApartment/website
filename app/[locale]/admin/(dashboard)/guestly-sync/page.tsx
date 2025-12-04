import { createClient } from '@/lib/supabase/server';
import { GuestlySyncLogs } from '@/components/admin/GuestlySyncLogs';
import { GuestlyWebhookLogs } from '@/components/admin/GuestlyWebhookLogs';
import { CheckIcon, ExclamationIcon, ClockIcon } from '@/components/ui/Icons';
import type { GuestlySyncStatus } from '@/types/database';

export default async function GuestlySyncPage() {
  const supabase = await createClient();

  // Get sync statistics
  const { data: bookings } = await supabase
    .from('bookings')
    .select('guestly_sync_status');

  type BookingWithSyncStatus = {
    guestly_sync_status: GuestlySyncStatus | null;
  };

  const typedBookings = (bookings || []) as BookingWithSyncStatus[];

  const syncStats = {
    total: typedBookings.length,
    synced: typedBookings.filter(b => b.guestly_sync_status === 'synced').length,
    failed: typedBookings.filter(b => b.guestly_sync_status === 'failed').length,
    pending: typedBookings.filter(b => b.guestly_sync_status === 'pending').length,
  };

  // Get initial logs
  const { data: initialLogs } = await supabase
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
    `)
    .order('created_at', { ascending: false })
    .limit(20);

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

  const typedLogs = (initialLogs || []) as BookingLog[];

  const transformedLogs = typedLogs.map(log => ({
    ...log,
    property_name: log.properties?.name || 'Unknown Property',
  }));

  // Check if Guestly sync is enabled
  const syncEnabled = process.env.GUESTLY_SYNC_ENABLED === 'true';
  const testMode = process.env.GUESTLY_TEST_MODE === 'true';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Guestly Sync Management</h1>
          <p className="text-neutral-600 mt-1">
            Monitor and manage booking synchronization with Guestly
          </p>
        </div>
        <div className="flex gap-2">
          {syncEnabled ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                Sync Enabled {testMode && '(Test Mode)'}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg border border-red-200">
              <ExclamationIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Sync Disabled</span>
            </span>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 font-medium">Total Bookings</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">{syncStats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Synced</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{syncStats.synced}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {syncStats.total > 0
                  ? `${((syncStats.synced / syncStats.total) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
            <CheckIcon className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Failed</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{syncStats.failed}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {syncStats.total > 0
                  ? `${((syncStats.failed / syncStats.total) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
            <ExclamationIcon className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{syncStats.pending}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {syncStats.total > 0
                  ? `${((syncStats.pending / syncStats.total) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
            <ClockIcon className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Configuration Info */}
      {!syncEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">Sync Disabled</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Guestly sync is currently disabled. To enable it, set <code className="bg-yellow-100 px-1 rounded">GUESTLY_SYNC_ENABLED=true</code> in your environment variables.
              </p>
            </div>
          </div>
        </div>
      )}

      {testMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Test Mode Active</h3>
              <p className="text-sm text-blue-700 mt-1">
                Sync is running in test mode. API calls are simulated and logged without actually creating reservations in Guestly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sync Logs */}
      <GuestlySyncLogs initialLogs={transformedLogs} />

      {/* Webhook Logs */}
      <GuestlyWebhookLogs />
    </div>
  );
}
