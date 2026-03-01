import React, { useEffect, useState } from 'react';
import {
  HeartPulse,
  Layers,
  CircleDot,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getMarketHealth, MarketHealthPayload } from '../lib/dashboardApi';

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

const fallbackData: MarketHealthPayload = {
  snapshotId: 0,
  capturedAt: '',
  msiScore: 41,
  composite: 37,
  breadthScore: 35,
  distortion: 57.49222742654278,
  weightedBreadth: 40,
  influenceConcentration: 57,
  top3Share: 43,
  topHeavyweightInfluenceShare: 50,
  bankShare: 26,
  top3ProportionShare: 0.279833,
  top3InfluenceShare: 0.68,
  rotationDelta: 40.0167,
  indexDependencyRisk: 11,
  bulltrap: 'LOW',
  washout: 'LOW',
  squeeze: 'LOW',
  regime: 'DISTRIBUTION',
  structure: 'Risk-off',
  riskFlag: 'Risk contained',
  finalVerdict: 'DISTRIBUTION | Risk-off | Risk contained | WAIT CONFIRMATION',
  actionBias: 'WAIT CONFIRMATION',
  actionWhy: 'WHY: Participation not strong / low dependency / top3 too dominant',
  preferredSetup: 'WAIT / OBSERVE',
};

export default function MarketHealth() {
  const [data, setData] = useState<MarketHealthPayload>(fallbackData);

  const n = (value: unknown, fallback = 0) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;

  const f2 = (value: unknown) => n(value).toFixed(2);

  useEffect(() => {
    getMarketHealth().then(setData).catch(() => setData(fallbackData));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Health</h1>
          <p className="text-slate-500 text-sm mt-1">Holistic overview of market vitality and structural integrity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthCard
          title="MSI SCORE"
          value={f2(data.msiScore)}
          subLabel="Benchmark: 50"
          status={n(data.msiScore) < 50 ? 'Underperforming' : 'Outperforming'}
          statusColor={n(data.msiScore) < 50 ? 'text-red-400' : 'text-emerald-400'}
          icon={HeartPulse}
          progress={n(data.msiScore)}
          progressColor="bg-blue-600"
        />
        <HealthCard
          title="COMPOSITE"
          value={f2(data.composite)}
          subLabel="Status"
          status={n(data.composite) < 40 ? 'Weakening' : 'Strengthening'}
          statusColor={n(data.composite) < 40 ? 'text-orange-400' : 'text-blue-400'}
          icon={Layers}
          progress={n(data.composite)}
          progressColor="bg-orange-500"
        />
        <HealthCard
          title="BREADTH SCORE"
          value={f2(data.breadthScore)}
          subLabel="Participation"
          status={n(data.breadthScore) < 40 ? 'Low' : 'High'}
          statusColor={n(data.breadthScore) < 40 ? 'text-slate-400' : 'text-emerald-400'}
          icon={CircleDot}
          progress={n(data.breadthScore)}
          progressColor="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card-dark p-8 rounded-2xl border border-border-dark shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="text-blue-500" size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Index Control Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-12">
            <MetricItem label="Weighted Breadth" value={f2(data.weightedBreadth)} progress={n(data.weightedBreadth)} progressColor="bg-blue-500" />
            <MetricItem label="Influence Concentration" value={f2(data.influenceConcentration)} progress={n(data.influenceConcentration)} progressColor="bg-orange-500" />
            <MetricItem label="Top3 Share" value={f2(data.top3Share)} progress={n(data.top3Share)} progressColor="bg-blue-400" />
            <MetricItem label="Heavyweight Infl." value={f2(data.topHeavyweightInfluenceShare)} progress={n(data.topHeavyweightInfluenceShare)} progressColor="bg-purple-500" />
            <MetricItem label="Bank Share" value={f2(data.bankShare)} progress={n(data.bankShare)} progressColor="bg-slate-500" />
            <MetricItem label="Rotation Delta" value={f2(data.rotationDelta)} progress={n(data.rotationDelta)} progressColor="bg-emerald-500" />
          </div>

          <div className="border-t border-slate-800 pt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Top3 Prop.</p>
              <p className="text-2xl font-bold tabular-nums">{f2(data.top3ProportionShare)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Top3 %Infl.</p>
              <p className="text-2xl font-bold tabular-nums">{f2(data.top3InfluenceShare)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Distortion</p>
              <p className="text-2xl font-bold tabular-nums">{f2(data.distortion)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card-dark p-8 rounded-2xl border border-border-dark shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <AlertTriangle className="text-orange-500" size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Risk & Event Probability</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'BULLTRAP', value: data.bulltrap },
              { label: 'WASHOUT', value: data.washout },
              { label: 'SQUEEZE', value: data.squeeze },
            ].map((risk) => (
              <div key={risk.label} className="bg-slate-800/30 border border-border-dark p-4 rounded-xl text-center">
                <p className="text-[9px] text-slate-500 uppercase mb-1">{risk.label}</p>
                <p className={`text-sm font-bold ${risk.value === 'HIGH' ? 'text-red-500' : risk.value === 'MED' ? 'text-orange-400' : 'text-emerald-500'}`}>{risk.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Regime Status</span>
              <span className="text-xs font-bold px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">{data.regime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Market Structure</span>
              <span className="text-xs font-bold px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 uppercase">{data.structure}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Risk Flag</span>
              <span className="text-sm font-medium text-slate-200">{data.riskFlag}</span>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-800/30 rounded-2xl border border-border-dark">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Index Dependency Risk</span>
              <span className="font-mono text-sm text-red-400 tabular-nums">{n(data.indexDependencyRisk)} / 100</span>
            </div>
            <div className="bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full transition-all duration-1000 ease-out" style={{ width: `${n(data.indexDependencyRisk)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

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
          <p className="text-xl font-bold text-slate-100 tracking-tight">{data.finalVerdict}</p>
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
          <p className="text-xl font-bold text-slate-100 tracking-tight mb-1">{data.actionBias}</p>
          <p className="text-xs text-slate-500 italic">{data.actionWhy}</p>
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
          <p className="text-xl font-bold text-slate-100 tracking-tight">{data.preferredSetup}</p>
        </motion.div>
      </div>
    </div>
  );
}
