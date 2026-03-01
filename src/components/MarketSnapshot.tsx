import React from 'react';
import { PieChart, Info } from 'lucide-react';

export default function MarketSnapshot() {
  return (
    <div className="space-y-6">
      <div className="bg-card-dark p-6 rounded-2xl border border-border-dark shadow-sm">
        <h3 className="font-bold mb-6 flex items-center gap-2">
          <PieChart className="text-blue-500" size={20} />
          Market Snapshot
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider mb-2">
              <span className="text-slate-500">Up / Down Ratio</span>
              <span className="font-mono text-slate-300">33% / 63%</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
              <div className="bg-emerald-500" style={{ width: '33%' }}></div>
              <div className="bg-red-500" style={{ width: '63%' }}></div>
              <div className="bg-slate-600" style={{ width: '4%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider mb-2">
              <span className="text-slate-500">NearHigh / NearLow</span>
              <span className="font-mono text-slate-300">10% / 47%</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
              <div className="bg-blue-500" style={{ width: '10%' }}></div>
              <div className="bg-orange-500" style={{ width: '47%' }}></div>
              <div className="flex-1"></div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border-dark space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Up &gt; 1% count:</span>
              <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">4</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Down &lt; -1% count:</span>
              <span className="text-xs font-mono px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20">12</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card-dark p-6 rounded-2xl border border-border-dark shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Info className="text-yellow-500" size={18} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">MSI (Simple)</span>
        </div>
        
        <div className="p-3 bg-slate-800/50 rounded-lg text-center mb-6 border border-border-dark">
          <span className="text-lg font-bold tracking-[0.3em] text-slate-200">DISTRIBUTION</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Weighted Up Share:</span>
            <span className="font-mono text-sm text-slate-300">0.40</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Weighted Down Share:</span>
            <span className="font-mono text-sm text-slate-300">0.58</span>
          </div>
          <div className="pt-3 border-t border-border-dark">
            <div className="flex justify-between items-center text-blue-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Heavyweights vs Rest:</span>
              <span className="font-mono font-bold text-sm">0.24 / -0.51</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
