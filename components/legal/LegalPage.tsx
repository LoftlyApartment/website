'use client';

import { ReactNode } from 'react';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
  tableOfContents?: Array<{
    id: string;
    title: string;
  }>;
}

export function LegalPage({ title, lastUpdated, children, tableOfContents }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">
            {title}
          </h1>
          <p className="text-sm text-neutral-600">
            Letzte Aktualisierung: {lastUpdated}
          </p>
        </div>

        {/* Table of Contents */}
        {tableOfContents && tableOfContents.length > 0 && (
          <div className="mb-12 p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Inhaltsverzeichnis</h2>
            <nav className="space-y-2">
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-neutral-700 hover:text-blue-600 transition-colors"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 print:shadow-none print:border-0">
          <div className="prose prose-neutral max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-8 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Diese Seite drucken
          </button>
        </div>
      </div>
    </div>
  );
}

interface LegalSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="mb-8 scroll-mt-8">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">
        {title}
      </h2>
      <div className="space-y-4 text-neutral-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
