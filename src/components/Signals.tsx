import React from 'react';
import { Zap, Activity, ShieldAlert, Waves, Target, ArrowUpCircle, ArrowDownCircle, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

const signalMetrics = [
  { label: 'MSI Score (Spot Context)', value: '41', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'BullTrapRisk (0-100)', value: '73', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10', percentage: 73 },
  { label: 'WashoutChance (0-100)', value: '49', icon: Waves, color: 'text-orange-400', bg: 'bg-orange-400/10', percentage: 49 },
  { label: 'SqueezeChance (0-100)', value: '11', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10', percentage: 11 },
];

const atcSignals = [
  { label: 'ATC Pull Up chance', value: 'Low', icon: ArrowUpCircle, color: 'text-slate-400' },
  { label: 'ATC Dump chance', value: 'High', icon: ArrowDownCircle, color: 'text-red-500' },
];

const scoreComponents = [
  { label: 'Breadth score', value: '35.00' },
  { label: 'NearHigh-Low score', value: '31.67' },
  { label: 'Trend score (weighted move)', value: '47.34' },
  { label: 'Distortion score (Heavyweights - Rest)', value: '57.49' },
  { label: 'Composite Score', value: '37', highlight: true },
  { label: 'State label', value: 'SIDEWAY / TRAP ZONE', highlight: true },
  { label: 'Bull-trap risk', value: 'LOW' },
  { label: 'Washout opportunity', value: 'LOW' },
  { label: 'Squeeze trigger watch', value: 'LOW' },
  { label: 'MSI Score vs Composite Score', value: 'Internal > Surface(Bull ẩn)' },
  { label: 'Composite Score Evaluation', value: 'Digest' },
  { label: 'Weighted Breadth score (0-100)', value: '40' },
  { label: 'Influence Concentration score', value: '57' },
];

export default function Signals() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Signals</h1>
          <p className="text-slate-500 text-sm mt-1">Advanced risk assessment and composite scoring models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {signalMetrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card-dark p-6 rounded-2xl border border-border-dark shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${metric.bg} rounded-lg ${metric.color}`}>
                <metric.icon size={20} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Signal</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">{metric.label}</p>
              <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
            </div>
            {metric.percentage !== undefined && (
              <div className="mt-4 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`${metric.color.replace('text-', 'bg-')} h-full`} 
                  style={{ width: `${metric.percentage}%` }}
                ></div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border-dark flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={20} />
              <h3 className="font-bold">Score Components (0-100)</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-border-dark">
                  {scoreComponents.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3.5 text-slate-400">{comp.label}</td>
                      <td className={`px-6 py-3.5 text-right font-mono ${comp.highlight ? 'text-blue-400 font-bold' : 'text-slate-200'}`}>
                        {comp.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card-dark p-6 rounded-2xl border border-border-dark shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} />
              ATC Probabilities
            </h3>
            <div className="space-y-4">
              {atcSignals.map((sig, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-border-dark">
                  <div className="flex items-center gap-3">
                    <sig.icon className={sig.color} size={20} />
                    <span className="text-sm text-slate-300">{sig.label}</span>
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-wider ${sig.value === 'High' ? 'text-red-500' : 'text-slate-500'}`}>
                    {sig.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-600/20 p-6 rounded-2xl">
            <h4 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wider">System Insight</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Composite score of <span className="text-blue-400 font-bold">37</span> indicates a <span className="text-slate-200">Sideway / Trap Zone</span>. 
              Bull-trap risk remains <span className="text-emerald-500 font-bold">LOW</span> despite the elevated risk score components.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
