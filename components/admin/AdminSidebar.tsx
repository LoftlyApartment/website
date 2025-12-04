'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  BuildingIcon,
  UserIcon,
  SettingsIcon,
  RefreshIcon
} from '@/components/ui/Icons';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarIcon },
  { name: 'Properties', href: '/admin/properties', icon: BuildingIcon },
  { name: 'Guests', href: '/admin/guests', icon: UserIcon },
  { name: 'Guestly Sync', href: '/admin/guestly-sync', icon: RefreshIcon },
  { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
];

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-neutral-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loftly Admin</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname === href;
          return (
            <Link
              key={item.name}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
