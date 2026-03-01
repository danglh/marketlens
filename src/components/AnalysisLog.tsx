import React from 'react';
import { History } from 'lucide-react';

const logs = [
  { time: '10:45:01', type: 'danger', message: 'Down < -1% count peaked at 12 assets. Distribution Phase confirmed.' },
  { time: '10:42:15', type: 'success', message: 'Heavyweights show resilience vs market rest (0.24 vs -0.51).' },
  { time: '10:40:00', type: 'neutral', message: 'System started tracking session metrics for 29 total assets.' },
];

export default function AnalysisLog() {
  return (
    <div className="bg-card-dark rounded-2xl border border-border-dark p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <History className="text-slate-500" size={20} />
          Analysis Log
        </h3>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Updated: Oct 24, 10:45:02 AM</span>
      </div>
      
      <div className="space-y-1">
        {logs.map((log, idx) => (
          <div 
            key={idx} 
            className={`text-sm py-2.5 flex gap-4 ${idx !== logs.length - 1 ? 'border-b border-slate-800' : ''}`}
          >
            <span className="text-slate-500 font-mono text-xs whitespace-nowrap pt-0.5">{log.time}</span>
            <p className="text-slate-300 leading-relaxed">
              {log.type === 'danger' && <span className="text-red-500 font-semibold">Down &lt; -1% count</span>}
              {log.type === 'success' && <span className="text-emerald-500 font-semibold">Heavyweights</span>}
              {' '}
              {log.message.replace('Down < -1% count', '').replace('Heavyweights', '')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
