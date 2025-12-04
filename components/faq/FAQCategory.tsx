import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface FAQCategoryProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const FAQCategory: React.FC<FAQCategoryProps> = ({ title, icon, children }) => {
  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white">
          {title}
        </h3>
      </div>
      <CardContent className="p-6">
        <div className="space-y-0">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
