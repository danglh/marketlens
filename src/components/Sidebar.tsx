import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  LineChart,
  Zap,
  HeartPulse
} from 'lucide-react';

const navItems = [
  { id: 'market-health', icon: HeartPulse, label: 'Market Health' },
  { id: 'key-metrics', icon: LayoutDashboard, label: 'Key Metrics' },
  { id: 'signals', icon: Zap, label: 'Signals' },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border-dark flex flex-col bg-background-dark shrink-0 h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
          <LineChart size={20} />
        </div>
        <span className="font-bold text-lg tracking-tight">MarketLens</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600/10 text-blue-500 font-medium' 
                : 'text-slate-400 hover:bg-card-dark hover:text-slate-100'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
        
        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          System
        </div>
        
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-card-dark hover:text-slate-100 transition-colors"
        >
          <Settings size={18} />
          Settings
        </a>
      </nav>
      

    </aside>
  );
}
