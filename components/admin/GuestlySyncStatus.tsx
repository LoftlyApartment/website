'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshIcon, ExclamationIcon, CheckIcon, ClockIcon } from '@/components/ui/Icons';

interface SyncStats {
  totalSynced: number;
  failedSyncs: number;
  pendingSyncs: number;
  lastSyncTime: string | null;
  successRate: number;
  recentFailures: Array<{
    id: string;
    booking_reference: string;
    error: string;
    created_at: string;
  }>;
}

export function GuestlySyncStatus() {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/guestly/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch sync stats');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
      console.error('Error fetching sync stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const retryFailedSyncs = async () => {
    if (!stats || stats.failedSyncs === 0) return;

    setRetrying(true);
    try {
      const response = await fetch('/api/admin/guestly/retry-all', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to retry syncs');
      }

      // Refresh stats after retry
      await fetchStats();
    } catch (err) {
      console.error('Error retrying syncs:', err);
      alert('Failed to retry syncs. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start">
          <ExclamationIcon className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">
              Error Loading Sync Status
            </h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchStats}
              className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const hasFailures = stats.failedSyncs > 0;
  const hasPending = stats.pendingSyncs > 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Guestly Sync Status
        </h2>
        <button
          onClick={fetchStats}
          className="text-neutral-500 hover:text-neutral-700 transition-colors"
          title="Refresh"
        >
          <RefreshIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Synced */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Synced</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalSynced}</p>
            </div>
            <CheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Failed Syncs */}
        <div className={`p-4 rounded-lg border ${
          hasFailures
            ? 'bg-red-50 border-red-200'
            : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                hasFailures ? 'text-red-600' : 'text-neutral-600'
              }`}>
                Failed
              </p>
              <p className={`text-2xl font-bold ${
                hasFailures ? 'text-red-900' : 'text-neutral-900'
              }`}>
                {stats.failedSyncs}
              </p>
            </div>
            <ExclamationIcon className={`w-8 h-8 ${
              hasFailures ? 'text-red-500' : 'text-neutral-400'
            }`} />
          </div>
        </div>

        {/* Pending Syncs */}
        <div className={`p-4 rounded-lg border ${
          hasPending
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                hasPending ? 'text-yellow-600' : 'text-neutral-600'
              }`}>
                Pending
              </p>
              <p className={`text-2xl font-bold ${
                hasPending ? 'text-yellow-900' : 'text-neutral-900'
              }`}>
                {stats.pendingSyncs}
              </p>
            </div>
            <ClockIcon className={`w-8 h-8 ${
              hasPending ? 'text-yellow-500' : 'text-neutral-400'
            }`} />
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-700">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Sync Time */}
      {stats.lastSyncTime && (
        <div className="mb-6 p-3 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-600">
            <span className="font-medium">Last successful sync:</span>{' '}
            {new Date(stats.lastSyncTime).toLocaleString()}
          </p>
        </div>
      )}

      {/* Recent Failures */}
      {stats.recentFailures.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
            Recent Failed Syncs
          </h3>
          <div className="space-y-2">
            {stats.recentFailures.slice(0, 3).map((failure) => (
              <div
                key={failure.id}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-900">
                      {failure.booking_reference}
                    </p>
                    <p className="text-xs text-red-700 mt-1 truncate">
                      {failure.error}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {new Date(failure.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {hasFailures && (
          <button
            onClick={retryFailedSyncs}
            disabled={retrying}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {retrying ? 'Retrying...' : `Retry Failed Syncs (${stats.failedSyncs})`}
          </button>
        )}
        <Link
          href="/en/admin/guestly-sync"
          className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 transition-colors text-sm font-medium"
        >
          View All Sync Logs
        </Link>
      </div>
    </div>
  );
}
