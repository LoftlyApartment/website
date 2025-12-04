'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, ExclamationIcon, ClockIcon, RefreshIcon } from '@/components/ui/Icons';

type SyncStatus = 'synced' | 'failed' | 'pending';

interface SyncLog {
  id: string;
  booking_reference: string;
  guestly_reservation_id: string | null;
  guestly_sync_status: SyncStatus | null;
  guestly_sync_error: string | null;
  guestly_sync_attempts: number | null;
  guestly_synced_at: string | null;
  created_at: string;
  guest_email: string;
  check_in_date: string;
  property_name: string;
}

interface SyncLogsProps {
  initialLogs?: SyncLog[];
}

export function GuestlySyncLogs({ initialLogs = [] }: SyncLogsProps) {
  const [logs, setLogs] = useState<SyncLog[]>(initialLogs);
  const [filter, setFilter] = useState<'all' | SyncStatus>('all');
  const [loading, setLoading] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async (currentPage: number = 1, currentFilter: string = 'all') => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/guestly/logs?page=${currentPage}&filter=${currentFilter}&limit=20`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();

      if (currentPage === 1) {
        setLogs(data.logs);
      } else {
        setLogs(prev => [...prev, ...data.logs]);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: 'all' | SyncStatus) => {
    setFilter(newFilter);
    setPage(1);
    fetchLogs(1, newFilter);
  };

  const handleRetry = async (bookingId: string) => {
    setRetryingId(bookingId);
    try {
      const response = await fetch('/api/admin/guestly/retry-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to retry sync');
      }

      // Refresh logs after retry
      await fetchLogs(1, filter);
    } catch (err) {
      console.error('Error retrying sync:', err);
      alert('Failed to retry sync. Please try again.');
    } finally {
      setRetryingId(null);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage, filter);
  };

  useEffect(() => {
    if (initialLogs.length === 0) {
      fetchLogs(1, filter);
    }
  }, []);

  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case 'synced':
        return <CheckIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <ExclamationIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: SyncStatus) => {
    const styles = {
      synced: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.guestly_sync_status === filter && log.guestly_sync_status !== null);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">
            Sync Logs
          </h2>
          <button
            onClick={() => fetchLogs(1, filter)}
            disabled={loading}
            className="text-neutral-500 hover:text-neutral-700 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-neutral-800 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('synced')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'synced'
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Synced
          </button>
          <button
            onClick={() => handleFilterChange('failed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Failed
          </button>
          <button
            onClick={() => handleFilterChange('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Booking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Guestly ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Error
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Last Sync
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">
                  {loading ? 'Loading logs...' : 'No sync logs found'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">
                        {log.booking_reference}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {log.guest_email}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        Check-in: {new Date(log.check_in_date).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900 max-w-xs truncate">
                      {log.property_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.guestly_sync_status ? getStatusBadge(log.guestly_sync_status) : <span className="text-xs text-neutral-400">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.guestly_reservation_id ? (
                      <span className="text-xs font-mono text-neutral-600">
                        {log.guestly_reservation_id.substring(0, 8)}...
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {log.guestly_sync_error ? (
                      <div className="text-xs text-red-600 max-w-xs truncate" title={log.guestly_sync_error}>
                        {log.guestly_sync_error}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${
                      (log.guestly_sync_attempts ?? 0) > 2 ? 'text-red-600 font-semibold' : 'text-neutral-600'
                    }`}>
                      {log.guestly_sync_attempts ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.guestly_synced_at ? (
                      <div className="text-xs text-neutral-600">
                        {new Date(log.guestly_synced_at).toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {log.guestly_sync_status === 'failed' && (
                        <button
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {retryingId === log.id ? 'Retrying...' : 'Retry'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && !loading && filteredLogs.length > 0 && (
        <div className="p-4 border-t border-neutral-200 text-center">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
