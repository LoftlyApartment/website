'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@/components/ui/Icons';

interface FAQAccordionProps {
  question: string;
  answer: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-primary-600 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-neutral-900 pr-8">
          {question}
        </span>
        <ChevronDownIcon
          size={24}
          className={`flex-shrink-0 text-neutral-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-neutral-700 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};
