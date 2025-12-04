import { Badge } from '@/components/ui';
import { format } from 'date-fns';

interface Booking {
  id: string;
  booking_reference: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  payment_status: string;
  total: number | string;
  properties?: {
    name: string;
    address: string;
  };
}

interface BookingsTableProps {
  bookings: Booking[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 text-lg">No bookings found</p>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            <th className="text-left py-3 px-4 font-semibold">Reference</th>
            <th className="text-left py-3 px-4 font-semibold">Guest</th>
            <th className="text-left py-3 px-4 font-semibold">Email</th>
            <th className="text-left py-3 px-4 font-semibold">Property</th>
            <th className="text-left py-3 px-4 font-semibold">Check-in</th>
            <th className="text-left py-3 px-4 font-semibold">Check-out</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
            <th className="text-left py-3 px-4 font-semibold">Payment</th>
            <th className="text-left py-3 px-4 font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
              <td className="py-3 px-4 font-mono text-sm">{booking.booking_reference}</td>
              <td className="py-3 px-4">{booking.guest_first_name} {booking.guest_last_name}</td>
              <td className="py-3 px-4 text-sm text-neutral-600">{booking.guest_email}</td>
              <td className="py-3 px-4">{booking.properties?.name}</td>
              <td className="py-3 px-4">{format(new Date(booking.check_in_date), 'MMM dd, yyyy')}</td>
              <td className="py-3 px-4">{format(new Date(booking.check_out_date), 'MMM dd, yyyy')}</td>
              <td className="py-3 px-4">
                <Badge variant={getStatusVariant(booking.status)}>
                  {booking.status}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant={getPaymentStatusVariant(booking.payment_status)}>
                  {booking.payment_status}
                </Badge>
              </td>
              <td className="py-3 px-4 font-semibold">€{Number(booking.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
