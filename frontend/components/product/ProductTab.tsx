'use client';
import { Construction } from 'lucide-react';

export default function ProductTab() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-24 text-center">
      <Construction size={32} className="mb-3 text-slate-300" />
      <p className="text-sm font-medium text-slate-500">Product Tab</p>
      <p className="mt-1 text-xs text-slate-400">Feature Requests · Roadmap · Releases · Wiki</p>
      <p className="mt-3 text-xs text-slate-300">Coming soon</p>
    </div>
  );
}
