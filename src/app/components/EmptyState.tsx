import React from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg border border-slate-200">
      <div className="mb-4 text-slate-400">
        {icon || <AlertCircle className="w-12 h-12" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-center max-w-sm">{description}</p>
    </div>
  );
}
