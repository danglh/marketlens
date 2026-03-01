import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 border-b border-border-dark flex items-center justify-between px-8 bg-background-dark/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            className="w-full bg-card-dark border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600 text-slate-100 placeholder:text-slate-500"
            placeholder="Search symbols, indices, metrics..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:bg-card-dark rounded-full transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="h-8 w-px bg-border-dark mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium">Alex Chen</p>
            <p className="text-[10px] text-slate-500">Pro Analyst</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
