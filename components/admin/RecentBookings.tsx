import { Badge } from '@/components/ui';
import { format } from 'date-fns';

interface Booking {
  id: string;
  booking_reference: string;
  guest_first_name: string;
  guest_last_name: string;
  check_in_date: string;
  status: string;
  total: number | string;
  properties?: {
    name: string;
    address: string;
  };
}

interface RecentBookingsProps {
  bookings: Booking[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  if (bookings.length === 0) {
    return <p className="text-neutral-500">No bookings yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-3 px-4">Reference</th>
            <th className="text-left py-3 px-4">Guest</th>
            <th className="text-left py-3 px-4">Property</th>
            <th className="text-left py-3 px-4">Check-in</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-neutral-100 hover:bg-neutral-50">
              <td className="py-3 px-4 font-mono text-sm">{booking.booking_reference}</td>
              <td className="py-3 px-4">{booking.guest_first_name} {booking.guest_last_name}</td>
              <td className="py-3 px-4">{booking.properties?.name}</td>
              <td className="py-3 px-4">{format(new Date(booking.check_in_date), 'MMM dd, yyyy')}</td>
              <td className="py-3 px-4">
                <Badge variant={booking.status === 'confirmed' ? 'success' : 'default'}>
                  {booking.status}
                </Badge>
              </td>
              <td className="py-3 px-4">€{Number(booking.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
