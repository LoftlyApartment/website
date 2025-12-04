'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, ExclamationIcon, RefreshIcon, ChevronDownIcon } from '@/components/ui/Icons';

interface WebhookLog {
  id: string;
  event_type: string;
  event_id: string;
  status: 'received' | 'processing' | 'success' | 'failed';
  error: string | null;
  payload: any;
  created_at: string;
}

export function GuestlyWebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async (currentPage: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      if (filterEventType !== 'all') {
        params.append('eventType', filterEventType);
      }

      const response = await fetch(`/api/admin/guestly/webhook-logs?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch webhook logs');
      }

      const data = await response.json();

      if (currentPage === 1) {
        setLogs(data.logs);
      } else {
        setLogs(prev => [...prev, ...data.logs]);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Error fetching webhook logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchLogs(1);
  }, [filterStatus, filterEventType]);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  const eventTypes = Array.from(new Set(logs.map(log => log.event_type)));

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">
            Webhook Logs
          </h2>
          <button
            onClick={() => fetchLogs(1)}
            disabled={loading}
            className="text-neutral-500 hover:text-neutral-700 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Event Type
            </label>
            <select
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Event ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Error
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  {loading ? 'Loading webhook logs...' : 'No webhook logs found'}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <>
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-neutral-900">
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-neutral-600">
                        {log.event_id.substring(0, 12)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckIcon className="w-4 h-4" />
                          Success
                        </span>
                      ) : log.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <ExclamationIcon className="w-4 h-4" />
                          Failed
                        </span>
                      ) : log.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                          Received
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.error ? (
                        <div className="text-xs text-red-600 max-w-xs truncate" title={log.error}>
                          {log.error}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-neutral-600">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleExpanded(log.id)}
                        className="text-xs px-3 py-1 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 transition-colors inline-flex items-center gap-1"
                      >
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-transform ${
                            expandedId === log.id ? 'rotate-180' : ''
                          }`}
                        />
                        {expandedId === log.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-neutral-50">
                        <div className="border border-neutral-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-neutral-900 mb-2">
                            Event Payload
                          </h4>
                          <pre className="text-xs bg-white p-3 rounded border border-neutral-300 overflow-x-auto max-h-96 overflow-y-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && !loading && logs.length > 0 && (
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
