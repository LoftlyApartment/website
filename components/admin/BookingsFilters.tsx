'use client';

import { Select } from '@/components/ui';

export function BookingsFilters() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Status"
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'pending', label: 'Pending' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          defaultValue="all"
        />

        <Select
          label="Payment Status"
          options={[
            { value: 'all', label: 'All Payment Statuses' },
            { value: 'completed', label: 'Completed' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
          ]}
          defaultValue="all"
        />

        <Select
          label="Sort By"
          options={[
            { value: 'recent', label: 'Most Recent' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'checkin', label: 'Check-in Date' },
            { value: 'amount', label: 'Amount (High to Low)' },
          ]}
          defaultValue="recent"
        />
      </div>
    </div>
  );
}
