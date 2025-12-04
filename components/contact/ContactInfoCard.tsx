import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface ContactInfoCardProps {
  icon: React.ReactNode;
  title: string;
  line1: string;
  line2?: string;
  line3?: string;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  icon,
  title,
  line1,
  line2,
  line3,
}) => {
  return (
    <Card variant="elevated" padding="lg" hover className="text-center h-full">
      <CardContent>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-3">
          {title}
        </h3>
        <div className="space-y-1">
          <p className="text-neutral-700">{line1}</p>
          {line2 && <p className="text-neutral-600 text-sm">{line2}</p>}
          {line3 && <p className="text-neutral-600 text-sm">{line3}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
