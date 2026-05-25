'use client';
import { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

const TABS = [
  { id: 'projects',   label: 'Projects' },
  { id: 'operations', label: 'Operations' },
  { id: 'asset',      label: 'Asset' },
  { id: 'product',    label: 'Product' },
  { id: 'sales',      label: 'Sales' },
];

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const [search, setSearch] = useState('');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center gap-4 px-6">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#1a2744] text-white">
            <span className="text-xs font-bold tracking-tight">SC</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">Showcase Dashboard</span>
        </div>

        {/* Tab Switcher */}
        <nav className="flex items-center gap-1 ml-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1a2744] text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Global Search */}
        <div className="relative hidden w-72 sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, incidents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1a2744] focus:outline-none focus:ring-1 focus:ring-[#1a2744]"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500" />
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
          <div className="flex size-7 items-center justify-center rounded-full bg-[#1a2744] text-xs font-semibold text-white">
            J
          </div>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">Jordan</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}
