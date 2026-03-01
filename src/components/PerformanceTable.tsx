import React from 'react';
import { Scale, ArrowUp, ArrowDown, MoveUp, MoveDown, CircleDot } from 'lucide-react';

const metrics = [
  { name: 'WeightedMove (sum)', value: '-0.27', trend: 'down', color: 'text-red-500' },
  { name: 'Weighted range-pos (sum w*pos)', value: '0.35', trend: 'up', color: 'text-emerald-500' },
  { name: 'Bank WeightedMove', value: '-0.30', trend: 'down', color: 'text-red-500' },
  { name: 'Heavyweights WeightedMove', value: '0.24', trend: 'up', color: 'text-emerald-500' },
  { name: 'Non-Heavyweights WeightedMove', value: '-0.51', trend: 'down', color: 'text-red-500' },
  { name: 'Bank Share of TotalMove', value: '1.11', trend: 'neutral', color: 'text-slate-100' },
];

export default function PerformanceTable() {
  return (
    <div className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border-dark flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Scale className="text-blue-500" size={20} />
          Weighted Performance Metrics
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase text-slate-500 bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 font-medium tracking-wider">Metric Description</th>
              <th className="px-6 py-3 font-medium text-right tracking-wider">Value</th>
              <th className="px-6 py-3 font-medium text-center tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {metrics.map((metric) => (
              <tr key={metric.name} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-300">{metric.name}</td>
                <td className={`px-6 py-4 text-right font-mono ${metric.color}`}>{metric.value}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    {metric.trend === 'up' && <MoveUp className="text-emerald-500" size={14} />}
                    {metric.trend === 'down' && <MoveDown className="text-red-500" size={14} />}
                    {metric.trend === 'neutral' && <CircleDot className="text-slate-500" size={14} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
