import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Layers, 
  CircleDot, 
  BarChart3, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

const HealthCard = ({ title, value, subLabel, status, statusColor, icon: Icon, progress, progressColor }: any) => (
  <div className="bg-card-dark p-6 rounded-2xl border border-border-dark shadow-sm relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
      <Icon className="text-blue-500/50" size={20} />
    </div>
    <div className="flex flex-col">
      <span className="text-5xl font-bold tracking-tight mb-4 tabular-nums">{value}</span>
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">{subLabel}</span>
          <span className={`text-sm font-bold ${statusColor}`}>{status}</span>
        </div>
      </div>
    </div>
    <div className="mt-4 bg-slate-800 h-1.5 rounded-full overflow-hidden">
      <div className={`${progressColor} h-full transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

const MetricItem = ({ label, value, progress, progressColor }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px]">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-300 tabular-nums">{value}</span>
    </div>
    <div className="bg-slate-800 h-1 rounded-full overflow-hidden">
      <div className={`${progressColor} h-full transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

export default function MarketHealth() {
  const [data, setData] = useState({
    msiScore: 41.00,
    composite: 37.00,
    breadthScore: 35.00,
    weightedBreadth: 40.00,
    influenceConcentration: 57.00,
    top3Share: 43.00,
    heavyweightInfl: 50.00,
    bankShare: 26.00,
    rotationDelta: 40.02,
    top3Prop: 0.28,
    top3Infl: 0.68,
    distortion: 57.49,
    indexDependencyRisk: 11
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        msiScore: Math.max(0, Math.min(100, prev.msiScore + (Math.random() - 0.5) * 2)),
        composite: Math.max(0, Math.min(100, prev.composite + (Math.random() - 0.5) * 1.5)),
        breadthScore: Math.max(0, Math.min(100, prev.breadthScore + (Math.random() - 0.5) * 2.5)),
        weightedBreadth: Math.max(0, Math.min(100, prev.weightedBreadth + (Math.random() - 0.5) * 1.2)),
        influenceConcentration: Math.max(0, Math.min(100, prev.influenceConcentration + (Math.random() - 0.5) * 0.8)),
        top3Share: Math.max(0, Math.min(100, prev.top3Share + (Math.random() - 0.5) * 1.1)),
        heavyweightInfl: Math.max(0, Math.min(100, prev.heavyweightInfl + (Math.random() - 0.5) * 0.9)),
        bankShare: Math.max(0, Math.min(100, prev.bankShare + (Math.random() - 0.5) * 1.4)),
        rotationDelta: Math.max(0, Math.min(100, prev.rotationDelta + (Math.random() - 0.5) * 2.0)),
        top3Prop: Math.max(0, Math.min(1, prev.top3Prop + (Math.random() - 0.5) * 0.02)),
        top3Infl: Math.max(0, Math.min(1, prev.top3Infl + (Math.random() - 0.5) * 0.03)),
        distortion: Math.max(0, Math.min(100, prev.distortion + (Math.random() - 0.5) * 1.8)),
        indexDependencyRisk: Math.max(0, Math.min(100, Math.round(prev.indexDependencyRisk + (Math.random() - 0.5) * 3)))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Health</h1>
          <p className="text-slate-500 text-sm mt-1">Holistic overview of market vitality and structural integrity.</p>
        </div>
      </div>

      {/* Top Row: Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthCard 
          title="MSI SCORE"
          value={data.msiScore.toFixed(2)}
          subLabel="Benchmark: 50"
          status={data.msiScore < 50 ? "Underperforming" : "Outperforming"}
          statusColor={data.msiScore < 50 ? "text-red-400" : "text-emerald-400"}
          icon={HeartPulse}
          progress={data.msiScore}
          progressColor="bg-blue-600"
        />
        <HealthCard 
          title="COMPOSITE"
          value={data.composite.toFixed(2)}
          subLabel="Status"
          status={data.composite < 40 ? "Weakening" : "Strengthening"}
          statusColor={data.composite < 40 ? "text-orange-400" : "text-blue-400"}
          icon={Layers}
          progress={data.composite}
          progressColor="bg-orange-500"
        />
        <HealthCard 
          title="BREADTH SCORE"
          value={data.breadthScore.toFixed(2)}
          subLabel="Participation"
          status={data.breadthScore < 40 ? "Low" : "High"}
          statusColor={data.breadthScore < 40 ? "text-slate-400" : "text-emerald-400"}
          icon={CircleDot}
          progress={data.breadthScore}
          progressColor="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Index Control Metrics */}
        <div className="bg-card-dark p-8 rounded-2xl border border-border-dark shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="text-blue-500" size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Index Control Metrics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-12">
            <MetricItem label="Weighted Breadth" value={data.weightedBreadth.toFixed(2)} progress={data.weightedBreadth} progressColor="bg-blue-500" />
            <MetricItem label="Influence Concentration" value={data.influenceConcentration.toFixed(2)} progress={data.influenceConcentration} progressColor="bg-orange-500" />
            <MetricItem label="Top3 Share" value={data.top3Share.toFixed(2)} progress={data.top3Share} progressColor="bg-blue-400" />
            <MetricItem label="Heavyweight Infl." value={data.heavyweightInfl.toFixed(2)} progress={data.heavyweightInfl} progressColor="bg-purple-500" />
            <MetricItem label="Bank Share" value={data.bankShare.toFixed(2)} progress={data.bankShare} progressColor="bg-slate-500" />
            <MetricItem label="Rotation Delta" value={data.rotationDelta.toFixed(2)} progress={data.rotationDelta} progressColor="bg-emerald-500" />
          </div>

          <div className="border-t border-slate-800 pt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Top3 Prop.</p>
              <p className="text-2xl font-bold tabular-nums">{data.top3Prop.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Top3 %Infl.</p>
              <p className="text-2xl font-bold tabular-nums">{data.top3Infl.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Distortion</p>
              <p className="text-2xl font-bold tabular-nums">{data.distortion.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Risk & Event Probability */}
        <div className="bg-card-dark p-8 rounded-2xl border border-border-dark shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <AlertTriangle className="text-orange-500" size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Risk & Event Probability</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {['BULLTRAP', 'WASHOUT', 'SQUEEZE'].map(risk => (
              <div key={risk} className="bg-slate-800/30 border border-border-dark p-4 rounded-xl text-center">
                <p className="text-[9px] text-slate-500 uppercase mb-1">{risk}</p>
                <p className="text-sm font-bold text-emerald-500">LOW</p>
              </div>
            ))}
          </div>

          <div className="space-y-6 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Regime Status</span>
              <span className="text-xs font-bold px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">DISTRIBUTION</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Market Structure</span>
              <span className="text-xs font-bold px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 uppercase">Risk-off</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Risk Flag</span>
              <span className="text-sm font-medium text-slate-200">Risk contained</span>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-800/30 rounded-2xl border border-border-dark">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Index Dependency Risk</span>
              <span className="font-mono text-sm text-red-400 tabular-nums">{data.indexDependencyRisk} / 100</span>
            </div>
            <div className="bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full transition-all duration-1000 ease-out" style={{ width: `${data.indexDependencyRisk}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/40 border border-border-dark p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Final Verdict</span>
          </div>
          <p className="text-xl font-bold text-slate-100 tracking-tight">
            DISTRIBUTION | Risk-off
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-orange-600/10 border border-orange-600/20 p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-400 font-bold text-xs uppercase tracking-widest">Action Bias</span>
          </div>
          <p className="text-xl font-bold text-slate-100 tracking-tight mb-1">
            WAIT CONFIRMATION
          </p>
          <p className="text-xs text-slate-500 italic">WHY: Participation not strong enough for conviction.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/40 border border-border-dark p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Preferred Setup</span>
          </div>
          <p className="text-xl font-bold text-slate-100 tracking-tight">
            WAIT / OBSERVE
          </p>
        </motion.div>
      </div>
    </div>
  );
}
