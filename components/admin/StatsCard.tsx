import { CalendarIcon, CheckIcon, DollarIcon, BuildingIcon } from '@/components/ui/Icons';

const icons = {
  calendar: CalendarIcon,
  check: CheckIcon,
  dollar: DollarIcon,
  building: BuildingIcon,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof icons;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  const Icon = icons[icon];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neutral-600 text-sm font-medium">{title}</h3>
        <Icon className="w-6 h-6 text-primary-500" />
      </div>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}
